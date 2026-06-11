import { db } from "@/lib/db";
import { buildLearningPredictions } from "./predictions";
import { inferPreferredModality } from "./learning-profile";

export async function getLearningPatternReport(organizationId: string) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [profiles, events, attempts] = await Promise.all([
    db.learningProfile.findMany({
      where: { organizationId },
      include: { user: { select: { name: true, email: true, role: true } } },
    }),
    db.accessibilityEvent.findMany({
      where: { organizationId, createdAt: { gte: thirtyDaysAgo } },
      select: { eventType: true, createdAt: true, userId: true },
    }),
    db.activityAttempt.groupBy({
      by: ["passed"],
      where: {
        user: { organizationId },
        createdAt: { gte: thirtyDaysAgo },
      },
      _count: true,
    }),
  ]);

  const modalityTotals = {
    READING: 0,
    LISTENING: 0,
    VISUAL: 0,
    PRACTICE: 0,
  };

  const supportCounts: Record<string, number> = {
    STANDARD: 0,
    GUIDED: 0,
    SIMPLIFIED: 0,
    INTENSIVE: 0,
  };

  for (const p of profiles) {
    const mod = inferPreferredModality(p);
    if (mod !== "MIXED") modalityTotals[mod]++;
    supportCounts[p.supportLevel] = (supportCounts[p.supportLevel] ?? 0) + 1;
  }

  const eventByType = new Map<string, number>();
  const hourBuckets = new Array(24).fill(0) as number[];

  for (const e of events) {
    eventByType.set(e.eventType, (eventByType.get(e.eventType) ?? 0) + 1);
    hourBuckets[e.createdAt.getHours()]++;
  }

  const peakHour = hourBuckets.indexOf(Math.max(...hourBuckets));
  const passed = attempts.find((a) => a.passed)?._count ?? 0;
  const failed = attempts.find((a) => !a.passed)?._count ?? 0;
  const passRate =
    passed + failed > 0 ? Math.round((passed / (passed + failed)) * 100) : 0;

  const dominantModality = (
    Object.entries(modalityTotals).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "MIXED"
  ) as keyof typeof modalityTotals;

  const insights: string[] = [];

  if (modalityTotals.PRACTICE > modalityTotals.READING) {
    insights.push(
      "El equipo aprende más haciendo — prioriza simulaciones y actividades prácticas."
    );
  }
  if (supportCounts.SIMPLIFIED + supportCounts.INTENSIVE > profiles.length * 0.3) {
    insights.push(
      "Más del 30% necesita soporte simplificado — revisa claridad de manuales."
    );
  }
  if (passRate < 70 && failed > 0) {
    insights.push(
      `Tasa de aprobación en quizzes: ${passRate}%. Considera contenido más visual o paso a paso.`
    );
  }
  if (peakHour >= 0) {
    insights.push(
      `Mayor actividad ALAE entre las ${peakHour}:00 y ${peakHour + 1}:00 hrs.`
    );
  }
  if (insights.length === 0) {
    insights.push("Patrones estables — continúa monitoreando con ALAE.");
  }

  const topLearners = profiles
    .map((p) => ({
      name: p.user.name ?? p.user.email,
      modality: inferPreferredModality(p),
      supportLevel: p.supportLevel,
      total:
        p.readingCount +
        p.listeningCount +
        p.visualCount +
        p.practiceCount,
    }))
    .filter((l) => l.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const predictions = buildLearningPredictions({
    dominantModality,
    passRate,
    supportCounts,
    peakHour,
  });

  return {
    userCount: profiles.length,
    modalityTotals,
    dominantModality,
    supportCounts,
    passRate,
    peakHour,
    eventByType: Object.fromEntries(eventByType),
    insights,
    topLearners,
    predictions,
  };
}
