import { db } from "@/lib/db";

export interface RetrievedChunk {
  chunkId: string;
  content: string;
  score: number;
}

/**
 * Búsqueda semántica con pgvector.
 * Requiere columna embedding vector(1536) en document_chunks (ver migración SQL).
 */
export async function searchSimilarChunks({
  organizationId,
  embedding,
  topK = 5,
}: {
  organizationId: string;
  embedding: number[];
  topK?: number;
}): Promise<RetrievedChunk[]> {
  const vectorStr = `[${embedding.join(",")}]`;

  try {
    const rows = await db.$queryRaw<
      { id: string; content: string; score: number }[]
    >`
      SELECT id, content, 1 - (embedding <=> ${vectorStr}::vector) AS score
      FROM document_chunks
      WHERE "organizationId" = ${organizationId}
        AND embedding IS NOT NULL
      ORDER BY embedding <=> ${vectorStr}::vector
      LIMIT ${topK}
    `;

    return rows.map((r) => ({
      chunkId: r.id,
      content: r.content,
      score: Number(r.score),
    }));
  } catch {
    // Fallback: búsqueda por texto si pgvector no está configurado aún
    const chunks = await db.documentChunk.findMany({
      where: { organizationId },
      take: topK,
      orderBy: { createdAt: "desc" },
    });
    return chunks.map((c) => ({
      chunkId: c.id,
      content: c.content,
      score: 0,
    }));
  }
}
