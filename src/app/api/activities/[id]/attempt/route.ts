import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { submitActivityAttempt } from "@/lib/activities/quiz";
import { getActivityExplanation } from "@/lib/activities/types";
import { logLearningEvent } from "@/lib/learning/events";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const organizationId = session?.user?.organizationId;
    const userId = session?.user?.id;
    const { id } = await params;

    if (!organizationId || !userId) {
      return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });
    }

    const body = await req.json();
    const selectedId = body.selectedId as string | undefined;
    const order = body.order as string[] | undefined;

    if (!selectedId && (!order || order.length === 0)) {
      return NextResponse.json({ error: "Respuesta requerida" }, { status: 400 });
    }

    const { score, passed, activity } = await submitActivityAttempt({
      userId,
      organizationId,
      activityId: id,
      answers: { selectedId, order },
      timeSecs: body.timeSecs,
    });

    await logLearningEvent({
      organizationId,
      userId,
      eventType: passed ? "ACTIVITY_PASSED" : "ACTIVITY_FAILED",
      payload: { activityId: id, score, moduleId: activity.moduleId },
    });

    return NextResponse.json({
      score,
      passed,
      explanation: getActivityExplanation(activity.type, activity.content),
    });
  } catch (error) {
    console.error("[activities attempt POST]", error);
    const msg =
      error instanceof Error ? error.message : "Error al registrar intento";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
