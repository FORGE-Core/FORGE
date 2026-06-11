import { getAIProvider } from "@/ai/providers";
import { buildNovaSystemAugmentation } from "@/lib/alae/prompts";
import type { AlaeContext } from "@/lib/alae/types";
import { db } from "@/lib/db";
import { getEnv } from "@/lib/env";
import { chunkText } from "./chunker";
import { searchSimilarChunks } from "./retriever";

const RAG_SYSTEM_PROMPT = `Eres NOVA, mentor de capacitación empresarial de FORGE.
REGLAS ESTRICTAS:
- Responde ÚNICAMENTE con la información del contexto proporcionado cuando exista.
- Si no hay contexto de documentos, puedes dar orientación general breve sobre capacitación operativa y sugerir que el admin suba manuales.
- Si la respuesta no está en el contexto y la pregunta es específica de la empresa, di: "No encuentro esa información en los materiales de tu empresa. Consulta con tu supervisor o revisa el módulo correspondiente."
- Sé claro, práctico y orientado a operaciones.
- Cita el proceso o documento cuando sea relevante.`;

export interface RAGQueryInput {
  organizationId: string;
  question: string;
  topK?: number;
  alaeContext?: AlaeContext | null;
}

export interface RAGResponse {
  answer: string;
  sources: { chunkId: string; content: string; score: number }[];
}

export async function queryRAG({
  organizationId,
  question,
  topK = 5,
  alaeContext,
}: RAGQueryInput): Promise<RAGResponse> {
  const provider = getAIProvider();
  let sources: RAGResponse["sources"] = [];
  let context =
    "Aún no hay documentos indexados para esta organización. Responde de forma general y útil sobre capacitación empresarial.";

  const ragEnabled = getEnv("RAG_ENABLED") === "true";

  if (ragEnabled) {
    try {
      const [queryEmbedding] = await provider.embed({ input: question });
      sources = await searchSimilarChunks({
        organizationId,
        embedding: queryEmbedding,
        topK,
      });

      if (sources.length > 0) {
        context = sources
          .map((s, i) => `[Fuente ${i + 1}]\n${s.content}`)
          .join("\n\n---\n\n");
      }
    } catch (err) {
      console.warn("[RAG] embeddings/búsqueda omitidos:", err);
    }
  } else {
    const chunks = await db.documentChunk.findMany({
      where: { organizationId },
      take: topK,
      orderBy: { createdAt: "desc" },
    });
    if (chunks.length > 0) {
      sources = chunks.map((c) => ({
        chunkId: c.id,
        content: c.content,
        score: 0,
      }));
      context = sources
        .map((s, i) => `[Fuente ${i + 1}]\n${s.content}`)
        .join("\n\n---\n\n");
    }
  }

  const systemPrompt =
    RAG_SYSTEM_PROMPT + buildNovaSystemAugmentation(alaeContext ?? null);

  const answer = await provider.chat({
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Contexto empresarial:\n${context}\n\n---\n\nPregunta del empleado: ${question}`,
      },
    ],
    temperature: 0.2,
  });

  return { answer, sources };
}

export async function ingestDocumentText(
  organizationId: string,
  documentId: string,
  rawText: string
) {
  const provider = getAIProvider();
  const chunks = chunkText(rawText);
  const embeddings = await provider.embed({
    input: chunks.map((c) => c.content),
  });

  return { chunks, embeddings, organizationId, documentId };
}
