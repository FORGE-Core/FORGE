import { getAlaeContextForUser } from "@/lib/alae/accessibility-profile";
import { buildAlaeRecommendations } from "@/lib/alae/recommendations";
import { db } from "@/lib/db";
import { formatDuration } from "@/lib/training/format";
import type { ServiceContext } from "@/services/server/types";
import { getOrganizationModules } from "@/services/server/training/modules.service";

function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `Hace ${Math.max(1, mins)} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Ayer";
  return `Hace ${days} días`;
}

export async function getDashboardData(
  ctx: ServiceContext,
  userName: string | null | undefined,
  orgName: string
) {
  const { organizationId, userId } = ctx;

  const [modules, alaeContext] = await Promise.all([
    getOrganizationModules(organizationId, userId),
    getAlaeContextForUser(userId, organizationId),
  ]);

  const completed = modules.filter((m) => m.status === "completed").length;
  const pending = modules.filter((m) => m.status !== "completed").length;
  const overallProgress = modules.length
    ? Math.round(
        modules.reduce((sum, m) => sum + m.progress, 0) / modules.length
      )
    : 0;

  const [attemptCount, avgScore, timeAgg, recentAttempts, recentMessages, completedModules] =
    await Promise.all([
      db.activityAttempt.count({ where: { userId } }),
      db.activityAttempt.aggregate({
        where: { userId, score: { not: null } },
        _avg: { score: true },
      }),
      db.userProgress.aggregate({
        where: { userId },
        _sum: { timeSpentSecs: true },
      }),
      db.activityAttempt.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 3,
        include: {
          activity: {
            include: { module: { select: { title: true, slug: true } } },
          },
        },
      }),
      db.message.findMany({
        where: {
          conversation: { userId, organizationId },
          role: "user",
        },
        orderBy: { createdAt: "desc" },
        take: 2,
        select: { content: true, createdAt: true },
      }),
      db.userProgress.findMany({
        where: {
          userId,
          percentComplete: { gte: 100 },
          completedAt: { not: null },
        },
        orderBy: { completedAt: "desc" },
        take: 2,
        include: { module: { select: { title: true } } },
      }),
    ]);

  const totalSecs = timeAgg._sum.timeSpentSecs ?? 0;
  const trainingHours =
    totalSecs >= 3600
      ? `${Math.round(totalSecs / 3600)}h`
      : totalSecs >= 60
        ? `${Math.round(totalSecs / 60)}m`
        : "0m";

  const avgPct = avgScore._avg.score
    ? `${Math.round(avgScore._avg.score)}%`
    : "—";

  const kpis = [
    {
      title: "Módulos completados",
      value: String(completed),
      change: `${modules.length} en total`,
      trend: "up" as const,
      icon: "book",
    },
    {
      title: "Módulos pendientes",
      value: String(pending),
      change: pending > 0 ? "Prioridad alta" : "Al día",
      trend: pending > 0 ? ("neutral" as const) : ("up" as const),
      icon: "clock",
    },
    {
      title: "Tiempo de capacitación",
      value: trainingHours,
      change: formatDuration(Math.round(totalSecs / 60)) || "—",
      trend: "up" as const,
      icon: "time",
    },
    {
      title: "Actividades realizadas",
      value: String(attemptCount),
      change: attemptCount > 0 ? "Registradas en BD" : "Sin intentos aún",
      trend: "neutral" as const,
      icon: "zap",
    },
    {
      title: "Puntaje promedio",
      value: avgPct,
      change: attemptCount > 0 ? "En quizzes" : "—",
      trend: "up" as const,
      icon: "target",
    },
    {
      title: "Progreso general",
      value: `${overallProgress}%`,
      change: orgName,
      trend: "up" as const,
      icon: "sparkles",
    },
  ];

  const recentActivity: {
    id: string;
    text: string;
    time: string;
    type: string;
    at: number;
  }[] = [];

  for (const a of recentAttempts) {
    recentActivity.push({
      id: `attempt-${a.id}`,
      text: `${a.passed ? "Completaste" : "Intentaste"} "${a.activity.title}"`,
      time: relativeTime(a.createdAt),
      type: "quiz",
      at: a.createdAt.getTime(),
    });
  }

  for (const m of recentMessages) {
    recentActivity.push({
      id: `chat-${m.createdAt.getTime()}`,
      text: `Consultaste al mentor: "${m.content.slice(0, 50)}…"`,
      time: relativeTime(m.createdAt),
      type: "ai",
      at: m.createdAt.getTime(),
    });
  }

  for (const p of completedModules) {
    if (p.completedAt) {
      recentActivity.push({
        id: `module-${p.moduleId}`,
        text: `Terminaste "${p.module.title}"`,
        time: relativeTime(p.completedAt),
        type: "complete",
        at: p.completedAt.getTime(),
      });
    }
  }

  recentActivity.sort((a, b) => b.at - a.at);

  const weakModules = modules
    .filter((m) => m.status === "in_progress" && m.progress < 70)
    .slice(0, 3);

  const recommendations = weakModules.map((m) => ({
    topic: m.title,
    reason: `Tu avance es ${m.progress}% — conviene reforzar este módulo`,
    slug: m.slug,
  }));

  if (recommendations.length === 0 && pending > 0) {
    const next = modules.find((m) => m.status === "pending");
    if (next) {
      recommendations.push({
        topic: next.title,
        reason: "Módulo pendiente por iniciar",
        slug: next.slug,
      });
    }
  }

  const nextModule =
    modules.find((m) => m.status === "in_progress") ??
    modules.find((m) => m.status === "pending");

  const alaeRecommendations = buildAlaeRecommendations({
    preferredModality: alaeContext.learning.preferredModality,
    supportLevel: alaeContext.learning.supportLevel,
    declaredNeeds: alaeContext.declaredNeeds,
    pendingModule: nextModule
      ? { title: nextModule.title, slug: nextModule.slug }
      : null,
  });

  const mergedRecommendations = [
    ...alaeRecommendations.map((r) => ({
      topic: r.topic,
      reason: r.reason,
      slug: r.href.includes("/modules/")
        ? r.href.split("/modules/")[1]
        : undefined,
      href: r.href,
    })),
    ...recommendations,
  ].slice(0, 4);

  const firstName = userName?.split(" ")[0] ?? "equipo";
  const level = Math.min(10, Math.max(1, Math.floor(overallProgress / 10) + 1));

  return {
    user: {
      name: firstName,
      fullName: userName ?? "Usuario",
      overallProgress,
      level,
      levelTitle:
        overallProgress >= 80
          ? "Operador experto"
          : overallProgress >= 50
            ? "Operador certificado"
            : "En formación",
      avatarInitials: (userName ?? "U")
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      pendingCount: pending,
    },
    kpis,
    recentActivity: recentActivity.slice(0, 6),
    recommendations: mergedRecommendations,
    alae: {
      preferredModality: alaeContext.learning.preferredModality,
      supportLevel: alaeContext.learning.supportLevel,
      simplifiedLanguage: alaeContext.accessibility.simplifiedLanguage,
      stepByStepMode: alaeContext.accessibility.stepByStepMode,
      recommendations: alaeRecommendations,
    },
    featuredModules: modules
      .filter((m) => m.status !== "completed")
      .slice(0, 3),
    highlightModules: modules.slice(0, 3),
    nextModule: nextModule
      ? { title: nextModule.title, slug: nextModule.slug }
      : null,
  };
}
