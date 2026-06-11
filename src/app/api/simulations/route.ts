import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const organizationId = session?.user?.organizationId;

    if (!organizationId) {
      return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const index = Math.max(0, Number(searchParams.get("index") ?? 0));

    const simulations = await db.activity.findMany({
      where: { organizationId, type: "CASE_STUDY" },
      include: {
        module: { select: { title: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const activity = simulations[index];
    if (!activity) {
      return NextResponse.json({
        simulation: null,
        total: simulations.length,
      });
    }

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
        moduleTitle: activity.module?.title ?? null,
        moduleSlug: activity.module?.slug ?? null,
        current: index + 1,
        total: simulations.length,
      },
      total: simulations.length,
    });
  } catch (error) {
    console.error("[simulations GET]", error);
    return NextResponse.json(
      { error: "No se pudo cargar la simulación" },
      { status: 500 }
    );
  }
}
