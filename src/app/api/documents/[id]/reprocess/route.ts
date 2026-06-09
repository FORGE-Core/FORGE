import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { assertAdminSession } from "@/lib/auth/roles";
import { db } from "@/lib/db";
import { readStoredFile } from "@/lib/document-storage";
import {
  extractPdfText,
  processDocumentContent,
} from "@/services/documents/process-document";

export const runtime = "nodejs";

export async function POST(
  _req: Request,
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
    const { id } = await params;

    const document = await db.document.findFirst({
      where: { id, organizationId },
    });

    if (!document?.fileUrl) {
      return NextResponse.json(
        { error: "Documento sin archivo almacenado" },
        { status: 404 }
      );
    }

    if (document.type !== "PDF") {
      return NextResponse.json(
        { error: "Solo se pueden reprocesar archivos PDF subidos" },
        { status: 400 }
      );
    }

    await db.document.update({
      where: { id },
      data: { status: "PROCESSING" },
    });

    const buffer = await readStoredFile(document.fileUrl);
    const text = await extractPdfText(buffer);

    const chunkCount = await processDocumentContent({
      organizationId,
      documentId: id,
      text,
    });

    return NextResponse.json({ chunkCount, status: "READY" });
  } catch (error) {
    console.error("[documents reprocess]", error);
    const msg =
      error instanceof Error ? error.message : "Error al reprocesar";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
