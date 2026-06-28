import { getOrganizationModules } from "@/services/server/training/modules.service";
import type { ServiceContext } from "@/services/server/types";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  SUPERVISOR: "Supervisor",
  EMPLOYEE: "Empleado",
};

export async function getProfileData(
  ctx: ServiceContext,
  user: {
    name: string | null;
    email: string;
    role: string;
  },
  orgName: string
) {
  const modules = await getOrganizationModules(
    ctx.organizationId,
    ctx.userId,
    ctx.db
  );
  const completed = modules.filter((m) => m.status === "completed").length;
  const attemptCount = await ctx.db.activityAttempt.count({
    where: { userId: ctx.userId },
  });
  const simCount = await ctx.db.activityAttempt.count({
    where: {
      userId: ctx.userId,
      activity: { type: "CASE_STUDY" },
    },
  });

  const skills = modules.slice(0, 4).map((m) => ({
    name: m.title,
    pct: m.progress,
  }));

  const achievements: { title: string; icon: string }[] = [];
  if (completed >= 1) {
    achievements.push({ title: "Primer módulo completado", icon: "🎯" });
  }
  if (attemptCount >= 5) {
    achievements.push({ title: "5 actividades realizadas", icon: "⚡" });
  }
  if (modules.some((m) => m.progress >= 90)) {
    achievements.push({ title: "Dominio de módulo", icon: "📦" });
  }
  if (completed >= 3) {
    achievements.push({ title: "Aprendiz destacado", icon: "⭐" });
  }

  const fullName = user.name ?? user.email.split("@")[0];
  const overallProgress = modules.length
    ? Math.round(
        modules.reduce((s, m) => s + m.progress, 0) / modules.length
      )
    : 0;

  return {
    fullName,
    role: ROLE_LABELS[user.role] ?? user.role,
    company: orgName,
    level: Math.min(10, Math.max(1, Math.floor(overallProgress / 10) + 1)),
    overallProgress,
    avatarInitials: fullName
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    skills,
    achievements,
    summary: [
      { label: "Módulos", value: String(modules.length) },
      { label: "Completados", value: String(completed) },
      { label: "Actividades", value: String(attemptCount) },
      { label: "Simulaciones", value: String(simCount) },
    ],
  };
}
