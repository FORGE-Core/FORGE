import type { AIProvider, ChatCompletionOptions, EmbeddingOptions } from "./types";

export function createOllamaProvider(
  baseUrl = "http://localhost:11434",
  model = "llama3"
): AIProvider {
  return {
    id: "ollama",

    async chat({ messages, temperature = 0.3 }: ChatCompletionOptions) {
      const res = await fetch(`${baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, messages, stream: false, options: { temperature } }),
      });
      if (!res.ok) throw new Error(`Ollama error: ${res.statusText}`);
      const data = await res.json();
      return data.message?.content ?? "";
    },

    async *chatStream({ messages, temperature = 0.3 }: ChatCompletionOptions) {
      const res = await fetch(`${baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, messages, stream: true, options: { temperature } }),
      });
      if (!res.ok) throw new Error(`Ollama stream error: ${res.statusText}`);
      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value).split("\n")) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            if (parsed.message?.content) yield parsed.message.content;
          } catch {
            /* skip */
          }
        }
      }
    },

    async embed({ input }: EmbeddingOptions) {
      const texts = Array.isArray(input) ? input : [input];
      const results: number[][] = [];
      for (const text of texts) {
        const res = await fetch(`${baseUrl}/api/embeddings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model: "nomic-embed-text", prompt: text }),
        });
        if (!res.ok) throw new Error(`Ollama embed error: ${res.statusText}`);
        const data = await res.json();
        results.push(data.embedding);
      }
      return results;
    },
  };
}
