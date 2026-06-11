import type { LearningModality } from "@prisma/client";

export type LearningPrediction = {
  label: string;
  confidence: number;
  action: string;
  href: string;
};

export function buildLearningPredictions({
  dominantModality,
  passRate,
  supportCounts,
  peakHour,
}: {
  dominantModality: LearningModality | string;
  passRate: number;
  supportCounts: Record<string, number>;
  peakHour: number;
}): LearningPrediction[] {
  const preds: LearningPrediction[] = [];
  const simplified =
    (supportCounts.SIMPLIFIED ?? 0) + (supportCounts.INTENSIVE ?? 0);

  if (dominantModality === "PRACTICE") {
    preds.push({
      label: "Más simulaciones esta semana",
      confidence: 82,
      action: "El equipo responde mejor practicando escenarios.",
      href: "/dashboard/simulations",
    });
  }

  if (dominantModality === "LISTENING" || dominantModality === "READING") {
    preds.push({
      label: "Reforzar contenido en audio/texto",
      confidence: 76,
      action: "Prioriza NOVA con lectura automática y resúmenes.",
      href: "/dashboard/chat",
    });
  }

  if (passRate < 75) {
    preds.push({
      label: "Riesgo de abandono en quizzes",
      confidence: Math.min(90, 100 - passRate),
      action: "Activa modo paso a paso y simplifica manuales.",
      href: "/dashboard/reports/inclusion",
    });
  }

  if (simplified > 0) {
    preds.push({
      label: "Soporte simplificado en aumento",
      confidence: 70,
      action: "Audita documentos con menor Inclusion Score.",
      href: "/dashboard/reports/inclusion",
    });
  }

  if (peakHour >= 0) {
    preds.push({
      label: `Ventana óptima de capacitación: ${peakHour}:00`,
      confidence: 65,
      action: "Programa recordatorios push en esa franja horaria.",
      href: "/dashboard/profile",
    });
  }

  return preds.slice(0, 4);
}
