import type { PrismaClient, UserRole } from "@prisma/client";
import { getLatestInclusionScores } from "@/lib/alae/inclusion-scorer";
import { canManageDocuments } from "@/lib/auth/roles";
import type { ModuleCardData } from "@/components/modules/module-card";
import { getOrganizationModuleBySlug } from "@/lib/training/modules";
import { getModuleVideo } from "@/services/server/documents/upload-module-video";
import { buildDocumentDeliveryUrl } from "@/lib/storage/delivery-url";

export type ModuleDetailData = ModuleCardData & {
  id: string;
  description: string | null;
  audience: string | null;
  estimatedMins: number | null;
  moduleStatus: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  documentId: string | null;
  videoId: string | null;
  videoUrl: string | null;
  hasVideo: boolean;
  canManage: boolean;
  lessons: {
    id: string;
    title: string;
    duration: string;
    completed?: boolean;
    current?: boolean;
  }[];
  resources: { id: string; name: string; type: string }[];
  inclusionScore?: number | null;
  inclusionIssues?: string[];
  inclusionRecommendations?: string[];
};

export async function getModuleDetailForPage(
  organizationId: string,
  userId: string,
  role: UserRole,
  slug: string,
  tenantDb?: PrismaClient
): Promise<ModuleDetailData | null> {
  const result = await getOrganizationModuleBySlug(organizationId, slug, userId, tenantDb);
  if (!result) return null;

  const moduleId = result.module.id;
  const canManage = canManageDocuments(role);

  const [video, inclusionScores, processes, moduleDocuments] = await Promise.all([
    getModuleVideo(organizationId, moduleId),
    getLatestInclusionScores(organizationId, "MODULE", [moduleId]),
    tenantDb
      ? tenantDb.process.findMany({
          where: { organizationId, moduleId },
          orderBy: { orderIndex: "asc" },
          select: { id: true, title: true, description: true, steps: true },
        })
      : Promise.resolve([]),
    tenantDb
      ? tenantDb.document.findMany({
          where: {
            organizationId,
            moduleId,
            status: "READY",
          },
          select: { id: true, title: true, type: true },
        })
      : Promise.resolve([]),
  ]);

  const inclusion = inclusionScores.get(moduleId);

  const steps = processes.flatMap((p) => {
    const raw = p.steps;
    if (!Array.isArray(raw)) return [];
    return raw.map((s, i) => ({
      id: `${p.id}-${i}`,
      title:
        typeof s === "object" && s && "title" in s
          ? String((s as { title: string }).title)
          : `Paso ${i + 1}`,
      duration: "?",
      completed: false,
    }));
  });

  const lessons =
    steps.length > 0
      ? steps
      : [
          {
            id: "intro",
            title: "Introducción al módulo",
            duration: "10 min",
            completed: false,
          },
          {
            id: "practice",
            title: "Práctica y evaluación",
            duration: result.module.estimatedMins
              ? `${result.module.estimatedMins} min`
              : "15 min",
            completed: false,
            current: true,
          },
        ];

  const resources = moduleDocuments.map((d) => ({
    id: d.id,
    name: d.title,
    type:
      d.type === "VIDEO" ? "video" : d.type === "IMAGE" ? "image" : "pdf",
  }));

  const videoUrl = video?.fileUrl
    ? buildDocumentDeliveryUrl(video.fileUrl, {
        documentType: "VIDEO",
        inline: true,
      }) ?? `/api/documents/${video.id}/file`
    : null;

  return {
    ...result.card,
    id: result.module.id,
    title: result.module.title,
    description: result.module.description,
    audience: result.module.audience,
    estimatedMins: result.module.estimatedMins,
    moduleStatus: result.module.status,
    documentId: result.card.documentId,
    videoId: video?.id ?? null,
    videoUrl,
    hasVideo: !!video,
    canManage,
    lessons,
    resources,
    inclusionScore: inclusion?.score ?? null,
    inclusionIssues: inclusion?.issues ?? [],
    inclusionRecommendations: inclusion?.recommendations ?? [],
  };
}
