import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    const organizationId = session?.user?.organizationId;
    const userId = session?.user?.id;

    if (!organizationId || !userId) {
      return NextResponse.json(
        { error: "Debes iniciar sesión" },
        { status: 401 }
      );
    }

    const conversations = await db.conversation.findMany({
      where: { organizationId, userId },
      orderBy: { updatedAt: "desc" },
      take: 30,
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { content: true, role: true, createdAt: true },
        },
        _count: { select: { messages: true } },
      },
    });

    return NextResponse.json({
      conversations: conversations.map((c) => ({
        id: c.id,
        title: c.title ?? "Conversación",
        updatedAt: c.updatedAt,
        messageCount: c._count.messages,
        preview: c.messages[0]?.content?.slice(0, 80) ?? "",
      })),
    });
  } catch (error) {
    console.error("[conversations GET]", error);
    return NextResponse.json(
      { error: "No se pudo cargar el historial" },
      { status: 500 }
    );
  }
}
