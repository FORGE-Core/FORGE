import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { queryRAG } from "@/ai/rag/pipeline";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    let body: { message?: string; organizationId?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Cuerpo JSON inválido" }, { status: 400 });
    }

    const session = await auth();
    const message = body.message?.trim();

    if (!message) {
      return NextResponse.json({ error: "Mensaje requerido" }, { status: 400 });
    }

    const organizationId =
      session?.user?.organizationId ?? body.organizationId ?? null;

    if (!organizationId) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para usar el mentor IA" },
        { status: 401 }
      );
    }

    const result = await queryRAG({
      organizationId,
      question: message,
    });

    return NextResponse.json({
      answer: result.answer,
      sources: result.sources,
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
