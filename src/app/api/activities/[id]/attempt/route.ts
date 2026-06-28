import { NextResponse } from "next/server";
import { getActivityExplanation } from "@/lib/activities/types";
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

    const { attempt, score, passed, activity } = await submitActivityAttempt({
      userId: tenant.ctx.userId,
      organizationId: tenant.ctx.organizationId,
      activityId: id,
      answers: body.answers ?? body,
      timeSecs: body.timeSecs,
      db: tenant.ctx.db,
    });

    return NextResponse.json({
      attemptId: attempt.id,
      score,
      passed,
      explanation: getActivityExplanation(activity.type, activity.content),
    });
  } catch (error) {
    return serviceErrorResponse(error);
  }
}
