import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { assertAdminSession } from "@/lib/auth/roles";
import { db } from "@/lib/db";
import { deleteStoredFile } from "@/lib/document-storage";
import { getOrganizationDocument } from "@/lib/documents";

export const runtime = "nodejs";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const adminCheck = assertAdminSession(session);

    if (!adminCheck.ok) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const organizationId = adminCheck.session.user.organizationId;

    const { id } = await params;
    const document = await getOrganizationDocument(id, organizationId);

    if (!document) {
      return NextResponse.json(
        { error: "Documento no encontrado" },
        { status: 404 }
      );
    }

    if (document.fileUrl) {
      await deleteStoredFile(document.fileUrl);
    }

    await db.document.delete({ where: { id: document.id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[documents DELETE]", error);
    return NextResponse.json(
      { error: "No se pudo eliminar el documento" },
      { status: 500 }
    );
  }
}
