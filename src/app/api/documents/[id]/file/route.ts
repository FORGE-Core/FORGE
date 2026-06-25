import { NextResponse } from "next/server";
import {
  EMPLOYEE_VISIBLE_DOCUMENT_TYPES,
  isAdmin,
} from "@/lib/auth/roles";
import { readStoredFile, storedFileExists } from "@/lib/document-storage";
import { getOrganizationDocument } from "@/lib/documents";
import { requireTenantApi } from "@/lib/api/tenant-route";

export const runtime = "nodejs";

function safeFilename(title: string) {
  return title.replace(/[^\w\s.-áéíóúñÁÉÍÓÚÑ]/g, "_").slice(0, 80) || "documento";
}

function fileExtension(mimeType: string | null, type: string) {
  if (mimeType?.includes("webm")) return ".webm";
  if (mimeType?.includes("quicktime") || mimeType?.includes("mov")) return ".mov";
  if (type === "VIDEO" || mimeType?.startsWith("video/")) return ".mp4";
  return ".pdf";
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenant = await requireTenantApi();
    if (!tenant.ok) return tenant.response;

    const { organizationId, role } = tenant.ctx;
    const { id } = await params;
    const document = await getOrganizationDocument(id, organizationId);

    if (!document?.fileUrl) {
      return NextResponse.json(
        { error: "Archivo no disponible" },
        { status: 404 }
      );
    }

    if (
      !isAdmin(role) &&
      !EMPLOYEE_VISIBLE_DOCUMENT_TYPES.includes(
        document.type as (typeof EMPLOYEE_VISIBLE_DOCUMENT_TYPES)[number]
      )
    ) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    if (!(await storedFileExists(document.fileUrl))) {
      return NextResponse.json(
        { error: "El archivo ya no existe en el servidor" },
        { status: 404 }
      );
    }

    const buffer = await readStoredFile(document.fileUrl);
    const ext = fileExtension(document.mimeType, document.type);
    const filename = `${safeFilename(document.title)}${ext}`;
    const isVideo = document.type === "VIDEO";
    const disposition = isVideo ? "inline" : "attachment";

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": document.mimeType ?? (isVideo ? "video/mp4" : "application/pdf"),
        "Content-Disposition": `${disposition}; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        "Content-Length": String(buffer.length),
        "Cache-Control": "private, no-cache",
      },
    });
  } catch (error) {
    console.error("[documents file GET]", error);
    return NextResponse.json(
      { error: "Error al descargar el documento" },
      { status: 500 }
    );
  }
}
