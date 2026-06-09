import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { ensureSimulationActivity } from "@/lib/activities/quiz";

export async function GET() {
  try {
    const session = await auth();
    const organizationId = session?.user?.organizationId;

    if (!organizationId) {
      return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });
    }

    const activity = await ensureSimulationActivity(
      organizationId,
      null,
      "Paquete no entregado"
    );

    const content = activity.content as {
      scenario?: string;
      options?: {
        id: string;
        label: string;
        text: string;
        score: number;
      }[];
      aiAnalysis?: string;
    };

    return NextResponse.json({
      simulation: {
        id: activity.id,
        title: activity.title,
        scenario: content.scenario ?? "",
        options: content.options ?? [],
        aiAnalysis: content.aiAnalysis ?? "",
      },
    });
  } catch (error) {
    console.error("[simulations GET]", error);
    return NextResponse.json(
      { error: "No se pudo cargar la simulación" },
      { status: 500 }
    );
  }
}
