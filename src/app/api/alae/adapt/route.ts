import { auth } from "@/auth";
import { checkApiRateLimit } from "@/lib/api-guard";
import { getOrCreateAccessibilityProfile } from "@/lib/alae/accessibility-profile";
import { adaptContent } from "@/lib/alae/adapt-content";
import { logAccessibilityEvent } from "@/lib/alae/events";
import { recordModalityUse } from "@/lib/alae/learning-profile";
import type { AdaptRequest } from "@/lib/alae/types";

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  const organizationId = session?.user?.organizationId;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? null;

  const guard = checkApiRateLimit(userId, ip, 30);
  if (guard.blocked) return guard.response;

  if (!userId || !organizationId) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: AdaptRequest & {
    sourceId?: string;
    sourceType?: string;
  };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!body.content?.trim() || !body.type) {
    return Response.json(
      { error: "content y type son requeridos" },
      { status: 400 }
    );
  }

  const accessibility = await getOrCreateAccessibilityProfile(
    userId,
    organizationId
  );

  const result = await adaptContent(body, {
    organizationId,
    userId,
    sourceId: body.sourceId,
    sourceType: body.sourceType,
    learningPace: accessibility.learningPace,
  });

  await logAccessibilityEvent({
    organizationId,
    userId,
    eventType: `ADAPT_${body.type}`,
    payload: { sourceId: body.sourceId, sourceType: body.sourceType },
  });

  if (body.type === "SIMPLIFY") {
    await recordModalityUse(userId, organizationId, "READING");
  } else {
    await recordModalityUse(userId, organizationId, "VISUAL");
  }

  return Response.json(result);
}
