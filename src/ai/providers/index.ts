import { getEnv } from "@/lib/env";
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

export type { AIProvider, ChatMessage } from "./types";
