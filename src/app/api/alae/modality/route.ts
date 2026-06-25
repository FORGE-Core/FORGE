import { logAccessibilityEvent } from "@/lib/alae/events";
import { recordModalityUse } from "@/lib/alae/learning-profile";
import { requireTenantApi } from "@/lib/api/tenant-route";
import type { LearningModality } from "@prisma/client";

const VALID: LearningModality[] = [
  "READING",
  "LISTENING",
  "VISUAL",
  "PRACTICE",
  "MIXED",
];

export async function POST(req: Request) {
  const tenant = await requireTenantApi();
  if (!tenant.ok) return tenant.response;

  const { userId, organizationId } = tenant.ctx;

  let body: { modality?: string; source?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  const modality = body.modality as LearningModality;
  if (!modality || !VALID.includes(modality)) {
    return Response.json({ error: "modality inválida" }, { status: 400 });
  }

  await recordModalityUse(userId, organizationId, modality);
  await logAccessibilityEvent({
    organizationId,
    userId,
    eventType: "MODALITY_USED",
    payload: { modality, source: body.source ?? "client" },
  });

  return Response.json({ ok: true });
}
