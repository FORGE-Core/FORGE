import { getAIProvider } from "@/ai/providers";
import { db } from "@/lib/db";
import { getEnv } from "@/lib/env";
import { getEmbeddingDimensions } from "./dimensions";

function hasEmbeddingProvider(): boolean {
  const provider = getEnv("AI_DEFAULT_PROVIDER") ?? "gemini";
  if (provider === "gemini") return !!getEnv("GEMINI_API_KEY");
  if (provider === "openai") return !!getEnv("OPENAI_API_KEY");
  return provider === "ollama";
}

/**
 * Genera embeddings y los guarda en document_chunks.embedding (pgvector).
 * Si falla (sin API key o sin columna), no interrumpe el flujo principal.
 */
export async function embedDocumentChunks(
  documentId: string,
  organizationId: string
): Promise<{ embedded: number; skipped: boolean }> {
  if (!hasEmbeddingProvider()) {
    return { embedded: 0, skipped: true };
  }

  const chunks = await db.documentChunk.findMany({
    where: { documentId, organizationId },
    orderBy: { chunkIndex: "asc" },
    select: { id: true, content: true },
  });

  if (chunks.length === 0) return { embedded: 0, skipped: false };

  try {
    const provider = getAIProvider();
    const vectors = await provider.embed({
      input: chunks.map((c) => c.content),
    });

    const dims = getEmbeddingDimensions();

    for (let i = 0; i < chunks.length; i++) {
      const vec = vectors[i];
      if (!vec || vec.length !== dims) {
        console.warn(
          `[embed] chunk ${chunks[i].id}: dimensión ${vec?.length ?? 0} ≠ ${dims} (ajusta EMBEDDING_DIMENSIONS y prisma/supabase-setup.sql)`
        );
        continue;
      }
      const vectorStr = `[${vec.join(",")}]`;
      await db.$executeRaw`
        UPDATE document_chunks
        SET embedding = ${vectorStr}::vector
        WHERE id = ${chunks[i].id}
      `;
    }

    return { embedded: Math.min(chunks.length, vectors.length), skipped: false };
  } catch (err) {
    console.warn("[embed] No se pudieron guardar embeddings:", err);
    return { embedded: 0, skipped: true };
  }
}
