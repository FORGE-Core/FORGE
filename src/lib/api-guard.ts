import { rateLimit } from "@/lib/rate-limit";

export function checkApiRateLimit(
  userId: string | undefined,
  ip: string | null,
  limit = 80
) {
  const key = userId ?? ip ?? "anonymous";
  const result = rateLimit({ key, limit, windowMs: 60_000 });
  if (!result.ok) {
    return {
      blocked: true as const,
      response: Response.json(
        { error: "Demasiadas solicitudes. Intenta en unos segundos." },
        {
          status: 429,
          headers: { "Retry-After": String(result.retryAfterSec) },
        }
      ),
    };
  }
  return { blocked: false as const };
}
