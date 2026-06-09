import { NextResponse } from "next/server";
import { auth } from "@/auth";
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

    if (!organizationId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const docs = await db.document.findMany({
      where: { organizationId, status: "READY" },
      select: { title: true },
      take: 4,
      orderBy: { createdAt: "desc" },
    });

    const fromDocs = docs.map((d) => `¿Qué dice el manual sobre ${d.title}?`);
    const suggestions =
      fromDocs.length >= 2
        ? [...fromDocs.slice(0, 3), DEFAULT_SUGGESTIONS[1]]
        : DEFAULT_SUGGESTIONS;

    const processes = await db.process.findMany({
      where: { organizationId },
      select: { title: true },
      take: 5,
      orderBy: { orderIndex: "asc" },
    });

    return NextResponse.json({
      suggestions,
      processes: processes.map((p) => p.title),
    });
  } catch (error) {
    console.error("[chat/suggestions GET]", error);
    return NextResponse.json({ suggestions: DEFAULT_SUGGESTIONS, processes: [] });
  }
}
