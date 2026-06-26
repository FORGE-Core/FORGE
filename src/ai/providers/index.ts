import { getEnv } from "@/lib/env";
import { createAnthropicProvider } from "./anthropic";
import { createGeminiProvider } from "./gemini";
import { createOllamaProvider } from "./ollama";
import { createOpenAIProvider } from "./openai";
import type { AIProvider, AIProviderId } from "./types";

function resolveProviderId(providerId?: AIProviderId): AIProviderId {
  return (
    providerId ??
    (getEnv("AI_DEFAULT_PROVIDER") as AIProviderId) ??
    "gemini"
  );
}

export function getAIProvider(providerId?: AIProviderId): AIProvider {
  const id = resolveProviderId(providerId);

  switch (id) {
    case "ollama":
      return createOllamaProvider(
        getEnv("OLLAMA_BASE_URL"),
        getEnv("OLLAMA_MODEL")
      );
    case "openai": {
      const key = getEnv("OPENAI_API_KEY");
      if (!key || key.includes("TU_KEY") || key === "sk-...") {
        throw new Error(
          "OPENAI_API_KEY no configurada. Añádela en .env o usa AI_DEFAULT_PROVIDER=gemini"
        );
      }
      return createOpenAIProvider(key);
    }
    case "anthropic": {
      const key = getEnv("ANTHROPIC_API_KEY");
      if (!key || key.includes("TU_KEY") || key === "sk-ant-...") {
        throw new Error(
          "ANTHROPIC_API_KEY no configurada. Añádela en .env o usa AI_DEFAULT_PROVIDER=gemini"
        );
      }
      return createAnthropicProvider(key);
    }
    case "gemini":
    default: {
      const key = getEnv("GEMINI_API_KEY");
      if (!key) {
        throw new Error(
          "GEMINI_API_KEY no configurada. Añádela en .env y reinicia npm run dev"
        );
      }
      return createGeminiProvider(key);
    }
  }
}

/**
 * Resuelve el proveedor de embeddings. Anthropic no expone embeddings, por lo
 * que cuando el chat usa Claude se necesita un proveedor distinto (gemini u
 * openai) configurable vía EMBEDDING_PROVIDER. Si no se define, usa el
 * proveedor por defecto salvo que sea anthropic, en cuyo caso cae en gemini.
 */
export function getEmbeddingProvider(): AIProvider {
  const explicit = getEnv("EMBEDDING_PROVIDER") as AIProviderId | undefined;
  if (explicit) return getAIProvider(explicit);

  const fallback = resolveProviderId();
  return getAIProvider(fallback === "anthropic" ? "gemini" : fallback);
}

export type { AIProvider, ChatMessage } from "./types";
