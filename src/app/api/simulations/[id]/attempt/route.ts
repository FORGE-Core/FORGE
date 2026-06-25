import { NextResponse } from "next/server";
import {
  recordModalityUse,
  syncSupportLevelFromActivity,
} from "@/lib/alae/learning-profile";
import { logLearningEvent } from "@/lib/learning/events";
import { serviceErrorResponse } from "@/lib/api/service-response";
import { requireTenantApi } from "@/lib/api/tenant-route";
import { submitActivityAttempt } from "@/services/server/training";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenant = await requireTenantApi();
    if (!tenant.ok) return tenant.response;

    const { id } = await params;
    const body = await req.json();
    const selectedId = body.selectedId as string | undefined;
    if (!selectedId) {
      return NextResponse.json({ error: "Opción requerida" }, { status: 400 });
    }

    const { organizationId, userId } = tenant.ctx;
    const { score, passed } = await submitActivityAttempt({
      userId,
      organizationId,
      activityId: id,
      answers: { selectedId },
    });

    await Promise.all([
      logLearningEvent({
        organizationId,
        userId,
        eventType: "SIMULATION_COMPLETED",
        payload: { activityId: id, score, passed },
      }),
      recordModalityUse(userId, organizationId, "PRACTICE"),
      syncSupportLevelFromActivity(userId, organizationId),
    ]);

    return NextResponse.json({ score, passed });
  } catch (error) {
    return serviceErrorResponse(error);
  }
}
