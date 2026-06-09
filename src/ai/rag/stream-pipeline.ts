import { getAIProvider } from "@/ai/providers";
import { getEnv } from "@/lib/env";
import { db } from "@/lib/db";
import { searchSimilarChunks } from "./retriever";

const RAG_SYSTEM_PROMPT = `Eres un mentor de capacitación empresarial de FORGE.
REGLAS ESTRICTAS:
- Responde ÚNICAMENTE con la información del contexto proporcionado cuando exista.
- Si no hay contexto, orienta brevemente y sugiere subir manuales.
- Si la pregunta es específica de la empresa y no está en el contexto, indícalo claramente.
- Sé claro, práctico y orientado a operaciones.`;

export async function prepareRAGContext(
  organizationId: string,
  question: string,
  topK = 5
) {
  let sources: { chunkId: string; content: string; score: number }[] = [];
  let context =
    "Aún no hay documentos indexados para esta organización.";

  const ragEnabled = getEnv("RAG_ENABLED") === "true";

  if (ragEnabled) {
    try {
      const provider = getAIProvider();
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
      console.warn("[RAG stream] búsqueda omitida:", err);
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

  return { context, sources };
}

export async function* streamRAGAnswer({
  organizationId,
  question,
}: {
  organizationId: string;
  question: string;
}) {
  const { context } = await prepareRAGContext(organizationId, question);
  const provider = getAIProvider();

  if (provider.chatStream) {
    const stream = provider.chatStream({
      messages: [
        { role: "system", content: RAG_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Contexto de documentos:\n${context}\n\nPregunta: ${question}`,
        },
      ],
      temperature: 0.3,
      maxTokens: 2048,
    });
    for await (const chunk of stream) {
      yield chunk;
    }
    return;
  }

  const answer = await provider.chat({
    messages: [
      { role: "system", content: RAG_SYSTEM_PROMPT },
      {
        role: "user",
        content: `Contexto de documentos:\n${context}\n\nPregunta: ${question}`,
      },
    ],
    temperature: 0.3,
    maxTokens: 2048,
  });

  const words = answer.split(/(\s+)/);
  for (const word of words) {
    yield word;
    await new Promise((r) => setTimeout(r, 12));
  }
}
