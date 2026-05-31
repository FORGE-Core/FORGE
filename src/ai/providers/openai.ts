import type { AIProvider, ChatCompletionOptions, EmbeddingOptions } from "./types";

async function parseOpenAIError(res: Response, label: string): Promise<never> {
  let detail = res.statusText;
  try {
    const body = (await res.json()) as {
      error?: { message?: string; type?: string };
    };
    detail = body.error?.message ?? detail;
  } catch {
    /* respuesta no JSON */
  }

  if (res.status === 401) {
    throw new Error(
      `${label}: API key inválida o revocada. Verifica OPENAI_API_KEY en .env y reinicia el servidor.`
    );
  }
  if (res.status === 429) {
    throw new Error(
      `${label}: límite de uso alcanzado. Espera un momento o revisa tu plan en OpenAI.`
    );
  }

  throw new Error(`${label} (${res.status}): ${detail}`);
}

export function createOpenAIProvider(apiKey: string): AIProvider {
  const baseUrl = "https://api.openai.com/v1";

  return {
    id: "openai",

    async chat({ messages, temperature = 0.3, maxTokens = 2048 }: ChatCompletionOptions) {
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages,
          temperature,
          max_tokens: maxTokens,
        }),
      });
      if (!res.ok) await parseOpenAIError(res, "OpenAI chat");
      const data = await res.json();
      return data.choices[0]?.message?.content ?? "";
    },

    async *chatStream({ messages, temperature = 0.3 }: ChatCompletionOptions) {
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages,
          temperature,
          stream: true,
        }),
      });
      if (!res.ok) await parseOpenAIError(res, "OpenAI stream");
      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ") || line === "data: [DONE]") continue;
          try {
            const parsed = JSON.parse(line.slice(6));
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) yield delta;
          } catch {
            /* skip malformed */
          }
        }
      }
    },

    async embed({ input }: EmbeddingOptions) {
      const res = await fetch(`${baseUrl}/embeddings`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.EMBEDDING_MODEL ?? "text-embedding-3-small",
          input,
        }),
      });
      if (!res.ok) await parseOpenAIError(res, "OpenAI embeddings");
      const data = await res.json();
      return data.data.map((d: { embedding: number[] }) => d.embedding);
    },
  };
}
