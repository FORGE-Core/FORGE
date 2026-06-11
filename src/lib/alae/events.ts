import { db } from "@/lib/db";

export async function logAccessibilityEvent({
  organizationId,
  userId,
  eventType,
  payload = {},
}: {
  organizationId: string;
  userId: string;
  eventType: string;
  payload?: Record<string, unknown>;
}) {
  try {
    await db.accessibilityEvent.create({
      data: {
        organizationId,
        userId,
        eventType,
        payload: payload as object,
      },
    });
  } catch (err) {
    console.warn("[accessibilityEvent]", err);
  }
}
