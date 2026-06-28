import { db } from "@/lib/db";
import type { PrismaClient } from "@prisma/client";
import { logAccessibilityEvent } from "@/lib/alae/events";
import { notifyLearningEvent } from "@/lib/notifications/push";

async function shouldNotify(
  organizationId: string,
  eventType: string
): Promise<boolean> {
  const org = await db.organization.findUnique({
    where: { id: organizationId },
    select: { settings: true },
  });
  const notifications = (
    (org?.settings as Record<string, unknown> | null)?.notifications ?? {}
  ) as Record<string, boolean>;

  if (eventType === "USER_COMPLETED_MODULE") {
    return notifications.moduleReminders !== false;
  }
  if (eventType === "ACTIVITY_FAILED") {
    return notifications.simulationAlerts !== false;
  }
  return true;
}

const PUSH_NOTIFY_EVENTS: Record<
  string,
  { title: string; body: (p: Record<string, unknown>) => string; url?: string }
> = {
  ACTIVITY_FAILED: {
    title: "Actividad no aprobada",
    body: () => "Revisa el módulo y pide ayuda a NOVA con lenguaje fácil.",
    url: "/activities",
  },
  USER_COMPLETED_MODULE: {
    title: "¡Módulo completado!",
    body: () => "Excelente progreso en tu capacitación.",
    url: "/modules",
  },
};

const ALAE_LINKED_EVENTS = new Set([
  "ACTIVITY_FAILED",
  "ACTIVITY_PASSED",
  "CHAT_QUESTION",
  "SIMULATION_COMPLETED",
]);

export async function logLearningEvent({
  organizationId,
  userId,
  eventType,
  payload,
  db: tenantDb,
}: {
  organizationId: string;
  userId: string;
  eventType: string;
  payload: Record<string, unknown>;
  db?: PrismaClient;
}) {
  const client = tenantDb ?? db;
  try {
    await client.learningEvent.create({
      data: {
        organizationId,
        userId,
        eventType,
        payload: payload as object,
      },
    });

    if (ALAE_LINKED_EVENTS.has(eventType)) {
      void logAccessibilityEvent({
        organizationId,
        userId,
        eventType: `LEARNING_${eventType}`,
        payload,
      });
    }

    const pushCfg = PUSH_NOTIFY_EVENTS[eventType];
    if (pushCfg && (await shouldNotify(organizationId, eventType))) {
      void notifyLearningEvent({
        userId,
        organizationId,
        eventType,
        title: pushCfg.title,
        body: pushCfg.body(payload),
        url: pushCfg.url,
      });
    }
  } catch (err) {
    console.warn("[learningEvent]", err);
  }
}
