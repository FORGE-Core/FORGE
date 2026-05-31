import { chunkText } from "@/ai/rag/chunker";
import { db } from "@/lib/db";
import { extractText, getDocumentProxy } from "unpdf";

export async function extractPdfText(buffer: Buffer): Promise<string> {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: true });

  const fullText = (Array.isArray(text) ? text.join("\n\n") : text)?.trim() ?? "";

  if (!fullText) {
    throw new Error(
      "No se pudo extraer texto del PDF (¿está escaneado sin OCR o está vacío?)"
    );
  }

  return fullText;
}

export async function processDocumentContent({
  organizationId,
  documentId,
  text,
}: {
  organizationId: string;
  documentId: string;
  text: string;
}) {
  const chunks = chunkText(text);

  await db.$transaction(async (tx) => {
    await tx.documentChunk.deleteMany({ where: { documentId } });

    if (chunks.length > 0) {
      await tx.documentChunk.createMany({
        data: chunks.map((chunk) => ({
          organizationId,
          documentId,
          content: chunk.content,
          chunkIndex: chunk.index,
          tokenCount: chunk.tokenCount,
        })),
      });
    }

    await tx.document.update({
      where: { id: documentId },
      data: {
        status: "READY",
        metadata: {
          chunkCount: chunks.length,
          processedAt: new Date().toISOString(),
        },
      },
    });
  });

  return chunks.length;
}
