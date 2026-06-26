import {
  canManageDocuments,
  EMPLOYEE_VISIBLE_DOCUMENT_TYPES,
  isAdmin,
} from "@/lib/auth/roles";
import { getLatestInclusionScores } from "@/lib/alae/inclusion-scorer";
import { deleteStoredFile, readStoredFile, saveOrganizationFile } from "@/lib/storage";
import { buildDocumentDeliveryUrl } from "@/lib/storage/delivery-url";
import { db } from "@/lib/db";
import { logLearningEvent } from "@/lib/learning/events";
import { generateLearningContentFromDocument } from "@/services/server/ai/generate-learning-content";
import { ServiceError } from "@/services/server/errors";
import type { AdminContext, OrganizationContext } from "@/services/server/types";
import { assertModuleInOrganization } from "@/services/server/shared/tenant-guards";
import {
  extractPdfText,
  processDocumentContent,
} from "./process-document";

const MAX_PDF_BYTES = 15 * 1024 * 1024;
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
const MAX_IMAGE_BYTES = 12 * 1024 * 1024;

const VIDEO_MIMES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
]);

export type OrganizationDocumentItem = {
  id: string;
  title: string;
  type: string;
  status: string;
  fileSize: number | null;
  chunkCount: number;
  embeddingCount: number;
  contentGenerated: boolean;
  createdAt: string;
  fileUrl: string | null;
  hasFile: boolean;
  deliveryUrl: string | null;
  inclusionScore: number | null;
  inclusionIssues: string[];
  inclusionRecommendations: string[];
};

function isPdf(file: File) {
  return (
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
  );
}

function isImage(file: File) {
  const name = file.name.toLowerCase();
  return (
    file.type.startsWith("image/") ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".png") ||
    name.endsWith(".webp") ||
    name.endsWith(".gif")
  );
}

function imageExtension(file: File): string {
  const name = file.name.toLowerCase();
  if (name.endsWith(".png")) return ".png";
  if (name.endsWith(".webp")) return ".webp";
  if (name.endsWith(".gif")) return ".gif";
  return ".jpg";
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

export async function getOrganizationDocument(
  documentId: string,
  organizationId: string
) {
  return db.document.findFirst({
    where: { id: documentId, organizationId },
  });
}

export async function listDocuments(ctx: OrganizationContext) {
  const { organizationId, role } = ctx;
  const admin = isAdmin(role);
  const canManage = canManageDocuments(role);

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
    include: { _count: { select: { chunks: true } } },
  });

  const pdfIds = documents.filter((d) => d.type === "PDF").map((d) => d.id);
  const inclusionScores = await getLatestInclusionScores(
    organizationId,
    "DOCUMENT",
    pdfIds
  );

  const items: OrganizationDocumentItem[] = documents.map((doc) => ({
    id: doc.id,
    title: doc.title,
    type: doc.type,
    status: doc.status,
    fileSize: doc.fileSize,
    chunkCount: doc._count.chunks,
    embeddingCount:
      typeof doc.metadata === "object" &&
      doc.metadata &&
      "embeddingCount" in doc.metadata
        ? Number((doc.metadata as { embeddingCount?: number }).embeddingCount)
        : 0,
    contentGenerated: !!(
      typeof doc.metadata === "object" &&
      doc.metadata &&
      "learningContentGeneratedAt" in doc.metadata
    ),
    createdAt: doc.createdAt.toISOString(),
    fileUrl: doc.fileUrl,
    hasFile: !!doc.fileUrl,
    deliveryUrl: buildDocumentDeliveryUrl(doc.fileUrl, {
      documentType: doc.type,
      mimeType: doc.mimeType,
      inline: true,
    }),
    inclusionScore: inclusionScores.get(doc.id)?.score ?? null,
    inclusionIssues: inclusionScores.get(doc.id)?.issues ?? [],
    inclusionRecommendations:
      inclusionScores.get(doc.id)?.recommendations ?? [],
  }));

  return { canManage, canUpload: canManage, documents: items };
}

export async function uploadDocument(
  ctx: AdminContext,
  input: {
    file: File;
    title?: string;
    moduleId?: string;
    autoGenerate?: boolean;
  }
) {
  const pdf = isPdf(input.file);
  const video = isVideo(input.file);
  const image = isImage(input.file);

  if (!pdf && !video && !image) {
    throw new ServiceError(
      "VALIDATION",
      "Formatos permitidos: PDF, imagen (.jpg, .png, .webp) o video (.mp4, .webm, .mov)"
    );
  }

  const maxBytes = pdf
    ? MAX_PDF_BYTES
    : video
      ? MAX_VIDEO_BYTES
      : MAX_IMAGE_BYTES;
  if (input.file.size > maxBytes) {
    const limitMb = maxBytes / (1024 * 1024);
    throw new ServiceError(
      "VALIDATION",
      `El archivo supera el límite de ${limitMb} MB`
    );
  }

  if (input.moduleId) {
    await assertModuleInOrganization(input.moduleId, ctx.organizationId);
  }

  const buffer = Buffer.from(await input.file.arrayBuffer());
  const ext = pdf ? ".pdf" : video ? videoExtension(input.file) : imageExtension(input.file);
  const docType = pdf ? "PDF" : video ? "VIDEO" : "IMAGE";
  const defaultTitle =
    input.file.name.replace(/\.[^.]+$/, "").trim() || "Sin título";
  const title = input.title?.trim() || defaultTitle;

  const document = await db.document.create({
    data: {
      organizationId: ctx.organizationId,
      title,
      type: docType,
      status: "PROCESSING",
      mimeType:
        input.file.type ||
        (pdf ? "application/pdf" : video ? "video/mp4" : "image/jpeg"),
      fileSize: input.file.size,
      moduleId: input.moduleId,
    },
  });

  try {
    const relativePath = await saveOrganizationFile(
      ctx.organizationId,
      document.id,
      buffer,
      ext,
      input.file.type || undefined
    );

    await db.document.update({
      where: { id: document.id },
      data: { fileUrl: relativePath },
    });

    let chunkCount = 0;

    if (pdf) {
      const text = await extractPdfText(buffer);
      chunkCount = await processDocumentContent({
        organizationId: ctx.organizationId,
        documentId: document.id,
        text,
      });

      const autoGenerate = input.autoGenerate !== false;
      if (autoGenerate && chunkCount > 0) {
        // Generación de contenido IA en background — no bloquea la respuesta
        void (async () => {
          try {
            const gen = await generateLearningContentFromDocument({
              organizationId: ctx.organizationId,
              documentId: document.id,
              moduleId: input.moduleId,
            });
            await logLearningEvent({
              organizationId: ctx.organizationId,
              userId: ctx.userId,
              eventType: "DOCUMENT_CONTENT_GENERATED",
              payload: {
                documentId: document.id,
                moduleId: gen.moduleId,
                items: gen.created,
                auto: true,
              },
            });
          } catch (genErr) {
            console.warn("[documents] auto-generación omitida:", genErr);
          }
        })();
      }
    } else if (video || image) {
      await db.document.update({
        where: { id: document.id },
        data: {
          status: "READY",
          metadata: {
            mediaType: video ? "video" : "image",
            processedAt: new Date().toISOString(),
            storageProvider: relativePath.startsWith("cloudinary://")
              ? "cloudinary"
              : "local",
          },
        },
      });
    }

    const updated = await db.document.findUnique({
      where: { id: document.id },
      include: { _count: { select: { chunks: true } } },
    });

    return {
      document: {
        id: updated!.id,
        title: updated!.title,
        type: updated!.type,
        status: updated!.status,
        chunkCount: pdf ? chunkCount : updated!._count.chunks,
        fileSize: updated!.fileSize,
        createdAt: updated!.createdAt,
      },
      generated: null,
    };
  } catch (processError) {
    console.error("[documents upload]", processError);
    await db.document.update({
      where: { id: document.id },
      data: { status: "FAILED" },
    });
    const msg =
      processError instanceof ServiceError
        ? processError.message
        : processError instanceof Error
          ? processError.message
          : "Error al procesar el archivo";
    throw new ServiceError("PROCESSING", msg);
  }
}

export async function deleteDocument(ctx: AdminContext, documentId: string) {
  const document = await getOrganizationDocument(
    documentId,
    ctx.organizationId
  );
  if (!document) {
    throw new ServiceError("NOT_FOUND", "Documento no encontrado");
  }

  if (document.fileUrl) {
    await deleteStoredFile(document.fileUrl);
  }

  await db.document.delete({ where: { id: document.id } });
  return { ok: true as const };
}

export async function reprocessDocument(ctx: AdminContext, documentId: string) {
  const document = await getOrganizationDocument(
    documentId,
    ctx.organizationId
  );

  if (!document?.fileUrl) {
    throw new ServiceError("NOT_FOUND", "Documento sin archivo almacenado");
  }

  if (document.type !== "PDF") {
    throw new ServiceError(
      "VALIDATION",
      "Solo se pueden reprocesar archivos PDF subidos"
    );
  }

  await db.document.update({
    where: { id: documentId },
    data: { status: "PROCESSING" },
  });

  const buffer = await readStoredFile(document.fileUrl);
  const text = await extractPdfText(buffer);

  const chunkCount = await processDocumentContent({
    organizationId: ctx.organizationId,
    documentId,
    text,
  });

  return { chunkCount, status: "READY" as const };
}

export async function generateDocumentLearningContent(
  ctx: AdminContext,
  documentId: string,
  moduleId?: string | null
) {
  const document = await getOrganizationDocument(
    documentId,
    ctx.organizationId
  );
  if (!document) {
    throw new ServiceError("NOT_FOUND", "Documento no encontrado");
  }

  if (moduleId) {
    await assertModuleInOrganization(moduleId, ctx.organizationId);
  }

  const result = await generateLearningContentFromDocument({
    organizationId: ctx.organizationId,
    documentId,
    moduleId: moduleId ?? document.moduleId,
  });

  await logLearningEvent({
    organizationId: ctx.organizationId,
    userId: ctx.userId,
    eventType: "DOCUMENT_CONTENT_GENERATED",
    payload: {
      documentId,
      moduleId: result.moduleId,
      items: result.created,
    },
  });

  return result;
}
