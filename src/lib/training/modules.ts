import { db } from "@/lib/db";
import { formatDuration } from "@/lib/training/format";
import { getModuleVideo } from "@/services/documents/upload-module-video";
import type { ModuleCardData } from "@/components/modules/module-card";

const GRADIENTS = [
  "from-amber-700 to-orange-900",
  "from-rose-600 to-red-800",
  "from-orange-500 to-amber-700",
  "from-violet-600 to-purple-900",
  "from-emerald-600 to-teal-800",
  "from-slate-600 to-slate-900",
  "from-indigo-600 to-blue-900",
  "from-cyan-500 to-blue-700",
  "from-stone-500 to-stone-700",
];

function progressStatus(
  percent: number
): ModuleCardData["status"] {
  if (percent >= 100) return "completed";
  if (percent > 0) return "in_progress";
  return "pending";
}

export type OrganizationModule = ModuleCardData & {
  id: string;
  description: string | null;
  audience: string | null;
  documentId: string | null;
  videoId: string | null;
  hasVideo: boolean;
};

export async function getOrganizationModules(
  organizationId: string,
  userId?: string
): Promise<OrganizationModule[]> {
  const modules = await db.trainingModule.findMany({
    where: {
      organizationId,
      status: "PUBLISHED",
    },
    orderBy: { orderIndex: "asc" },
    include: {
      documents: {
        where: { type: "MANUAL" },
        take: 1,
        orderBy: { createdAt: "asc" },
        select: { id: true },
      },
      progress: userId
        ? { where: { userId }, take: 1 }
        : false,
    },
  });

  return Promise.all(
    modules.map(async (mod, index) => {
      const userProgress =
        userId && Array.isArray(mod.progress) ? mod.progress[0] : undefined;
      const percent = Math.round(userProgress?.percentComplete ?? 0);
      const video = await getModuleVideo(organizationId, mod.id);

      const category =
        (mod.audience?.includes("Gerencia")
          ? "Gerencia"
          : mod.audience?.split(",")[0]?.trim()) || "Capacitación";

      return {
        id: mod.id,
        slug: mod.slug ?? mod.id,
        title: mod.title,
        category,
        level: mod.audience ?? "Operativo",
        duration: mod.estimatedMins
          ? formatDuration(mod.estimatedMins)
          : "—",
        status: progressStatus(percent),
        progress: percent,
        gradient: GRADIENTS[index % GRADIENTS.length],
        description: mod.description,
        audience: mod.audience,
        documentId: mod.documents[0]?.id ?? null,
        videoId: video?.id ?? null,
        hasVideo: !!video,
      };
    })
  );
}

export async function getOrganizationModuleBySlug(
  organizationId: string,
  slug: string,
  userId?: string
) {
  const mod = await db.trainingModule.findFirst({
    where: { organizationId, slug, status: "PUBLISHED" },
    include: {
      documents: {
        where: { type: "MANUAL" },
        take: 1,
        orderBy: { createdAt: "asc" },
        select: { id: true, title: true },
      },
      progress: userId ? { where: { userId }, take: 1 } : false,
    },
  });

  if (!mod) return null;

  const modules = await getOrganizationModules(organizationId, userId);
  const card = modules.find((m) => m.slug === slug);
  if (!card) return null;

  return { module: mod, card };
}
