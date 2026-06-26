import { getOrCreateAccessibilityProfile } from "@/lib/alae/accessibility-profile";
import { adaptContent } from "@/lib/alae/adapt-content";
import { logAccessibilityEvent } from "@/lib/alae/events";
import { recordModalityUse } from "@/lib/alae/learning-profile";
import type { AdaptRequest } from "@/lib/alae/types";
import type { ServiceContext } from "@/services/server/types";
import { ServiceError } from "@/services/server/errors";

export async function adaptContentForUser(
  ctx: ServiceContext,
  body: AdaptRequest & { sourceId?: string; sourceType?: string }
) {
  if (!body.content?.trim() || !body.type) {
    throw new ServiceError("VALIDATION", "content y type son requeridos");
  }

  const accessibility = await getOrCreateAccessibilityProfile(
    ctx.userId,
    ctx.organizationId,
    ctx.db
  );

  const result = await adaptContent(body, {
    organizationId: ctx.organizationId,
    userId: ctx.userId,
    sourceId: body.sourceId,
    sourceType: body.sourceType,
    learningPace: accessibility.learningPace,
  });

  await logAccessibilityEvent({
    organizationId: ctx.organizationId,
    userId: ctx.userId,
    eventType: `ADAPT_${body.type}`,
    payload: { sourceId: body.sourceId, sourceType: body.sourceType },
  });

  if (body.type === "SIMPLIFY") {
    await recordModalityUse(ctx.userId, ctx.organizationId, ctx.db, "READING");
  } else {
    await recordModalityUse(ctx.userId, ctx.organizationId, ctx.db, "VISUAL");
  }

  return result;
}
