import { getAIProvider } from "@/ai/providers";
import { db } from "@/lib/db";
import type { InclusionAuditResult } from "./types";

function heuristicScore(text: string): InclusionAuditResult {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const words = text.split(/\s+/).filter(Boolean);
  const avgSentenceLen =
    sentences.length > 0 ? words.length / sentences.length : words.length;

  const longSentences = sentences.filter(
    (s) => s.split(/\s+/).length > 25
  ).length;
  const hasHeaders = /^#{1,3}\s/m.test(text) || /\n[A-ZÁÉÍÓÚ][^.]{3,}:\n/m.test(text);
  const hasExamples = /ejemplo|por ejemplo|como cuando|caso práctico/i.test(text);
  const jargon = /(?:procedimiento|protocolo|optimización|implementación|configuración)/gi;
  const jargonHits = (text.match(jargon) ?? []).length;

  const language = Math.max(
    0,
    Math.min(100, 100 - avgSentenceLen * 2 - longSentences * 5 - jargonHits * 3)
  );
  const structure = hasHeaders ? 85 : text.length > 2000 ? 45 : 65;
  const examples = hasExamples ? 90 : 40;
  const clarity = Math.max(0, Math.min(100, 100 - (avgSentenceLen - 12) * 4));

  const overallScore = Math.round(
    (language + structure + examples + clarity) / 4
  );

  const issues: InclusionAuditResult["issues"] = [];
  const recommendations: string[] = [];

  if (avgSentenceLen > 18) {
    issues.push({
      code: "LONG_SENTENCES",
      severity: "medium",
      message: "Frases demasiado largas para lectura fácil",
    });
    recommendations.push("Divide oraciones largas en frases más cortas");
  }
  if (!hasExamples) {
    issues.push({
      code: "NO_EXAMPLES",
      severity: "high",
      message: "Falta de ejemplos prácticos",
    });
    recommendations.push("Agrega ejemplos del día a día en operaciones");
  }
  if (!hasHeaders && text.length > 1500) {
    issues.push({
      code: "WEAK_STRUCTURE",
      severity: "medium",
      message: "Contenido extenso sin secciones claras",
    });
    recommendations.push("Usa títulos y secciones para dividir el contenido");
  }
  if (jargonHits > 5) {
    issues.push({
      code: "JARGON",
      severity: "medium",
      message: "Lenguaje técnico frecuente",
    });
    recommendations.push("Simplifica términos o añade glosario breve");
  }

  if (recommendations.length === 0) {
    recommendations.push("El contenido tiene buena base inclusiva");
  }

  return {
    overallScore,
    dimensions: { language, structure, examples, clarity },
    issues,
    recommendations,
  };
}

async function aiEnhanceAudit(
  text: string,
  base: InclusionAuditResult
): Promise<InclusionAuditResult> {
  try {
    const provider = getAIProvider();
    const raw = await provider.chat({
      messages: [
        {
          role: "system",
          content: `Eres auditor de inclusión y accesibilidad de contenido de capacitación.
Analiza el texto y devuelve SOLO JSON:
{"overallScore":0-100,"issues":[{"code":"","severity":"low|medium|high","message":""}],"recommendations":["..."]}
Considera: lenguaje complejo, falta de ejemplos, estructura, alfabetización digital.`,
        },
        {
          role: "user",
          content: text.slice(0, 8000),
        },
      ],
      temperature: 0.2,
      maxTokens: 1024,
    });
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return base;
    const parsed = JSON.parse(match[0]) as {
      overallScore?: number;
      issues?: InclusionAuditResult["issues"];
      recommendations?: string[];
    };
    return {
      overallScore: parsed.overallScore ?? base.overallScore,
      dimensions: base.dimensions,
      issues: parsed.issues?.length ? parsed.issues : base.issues,
      recommendations: parsed.recommendations?.length
        ? parsed.recommendations
        : base.recommendations,
    };
  } catch {
    return base;
  }
}

export async function auditContentInclusion(
  text: string,
  useAi = true
): Promise<InclusionAuditResult> {
  const base = heuristicScore(text);
  if (!useAi || text.length < 100) return base;
  return aiEnhanceAudit(text, base);
}

export async function saveInclusionAudit({
  organizationId,
  targetType,
  targetId,
  result,
}: {
  organizationId: string;
  targetType: string;
  targetId: string;
  result: InclusionAuditResult;
}) {
  return db.inclusionAudit.create({
    data: {
      organizationId,
      targetType,
      targetId,
      overallScore: result.overallScore,
      dimensions: result.dimensions,
      issues: result.issues,
      recommendations: result.recommendations,
      aiGenerated: true,
    },
  });
}

export async function getLatestInclusionScores(
  organizationId: string,
  targetType: string,
  targetIds: string[]
): Promise<
  Map<string, { score: number; issues: string[]; recommendations: string[] }>
> {
  const map = new Map<
    string,
    { score: number; issues: string[]; recommendations: string[] }
  >();
  if (targetIds.length === 0) return map;

  const audits = await db.inclusionAudit.findMany({
    where: {
      organizationId,
      targetType,
      targetId: { in: targetIds },
    },
    orderBy: { auditedAt: "desc" },
  });

  for (const audit of audits) {
    if (!map.has(audit.targetId)) {
      map.set(audit.targetId, {
        score: audit.overallScore,
        issues: (audit.issues as { message: string }[])
          .slice(0, 2)
          .map((i) => i.message),
        recommendations: (audit.recommendations as string[]).slice(0, 3),
      });
    }
  }

  return map;
}

export async function getInclusionReport(organizationId: string) {
  const audits = await db.inclusionAudit.findMany({
    where: { organizationId },
    orderBy: { auditedAt: "desc" },
    take: 100,
  });

  if (audits.length === 0) {
    return {
      averageScore: 0,
      auditCount: 0,
      lowest: [],
      complexModules: [],
      recommendations: [
        "Sube documentos PDF para generar Inclusion Score automático",
      ],
    };
  }

  const averageScore = Math.round(
    audits.reduce((s, a) => s + a.overallScore, 0) / audits.length
  );

  const lowest = [...audits]
    .sort((a, b) => a.overallScore - b.overallScore)
    .slice(0, 5)
    .map((a) => ({
      targetType: a.targetType,
      targetId: a.targetId,
      score: a.overallScore,
      issues: (a.issues as { message: string }[]).slice(0, 2).map((i) => i.message),
    }));

  const complexModules = [...audits]
    .filter((a) => a.targetType === "MODULE")
    .sort((a, b) => a.overallScore - b.overallScore)
    .slice(0, 5)
    .map((a) => ({
      targetId: a.targetId,
      score: a.overallScore,
      issues: (a.issues as { message: string }[]).slice(0, 2).map((i) => i.message),
      recommendations: (a.recommendations as string[]).slice(0, 2),
    }));

  const allRecs = audits.flatMap((a) => a.recommendations as string[]);
  const recCounts = new Map<string, number>();
  for (const r of allRecs) {
    recCounts.set(r, (recCounts.get(r) ?? 0) + 1);
  }
  const recommendations = [...recCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([text]) => text);

  const { getOrganizationInclusionPolicy } = await import(
    "./organization-policy"
  );
  const policy = await getOrganizationInclusionPolicy(organizationId);
  const belowThreshold = audits.filter(
    (a) => a.overallScore < policy.minAcceptableScore
  ).length;

  if (belowThreshold > 0) {
    recommendations.unshift(
      `${belowThreshold} documento(s) bajo el umbral de inclusión (${policy.minAcceptableScore}%)`
    );
  }

  return {
    averageScore,
    auditCount: audits.length,
    lowest,
    complexModules,
    recommendations,
    policy,
    belowThreshold,
  };
}
