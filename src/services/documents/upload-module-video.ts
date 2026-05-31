import { db } from "@/lib/db";
import { deleteStoredFile, saveOrganizationFile } from "@/lib/document-storage";

const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

const VIDEO_MIMES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
]);

export function isVideoFile(file: File) {
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

export async function uploadModuleVideo({
  organizationId,
  moduleId,
  moduleTitle,
  file,
}: {
  organizationId: string;
  moduleId: string;
  moduleTitle: string;
  file: File;
}) {
  if (!isVideoFile(file)) {
    throw new Error("Formatos permitidos: .mp4, .webm, .mov");
  }

  if (file.size > MAX_VIDEO_BYTES) {
    throw new Error("El video supera el límite de 100 MB");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = videoExtension(file);

  const existing = await db.document.findFirst({
    where: { organizationId, moduleId, type: "VIDEO" },
  });

  if (existing?.fileUrl) {
    await deleteStoredFile(existing.fileUrl);
  }

  const title = `Video — ${moduleTitle}`;

  if (existing) {
    const relativePath = await saveOrganizationFile(
      organizationId,
      existing.id,
      buffer,
      ext
    );

    await db.document.update({
      where: { id: existing.id },
      data: {
        title,
        status: "READY",
        mimeType: file.type || "video/mp4",
        fileSize: file.size,
        fileUrl: relativePath,
        metadata: {
          mediaType: "video",
          moduleVideo: true,
          processedAt: new Date().toISOString(),
        },
      },
    });

    return existing.id;
  }

  const document = await db.document.create({
    data: {
      organizationId,
      moduleId,
      title,
      type: "VIDEO",
      status: "PROCESSING",
      mimeType: file.type || "video/mp4",
      fileSize: file.size,
      metadata: { mediaType: "video", moduleVideo: true },
    },
  });

  const relativePath = await saveOrganizationFile(
    organizationId,
    document.id,
    buffer,
    ext
  );

  await db.document.update({
    where: { id: document.id },
    data: {
      fileUrl: relativePath,
      status: "READY",
      metadata: {
        mediaType: "video",
        moduleVideo: true,
        processedAt: new Date().toISOString(),
      },
    },
  });

  return document.id;
}

export async function getModuleVideo(organizationId: string, moduleId: string) {
  return db.document.findFirst({
    where: {
      organizationId,
      moduleId,
      type: "VIDEO",
      status: "READY",
      fileUrl: { not: null },
    },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      fileSize: true,
      updatedAt: true,
    },
  });
}
