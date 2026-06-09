import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { assertAdminSession } from "@/lib/auth/roles";
import { db } from "@/lib/db";
import { logLearningEvent } from "@/lib/learning/events";
import { generateLearningContentFromDocument } from "@/services/ai/generate-learning-content";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const check = await assertAdminSession(await auth());
    if (!check.ok) {
      return NextResponse.json(
        { error: check.error },
        { status: check.status }
      );
    }

    const organizationId = check.session.user.organizationId!;
    const userId = check.session.user.id!;
    const { id } = await params;

    let moduleId: string | undefined;
    try {
      const body = await req.json();
      moduleId = body.moduleId;
    } catch {
      /* sin body */
    }

    const document = await db.document.findFirst({
      where: { id, organizationId },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Documento no encontrado" },
        { status: 404 }
      );
    }

    const result = await generateLearningContentFromDocument({
      organizationId,
      documentId: id,
      moduleId: moduleId ?? document.moduleId,
    });

    await logLearningEvent({
      organizationId,
      userId,
      eventType: "DOCUMENT_CONTENT_GENERATED",
      payload: {
        documentId: id,
        moduleId: result.moduleId,
        items: result.created,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[documents generate]", error);
    const msg =
      error instanceof Error ? error.message : "Error al generar contenido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
