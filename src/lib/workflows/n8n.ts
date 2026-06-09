import { getEnv } from "@/lib/env";

export async function dispatchN8nWebhook(
  event: string,
  payload: Record<string, unknown>
) {
  const url = getEnv("N8N_WEBHOOK_URL");
  if (!url) return;

  const secret = getEnv("N8N_WEBHOOK_SECRET");

  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(secret ? { "X-Webhook-Secret": secret } : {}),
      },
      body: JSON.stringify({
        event,
        timestamp: new Date().toISOString(),
        ...payload,
      }),
    });
  } catch (err) {
    console.warn("[n8n] webhook falló:", err);
  }
}
