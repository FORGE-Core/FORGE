import type { AIProvider, ChatCompletionOptions, ChatMessage, EmbeddingOptions } from "./types";

const DEFAULT_CHAT_MODEL = "claude-opus-4-8";
const ANTHROPIC_VERSION = "2023-06-01";

/**
 * Claude no expone un endpoint de embeddings. El proveedor de Anthropic se usa
 * solo para chat; los embeddings deben generarse con OpenAI o Gemini
 * (configura EMBEDDING_PROVIDER en .env).
 */
const EMBED_NOT_SUPPORTED =
  "Anthropic no ofrece un endpoint de embeddings. Usa AI_DEFAULT_PROVIDER=anthropic solo para chat y configura openai o gemini como proveedor de embeddings.";

async function parseAnthropicError(res: Response, label: string): Promise<never> {
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
      `${label}: API key inválida o revocada. Verifica ANTHROPIC_API_KEY en .env y reinicia el servidor.`
    );
  }
  if (res.status === 429) {
    throw new Error(
      `${label}: límite de uso alcanzado. Espera un momento o revisa tu plan en console.anthropic.com.`
    );
  }

  throw new Error(`${label} (${res.status}): ${detail}`);
}

/**
 * La Messages API de Anthropic separa el prompt de sistema (campo `system`)
 * de la conversación, y exige que los roles user/assistant alternen. Aquí
 * fusionamos los mensajes de sistema y colapsamos roles consecutivos.
 */
function toAnthropicPayload(messages: ChatMessage[]) {
  let system: string | undefined;
  const turns: { role: "user" | "assistant"; content: string }[] = [];

  for (const msg of messages) {
    if (msg.role === "system") {
      system = system ? `${system}\n\n${msg.content}` : msg.content;
      continue;
    }
    const role = msg.role === "assistant" ? "assistant" : "user";
    const last = turns[turns.length - 1];
    if (last && last.role === role) {
      last.content += `\n\n${msg.content}`;
    } else {
      turns.push({ role, content: msg.content });
    }
  }

  return { system, messages: turns };
}

export function createAnthropicProvider(
  apiKey: string,
  chatModel = getModelEnv("ANTHROPIC_MODEL", DEFAULT_CHAT_MODEL)
): AIProvider {
  const baseUrl = "https://api.anthropic.com/v1";
  const headers = {
    "x-api-key": apiKey,
    "anthropic-version": ANTHROPIC_VERSION,
    "Content-Type": "application/json",
  };

  // Los modelos Claude 4.x rechazan `temperature`; omitirla es válido en todos
  // los modelos, por lo que no la enviamos para mantener el proveedor genérico.

  return {
    id: "anthropic",

    async chat({ messages, maxTokens = 2048 }: ChatCompletionOptions) {
      const { system, messages: turns } = toAnthropicPayload(messages);
      const res = await fetch(`${baseUrl}/messages`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: chatModel,
          max_tokens: maxTokens,
          ...(system && { system }),
          messages: turns,
        }),
      });
      if (!res.ok) await parseAnthropicError(res, "Anthropic chat");
      const data = (await res.json()) as {
        content?: { type: string; text?: string }[];
      };
      return (
        data.content
          ?.filter((b) => b.type === "text")
          .map((b) => b.text ?? "")
          .join("") ?? ""
      );
    },

    async *chatStream({ messages, maxTokens = 2048 }: ChatCompletionOptions) {
      const { system, messages: turns } = toAnthropicPayload(messages);
      const res = await fetch(`${baseUrl}/messages`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: chatModel,
          max_tokens: maxTokens,
          stream: true,
          ...(system && { system }),
          messages: turns,
        }),
      });
      if (!res.ok) await parseAnthropicError(res, "Anthropic stream");
      if (!res.body) throw new Error("Anthropic stream: sin cuerpo de respuesta");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr || jsonStr === "[DONE]") continue;
          try {
            const event = JSON.parse(jsonStr) as {
              type?: string;
              delta?: { type?: string; text?: string };
            };
            if (
              event.type === "content_block_delta" &&
              event.delta?.type === "text_delta" &&
              event.delta.text
            ) {
              yield event.delta.text;
            }
          } catch {
            /* fragmento SSE incompleto */
          }
        }
      }
    },

    async embed(_options: EmbeddingOptions): Promise<number[][]> {
      throw new Error(EMBED_NOT_SUPPORTED);
    },
  };
}

function getModelEnv(name: string, fallback: string) {
  const raw = process.env[name]?.trim().replace(/^["']|["']$/g, "");
  return raw || fallback;
}
