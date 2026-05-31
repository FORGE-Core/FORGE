import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  assertAdminSession,
  canManageDocuments,
  EMPLOYEE_VISIBLE_DOCUMENT_TYPES,
  isAdmin,
} from "@/lib/auth/roles";
import { db } from "@/lib/db";
import { saveOrganizationFile } from "@/lib/document-storage";
import {
  extractPdfText,
  processDocumentContent,
} from "@/services/documents/process-document";

export const runtime = "nodejs";

const MAX_PDF_BYTES = 15 * 1024 * 1024;
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

const VIDEO_MIMES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
]);

function isPdf(file: File) {
  return (
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
  );
}

function isVideo(file: File) {
  const ext = file.name.toLowerCase();
  return (
    VIDEO_MIMES.has(file.type) ||
    ext.endsWith(".mp4") ||
    ext.endsWith(".webm") ||
    ext.endsWith(".mov")
  );
}

function videoExtension(file: File): string {
  const name = file.name.toLowerCase();
  if (name.endsWith(".webm")) return ".webm";
  if (name.endsWith(".mov")) return ".mov";
  return ".mp4";
}

export async function GET() {
  try {
    const session = await auth();
    const organizationId = session?.user?.organizationId;
    const role = session?.user?.role;

    if (!organizationId) {
      return NextResponse.json(
        { error: "Debes iniciar sesión" },
        { status: 401 }
      );
    }

    const admin = isAdmin(role);

    const documents = await db.document.findMany({
      where: admin
        ? { organizationId }
        : {
            organizationId,
            type: { in: [...EMPLOYEE_VISIBLE_DOCUMENT_TYPES] },
            fileUrl: { not: null },
            status: "READY",
          },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { chunks: true } },
      },
    });

    return NextResponse.json({
      canUpload: canManageDocuments(role),
      canManage: canManageDocuments(role),
      documents: documents.map((doc) => ({
        id: doc.id,
        title: doc.title,
        type: doc.type,
        status: doc.status,
        mimeType: doc.mimeType,
        fileSize: doc.fileSize,
        chunkCount: doc._count.chunks,
        createdAt: doc.createdAt,
        fileUrl: doc.fileUrl,
        hasFile: !!doc.fileUrl,
      })),
    });
  } catch (error) {
    console.error("[documents GET]", error);
    return NextResponse.json(
      { error: "No se pudieron cargar los documentos" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
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

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Selecciona un archivo PDF o video" },
        { status: 400 }
      );
    }

    const pdf = isPdf(file);
    const video = isVideo(file);

    if (!pdf && !video) {
      return NextResponse.json(
        { error: "Formatos permitidos: PDF (.pdf) o video (.mp4, .webm, .mov)" },
        { status: 400 }
      );
    }

    const maxBytes = pdf ? MAX_PDF_BYTES : MAX_VIDEO_BYTES;
    if (file.size > maxBytes) {
      const limitMb = maxBytes / (1024 * 1024);
      return NextResponse.json(
        { error: `El archivo supera el límite de ${limitMb} MB` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = pdf ? ".pdf" : videoExtension(file);
    const defaultTitle = file.name.replace(/\.[^.]+$/, "").trim() || "Sin título";
    const title = (formData.get("title") as string)?.trim() || defaultTitle;

    const document = await db.document.create({
      data: {
        organizationId,
        title,
        type: pdf ? "PDF" : "VIDEO",
        status: "PROCESSING",
        mimeType: file.type || (pdf ? "application/pdf" : "video/mp4"),
        fileSize: file.size,
      },
    });

    try {
      const relativePath = await saveOrganizationFile(
        organizationId,
        document.id,
        buffer,
        ext
      );

      await db.document.update({
        where: { id: document.id },
        data: { fileUrl: relativePath },
      });

      let chunkCount = 0;

      if (pdf) {
        const text = await extractPdfText(buffer);
        chunkCount = await processDocumentContent({
          organizationId,
          documentId: document.id,
          text,
        });
      } else {
        await db.document.update({
          where: { id: document.id },
          data: {
            status: "READY",
            metadata: {
              mediaType: "video",
              processedAt: new Date().toISOString(),
            },
          },
        });
      }

      const updated = await db.document.findUnique({
        where: { id: document.id },
        include: { _count: { select: { chunks: true } } },
      });

      return NextResponse.json({
        document: {
          id: updated!.id,
          title: updated!.title,
          type: updated!.type,
          status: updated!.status,
          chunkCount: pdf ? chunkCount : updated!._count.chunks,
          fileSize: updated!.fileSize,
          createdAt: updated!.createdAt,
        },
      });
    } catch (processError) {
      console.error("[documents POST process]", processError);
      await db.document.update({
        where: { id: document.id },
        data: { status: "FAILED" },
      });
      const msg =
        processError instanceof Error
          ? processError.message
          : "Error al procesar el archivo";
      return NextResponse.json({ error: msg }, { status: 422 });
    }
  } catch (error) {
    console.error("[documents POST]", error);
    return NextResponse.json(
      { error: "Error al subir el documento" },
      { status: 500 }
    );
  }
}
