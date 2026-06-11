import { db } from "@/lib/db";
import { dispatchN8nWebhook } from "@/lib/workflows/n8n";

const EVENT_TO_TRIGGER: Record<string, string> = {
  USER_COMPLETED_MODULE: "USER_COMPLETED_MODULE",
  ACTIVITY_FAILED: "USER_FAILED_ACTIVITY",
  DOCUMENT_PROCESSED: "DOCUMENT_PROCESSED",
  SIMULATION_COMPLETED: "LOW_SCORE_DETECTED",
};

export async function runAutomationsForEvent({
  organizationId,
  eventType,
  payload,
}: {
  organizationId: string;
  eventType: string;
  payload: Record<string, unknown>;
}) {
  const trigger = EVENT_TO_TRIGGER[eventType];
  if (!trigger) return;

  const automations = await db.automation.findMany({
    where: {
      organizationId,
      isActive: true,
      trigger: trigger as never,
    },
  });

  for (const rule of automations) {
    void dispatchN8nWebhook(`automation:${rule.id}`, {
      automationId: rule.id,
      automationName: rule.name,
      trigger: rule.trigger,
      config: rule.config,
      organizationId,
      eventType,
      ...payload,
    });
  }
}
