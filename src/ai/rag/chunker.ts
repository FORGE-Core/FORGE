const DEFAULT_CHUNK_SIZE = 800;
const DEFAULT_OVERLAP = 100;

export interface TextChunk {
  content: string;
  index: number;
  tokenCount?: number;
}

export function chunkText(
  text: string,
  chunkSize = DEFAULT_CHUNK_SIZE,
  overlap = DEFAULT_OVERLAP
): TextChunk[] {
  const chunks: TextChunk[] = [];
  let start = 0;
  let index = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const content = text.slice(start, end).trim();
    if (content.length > 0) {
      chunks.push({ content, index, tokenCount: Math.ceil(content.length / 4) });
      index++;
    }
    start += chunkSize - overlap;
  }

  return chunks;
}
