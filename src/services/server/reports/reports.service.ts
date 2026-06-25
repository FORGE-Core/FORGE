import { db } from "@/lib/db";
import { isAdmin, isSupervisor } from "@/lib/auth/roles";
import { generateOrgInsights } from "@/lib/analytics/insights";
import type { OrganizationContext } from "@/services/server/types";
import { ServiceError } from "@/services/server/errors";

export async function getReportsOverview(ctx: OrganizationContext) {
  const { organizationId, role } = ctx;

  if (!isAdmin(role) && !isSupervisor(role)) {
    throw new ServiceError("FORBIDDEN", "Sin permiso para ver reportes");
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    activeUsers,
    publishedModules,
    completedProgress,
    totalAttempts,
    failedAttempts,
    weakModules,
    learningEvents,
    inclusionAudits,
  ] = await Promise.all([
    db.user.count({
      where: { organizationId, status: "ACTIVE" },
    }),
    db.trainingModule.count({
      where: { organizationId, status: "PUBLISHED" },
    }),
    db.userProgress.count({
      where: { module: { organizationId }, percentComplete: { gte: 100 } },
    }),
    db.activityAttempt.count({
      where: { activity: { organizationId } },
    }),
    db.activityAttempt.count({
      where: {
        activity: { organizationId },
        passed: false,
        createdAt: { gte: thirtyDaysAgo },
      },
    }),
    db.userProgress.groupBy({
      by: ["moduleId"],
      where: { module: { organizationId } },
      _avg: { percentComplete: true },
      _count: true,
      orderBy: { _avg: { percentComplete: "asc" } },
      take: 5,
    }),
    db.learningEvent.groupBy({
      by: ["eventType"],
      where: { organizationId, createdAt: { gte: thirtyDaysAgo } },
      _count: true,
      orderBy: { _count: { eventType: "desc" } },
      take: 5,
    }),
    db.inclusionAudit.findMany({
      where: { organizationId },
      select: { overallScore: true },
      take: 100,
      orderBy: { auditedAt: "desc" },
    }),
  ]);

  const inclusionAverage =
    inclusionAudits.length > 0
      ? Math.round(
          inclusionAudits.reduce((s, a) => s + a.overallScore, 0) /
            inclusionAudits.length
        )
      : null;

  const moduleTitles = await db.trainingModule.findMany({
    where: {
      organizationId,
      id: { in: weakModules.map((m) => m.moduleId) },
    },
    select: { id: true, title: true },
  });
  const titleById = new Map(moduleTitles.map((m) => [m.id, m.title]));

  const avgProgress = await db.userProgress.aggregate({
    where: { module: { organizationId } },
    _avg: { percentComplete: true },
  });

  const metrics = [
    {
      label: "Usuarios activos",
      value: String(activeUsers),
      change: "En tu organización",
    },
    {
      label: "Progreso promedio",
      value: `${Math.round(avgProgress._avg.percentComplete ?? 0)}%`,
      change: "Todos los módulos",
    },
    {
      label: "Módulos completados",
      value: String(completedProgress),
      change: `${publishedModules} publicados`,
    },
    {
      label: "Actividades realizadas",
      value: String(totalAttempts),
      change: `${failedAttempts} no aprobadas (30d)`,
    },
  ];

  const insights: string[] = [];
  for (const m of weakModules) {
    const avg = Math.round(m._avg.percentComplete ?? 0);
    if (avg < 70) {
      insights.push(
        `"${titleById.get(m.moduleId) ?? "Módulo"}" tiene promedio bajo (${avg}%) entre el equipo.`
      );
    }
  }

  const chatCount =
    learningEvents.find((e) => e.eventType === "CHAT_QUESTION")?._count ?? 0;
  if (chatCount > 5) {
    insights.push(
      `El mentor IA recibió ${chatCount} consultas en los últimos 30 días.`
    );
  }

  if (insights.length === 0) {
    insights.push(
      "Aún no hay suficientes datos. Invita empleados y asigna actividades."
    );
  }

  const aiInsights = await generateOrgInsights({
    metrics: metrics.map((m) => ({ label: m.label, value: m.value })),
    weakModules: weakModules.map(
      (m) => titleById.get(m.moduleId) ?? "Módulo"
    ),
    failedAttempts,
    chatQuestions: chatCount,
  });

  const recommendations = [
    failedAttempts > 0
      ? "Revisa módulos con actividades fallidas y actualiza el material."
      : "Mantén los manuales actualizados en Documentos.",
    "Usa el mentor IA para detectar preguntas recurrentes sin respuesta en docs.",
    publishedModules < 3
      ? "Publica al menos 3 módulos para un programa mínimo viable."
      : "Programa simulaciones prácticas por turno.",
  ];

  if (inclusionAverage !== null && inclusionAverage < 65) {
    recommendations.unshift(
      `Inclusion Score promedio bajo (${inclusionAverage}%). Revisa documentos en ALAE.`
    );
  }

  return {
    metrics,
    insights,
    aiInsights: aiInsights.length > 0 ? aiInsights : insights.slice(0, 3),
    recommendations,
    inclusion: {
      averageScore: inclusionAverage,
      auditCount: inclusionAudits.length,
    },
  };
}
