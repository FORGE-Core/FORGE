import { getEnv } from "@/lib/env";

/** Dimensiones del vector según proveedor (Gemini ≈ 768, OpenAI text-embedding-3 ≈ 1536). */
export function getEmbeddingDimensions(): number {
  const raw = getEnv("EMBEDDING_DIMENSIONS");
  const n = raw ? parseInt(raw, 10) : 768;
  return Number.isFinite(n) && n > 0 ? n : 768;
}
