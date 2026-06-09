import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { checkApiRateLimit } from "@/lib/api-guard";
import { queryRAG } from "@/ai/rag/pipeline";
import { enrichRAGSources } from "@/lib/chat/enrich-sources";
import { db } from "@/lib/db";
import { logLearningEvent } from "@/lib/learning/events";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const guard = checkApiRateLimit(
      session?.user?.id,
      req.headers.get("x-forwarded-for")?.split(",")[0] ?? null,
      40
    );
    if (guard.blocked) return guard.response;

    let body: {
      message?: string;
      organizationId?: string;
      conversationId?: string;
    };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Cuerpo JSON inválido" }, { status: 400 });
    }

    const message = body.message?.trim();

    if (!message) {
      return NextResponse.json({ error: "Mensaje requerido" }, { status: 400 });
    }

    const organizationId =
      session?.user?.organizationId ?? body.organizationId ?? null;
    const userId = session?.user?.id;

    if (!organizationId || !userId) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para usar el mentor IA" },
        { status: 401 }
      );
    }

    let conversationId = body.conversationId;
    if (!conversationId) {
      const conv = await db.conversation.create({
        data: {
          organizationId,
          userId,
          title: message.slice(0, 80),
        },
      });
      conversationId = conv.id;
    }

    const result = await queryRAG({
      organizationId,
      question: message,
    });

    const sources = await enrichRAGSources(result.sources);
    const hasOfficialDocs = sources.length > 0;

    await db.message.createMany({
      data: [
        {
          conversationId,
          role: "user",
          content: message,
        },
        {
          conversationId,
          role: "assistant",
          content: result.answer,
          sources: sources as object[],
        },
      ],
    });

    await logLearningEvent({
      organizationId,
      userId,
      eventType: "CHAT_QUESTION",
      payload: {
        conversationId,
        sourceCount: sources.length,
      },
    });

    const confidence = hasOfficialDocs
      ? sources.some((s) => s.confidence === "high")
        ? "high"
        : "medium"
      : "low";

    return NextResponse.json({
      answer: result.answer,
      sources,
      conversationId,
      confidence,
      officialDocs: hasOfficialDocs,
    });
  } catch (error) {
    console.error("[chat]", error);
    const msg =
      error instanceof Error
        ? error.message
        : "Error al conectar con el proveedor de IA";

    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
