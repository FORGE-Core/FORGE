import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { submitActivityAttempt } from "@/lib/activities/quiz";
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
    if (!selectedId) {
      return NextResponse.json({ error: "Opción requerida" }, { status: 400 });
    }

    const { score, passed } = await submitActivityAttempt({
      userId,
      organizationId,
      activityId: id,
      answers: { selectedId },
    });

    await logLearningEvent({
      organizationId,
      userId,
      eventType: "SIMULATION_COMPLETED",
      payload: { activityId: id, score, passed },
    });

    return NextResponse.json({ score, passed });
  } catch (error) {
    console.error("[simulations attempt POST]", error);
    return NextResponse.json(
      { error: "No se pudo registrar la simulación" },
      { status: 500 }
    );
  }
}
