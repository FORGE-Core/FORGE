import { db } from "@/lib/db";

export interface EnrichedSource {
  chunkId: string;
  documentId: string;
  documentTitle: string;
  excerpt: string;
  score: number;
  confidence: "high" | "medium" | "low";
}

export async function enrichRAGSources(
  sources: { chunkId: string; content: string; score: number }[]
): Promise<EnrichedSource[]> {
  if (sources.length === 0) return [];

  const chunks = await db.documentChunk.findMany({
    where: { id: { in: sources.map((s) => s.chunkId) } },
    include: {
      document: { select: { id: true, title: true } },
    },
  });

  const byId = new Map(chunks.map((c) => [c.id, c]));

  return sources.map((s) => {
    const chunk = byId.get(s.chunkId);
    const score = Number(s.score);
    const confidence: EnrichedSource["confidence"] =
      score >= 0.75 ? "high" : score >= 0.45 ? "medium" : "low";

    return {
      chunkId: s.chunkId,
      documentId: chunk?.document.id ?? "",
      documentTitle: chunk?.document.title ?? "Documento",
      excerpt: s.content.slice(0, 200),
      score,
      confidence,
    };
  });
}
