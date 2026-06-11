import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAlaeContextForUser } from "@/lib/alae/accessibility-profile";
import { db } from "@/lib/db";

const DEFAULT_SUGGESTIONS = [
  "¿Cómo registro una devolución?",
  "¿Qué hago si un paquete se pierde?",
  "Resume el procedimiento de este módulo",
  "Explícame los pasos más importantes",
];

export async function GET() {
  try {
    const session = await auth();
    const organizationId = session?.user?.organizationId;
    const userId = session?.user?.id;

    if (!organizationId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const [docs, processes, alae] = await Promise.all([
      db.document.findMany({
        where: { organizationId, status: "READY" },
        select: { title: true },
        take: 4,
        orderBy: { createdAt: "desc" },
      }),
      db.process.findMany({
        where: { organizationId },
        select: { title: true },
        take: 5,
        orderBy: { orderIndex: "asc" },
      }),
      userId
        ? getAlaeContextForUser(userId, organizationId)
        : Promise.resolve(null),
    ]);

    const fromDocs = docs.map((d) => `¿Qué dice el manual sobre ${d.title}?`);
    const suggestions: string[] =
      fromDocs.length >= 2
        ? [...fromDocs.slice(0, 3)]
        : [...DEFAULT_SUGGESTIONS.slice(0, 3)];

    if (alae?.declaredNeeds.examples) {
      suggestions.push("Dame un ejemplo práctico de este proceso");
    }
    if (alae?.declaredNeeds.simulations) {
      suggestions.push("¿Qué harías en una situación difícil con un cliente?");
    }
    if (alae?.accessibility.simplifiedLanguage) {
      suggestions.push("Explícamelo más fácil con palabras sencillas");
    }
    if (alae?.accessibility.stepByStepMode) {
      suggestions.push("Guíame paso a paso el procedimiento");
    }

    const modules = await db.trainingModule.findMany({
      where: { organizationId, status: "PUBLISHED" },
      select: { title: true },
      take: 1,
    });
    if (modules[0]) {
      suggestions.push(`Resume el módulo «${modules[0].title}» en 5 puntos`);
    }

    return NextResponse.json({
      suggestions: [...new Set(suggestions)].slice(0, 6),
      processes: processes.map((p) => p.title),
    });
  } catch (error) {
    console.error("[chat/suggestions GET]", error);
    return NextResponse.json({ suggestions: DEFAULT_SUGGESTIONS, processes: [] });
  }
}
