import { db } from "@/lib/db";
import { deleteStoredFile, saveOrganizationFile } from "@/lib/storage";

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

function videoTitleFromFile(file: File, moduleTitle: string, index: number): string {
  const base = file.name.replace(/\.[^.]+$/, "").trim();
  if (base) return base;
  return `Video ${index} — ${moduleTitle}`;
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

  const existingCount = await db.document.count({
    where: { organizationId, moduleId, type: "VIDEO" },
  });

  const title = videoTitleFromFile(file, moduleTitle, existingCount + 1);

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
    ext,
    file.type || undefined
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
        storageProvider: relativePath.startsWith("cloudinary://")
          ? "cloudinary"
          : "local",
      },
    },
  });

  return document.id;
}

export async function getModuleVideos(organizationId: string, moduleId: string) {
  return db.document.findMany({
    where: {
      organizationId,
      moduleId,
      type: "VIDEO",
      status: "READY",
      fileUrl: { not: null },
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      title: true,
      fileSize: true,
      fileUrl: true,
      mimeType: true,
      createdAt: true,
    },
  });
}

/** @deprecated Usa getModuleVideos */
export async function getModuleVideo(organizationId: string, moduleId: string) {
  const videos = await getModuleVideos(organizationId, moduleId);
  return videos[0] ?? null;
}

export async function deleteModuleVideo(
  organizationId: string,
  moduleId: string,
  videoId: string
) {
  const video = await db.document.findFirst({
    where: {
      id: videoId,
      organizationId,
      moduleId,
      type: "VIDEO",
    },
  });

  if (!video) {
    throw new Error("Video no encontrado");
  }

  if (video.fileUrl) {
    await deleteStoredFile(video.fileUrl);
  }

  await db.document.delete({ where: { id: video.id } });
}
