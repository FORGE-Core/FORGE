import type { AIProvider, ChatCompletionOptions, ChatMessage, EmbeddingOptions } from "./types";

const DEFAULT_CHAT_MODEL = "gemini-2.5-flash-lite";
const DEFAULT_EMBED_MODEL = "gemini-embedding-001";

/** Modelos con cuota separada; se prueban si el principal devuelve 429/503 */
const CHAT_FALLBACK_MODELS = [
  "gemini-2.5-flash-lite",
  "gemini-flash-lite-latest",
  "gemini-flash-latest",
  "gemini-2.0-flash-lite",
];

async function parseGeminiError(res: Response, label: string): Promise<never> {
  let detail = res.statusText;
  try {
    const body = (await res.json()) as {
      error?: { message?: string; status?: string };
    };
    detail = body.error?.message ?? detail;
  } catch {
    /* respuesta no JSON */
  }

  if (res.status === 401 || res.status === 403) {
    throw new Error(
      `${label}: API key inválida o sin permisos. Verifica GEMINI_API_KEY en .env y reinicia el servidor.`
    );
  }

  const err = new Error(`${label} (${res.status}): ${detail}`) as Error & {
    status?: number;
  };
  err.status = res.status;
  throw err;
}

function isRetryableStatus(status: number) {
  return status === 429 || status === 503;
}

function toGeminiContents(messages: ChatMessage[]) {
  let systemInstruction: string | undefined;
  const contents: { role: "user" | "model"; parts: { text: string }[] }[] = [];

  for (const msg of messages) {
    if (msg.role === "system") {
      systemInstruction = systemInstruction
        ? `${systemInstruction}\n\n${msg.content}`
        : msg.content;
      continue;
    }
    contents.push({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    });
  }

  return { systemInstruction, contents };
}

function getChatModels(primary: string): string[] {
  const fromEnv = getModelEnv("GEMINI_CHAT_FALLBACK_MODELS", "");
  const extras = fromEnv ? fromEnv.split(",").map((m) => m.trim()).filter(Boolean) : [];
  return [...new Set([primary, ...extras, ...CHAT_FALLBACK_MODELS])];
}

async function generateChat(
  apiKey: string,
  model: string,
  body: Record<string, unknown>
): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) await parseGeminiError(res, `Gemini chat [${model}]`);

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };

  const text = data.candidates?.[0]?.content?.parts
    ?.map((p) => p.text ?? "")
    .join("");

  if (!text) throw new Error(`Gemini chat [${model}]: respuesta vacía`);
  return text;
}

export function createGeminiProvider(
  apiKey: string,
  chatModel = getModelEnv("GEMINI_MODEL", DEFAULT_CHAT_MODEL),
  embedModel = getModelEnv("GEMINI_EMBEDDING_MODEL", DEFAULT_EMBED_MODEL)
): AIProvider {
  const baseUrl = "https://generativelanguage.googleapis.com/v1beta";
  const chatModels = getChatModels(chatModel);

  return {
    id: "gemini",

    async chat({ messages, temperature = 0.3, maxTokens = 2048 }: ChatCompletionOptions) {
      const { systemInstruction, contents } = toGeminiContents(messages);
      const payload = {
        contents,
        ...(systemInstruction && {
          systemInstruction: { parts: [{ text: systemInstruction }] },
        }),
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
        },
      };

      let lastError: Error | null = null;

      for (const model of chatModels) {
        try {
          return await generateChat(apiKey, model, payload);
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err));
          const status = (lastError as Error & { status?: number }).status;
          if (status && isRetryableStatus(status)) {
            console.warn(`[Gemini] ${model} no disponible (${status}), probando siguiente…`);
            continue;
          }
          throw lastError;
        }
      }

      throw new Error(
        lastError?.message ??
          "Gemini chat: todos los modelos alcanzaron el límite de uso. Espera unos minutos o activa facturación en Google AI Studio."
      );
    },

    async embed({ input }: EmbeddingOptions) {
      const texts = Array.isArray(input) ? input : [input];
      const modelPath = embedModel.startsWith("models/")
        ? embedModel
        : `models/${embedModel}`;

      if (texts.length === 1) {
        const res = await fetch(
          `${baseUrl}/${modelPath}:embedContent?key=${encodeURIComponent(apiKey)}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: modelPath,
              content: { parts: [{ text: texts[0] }] },
            }),
          }
        );

        if (!res.ok) await parseGeminiError(res, "Gemini embeddings");

        const data = (await res.json()) as { embedding?: { values?: number[] } };
        const values = data.embedding?.values;
        if (!values) throw new Error("Gemini embeddings: respuesta vacía");
        return [values];
      }

      const res = await fetch(
        `${baseUrl}/${modelPath}:batchEmbedContents?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requests: texts.map((text) => ({
              model: modelPath,
              content: { parts: [{ text }] },
            })),
          }),
        }
      );

      if (!res.ok) await parseGeminiError(res, "Gemini embeddings");

      const data = (await res.json()) as {
        embeddings?: { values?: number[] }[];
      };

      return (data.embeddings ?? []).map((e) => {
        if (!e.values) throw new Error("Gemini embeddings: vector vacío");
        return e.values;
      });
    },
  };
}

function getModelEnv(name: string, fallback: string) {
  const raw = process.env[name]?.trim().replace(/^["']|["']$/g, "");
  return raw || fallback;
}
