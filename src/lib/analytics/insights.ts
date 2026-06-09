import { getAIProvider } from "@/ai/providers";

export async function generateOrgInsights(context: {
  metrics: { label: string; value: string }[];
  weakModules: string[];
  failedAttempts: number;
  chatQuestions: number;
}): Promise<string[]> {
  try {
    const provider = getAIProvider();
    const raw = await provider.chat({
      messages: [
        {
          role: "system",
          content:
            "Eres analista de capacitación empresarial. Genera exactamente 3 hallazgos accionables en español, uno por línea, sin numeración ni markdown.",
        },
        {
          role: "user",
          content: `Métricas: ${JSON.stringify(context.metrics)}
Módulos débiles: ${context.weakModules.join(", ") || "ninguno"}
Actividades fallidas (30d): ${context.failedAttempts}
Consultas al mentor IA (30d): ${context.chatQuestions}`,
        },
      ],
      temperature: 0.4,
      maxTokens: 512,
    });

    return raw
      .split("\n")
      .map((l) => l.replace(/^[-*•\d.]+\s*/, "").trim())
      .filter(Boolean)
      .slice(0, 3);
  } catch {
    return [];
  }
}
