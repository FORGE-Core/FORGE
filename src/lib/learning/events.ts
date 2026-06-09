import { db } from "@/lib/db";
import { dispatchN8nWebhook } from "@/lib/workflows/n8n";

export async function logLearningEvent({
  organizationId,
  userId,
  eventType,
  payload,
}: {
  organizationId: string;
  userId: string;
  eventType: string;
  payload: Record<string, unknown>;
}) {
  try {
    await db.learningEvent.create({
      data: {
        organizationId,
        userId,
        eventType,
        payload: payload as object,
      },
    });

    void dispatchN8nWebhook(eventType, {
      organizationId,
      userId,
      ...payload,
    });
  } catch (err) {
    console.warn("[learningEvent]", err);
  }
}
