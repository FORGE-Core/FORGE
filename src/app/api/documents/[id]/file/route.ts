import { NextResponse } from "next/server";
import {
  EMPLOYEE_VISIBLE_DOCUMENT_TYPES,
  isAdmin,
} from "@/lib/auth/roles";
import {
  readStoredFile,
  storedFileExists,
} from "@/lib/storage";
import { buildDocumentDeliveryUrl } from "@/lib/storage/delivery-url";
import { getOrganizationDocument } from "@/lib/documents";
import { requireTenantApi } from "@/lib/api/tenant-route";

export const runtime = "nodejs";

function safeFilename(title: string) {
  return title.replace(/[^\w\s.-áéíóúñÁÉÍÓÚÑ]/g, "_").slice(0, 80) || "documento";
}

function fileExtension(mimeType: string | null, type: string) {
  if (mimeType?.includes("webm")) return ".webm";
  if (mimeType?.includes("quicktime") || mimeType?.includes("mov")) return ".mov";
  if (mimeType?.includes("png")) return ".png";
  if (mimeType?.includes("webp")) return ".webp";
  if (mimeType?.includes("gif")) return ".gif";
  if (type === "IMAGE" || mimeType?.startsWith("image/")) return ".jpg";
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

    const cdnUrl = buildDocumentDeliveryUrl(document.fileUrl, {
      documentType: document.type,
      mimeType: document.mimeType,
      inline: true,
    });

    if (cdnUrl) {
      return NextResponse.redirect(cdnUrl, 302);
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
    const isImage = document.type === "IMAGE";
    const disposition =
      isVideo || isImage ? "inline" : "attachment";

    const defaultMime = isVideo
      ? "video/mp4"
      : isImage
        ? "image/jpeg"
        : "application/pdf";

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": document.mimeType ?? defaultMime,
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
