import { db } from "@/lib/db";
import { formatDuration } from "@/lib/training/format";
import type { ModuleCardData } from "@/components/modules/module-card";
import { getLatestInclusionScores } from "@/lib/alae/inclusion-scorer";
import { isAdmin } from "@/lib/auth/roles";
import { ServiceError } from "@/services/server/errors";
import type { AdminContext, OrganizationContext } from "@/services/server/types";
import { slugify } from "@/services/server/shared/slugify";

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

function progressStatus(percent: number): ModuleCardData["status"] {
  if (percent >= 100) return "completed";
  if (percent > 0) return "in_progress";
  return "pending";
}

type ModuleRow = {
  id: string;
  slug: string | null;
  title: string;
  description: string | null;
  audience: string | null;
  estimatedMins: number | null;
  orderIndex: number;
  documents: { id: string }[];
  progress?: { percentComplete: number }[];
};

function mapModuleRow(
  mod: ModuleRow,
  index: number,
  videoId: string | null,
  userId?: string
): OrganizationModule {
  const userProgress =
    userId && Array.isArray(mod.progress) ? mod.progress[0] : undefined;
  const percent = Math.round(userProgress?.percentComplete ?? 0);

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
    duration: mod.estimatedMins ? formatDuration(mod.estimatedMins) : "—",
    status: progressStatus(percent),
    progress: percent,
    gradient: GRADIENTS[index % GRADIENTS.length],
    description: mod.description,
    audience: mod.audience,
    documentId: mod.documents[0]?.id ?? null,
    videoId,
    hasVideo: !!videoId,
  };
}

export type OrganizationModule = ModuleCardData & {
  id: string;
  description: string | null;
  audience: string | null;
  documentId: string | null;
  videoId: string | null;
  hasVideo: boolean;
  inclusionScore?: number | null;
};

export async function getOrganizationModules(
  organizationId: string,
  userId?: string
): Promise<OrganizationModule[]> {
  const modules = await db.trainingModule.findMany({
    where: { organizationId, status: "PUBLISHED" },
    orderBy: { orderIndex: "asc" },
    include: {
      documents: {
        where: { type: "MANUAL" },
        take: 1,
        orderBy: { createdAt: "asc" },
        select: { id: true },
      },
      progress: userId ? { where: { userId }, take: 1 } : false,
    },
  });

  const moduleIds = modules.map((m) => m.id);
  const videos =
    moduleIds.length > 0
      ? await db.document.findMany({
          where: {
            organizationId,
            moduleId: { in: moduleIds },
            type: "VIDEO",
            status: "READY",
            fileUrl: { not: null },
          },
          orderBy: { updatedAt: "desc" },
          select: { id: true, moduleId: true },
        })
      : [];

  const videoByModuleId = new Map<string, string>();
  for (const video of videos) {
    if (video.moduleId && !videoByModuleId.has(video.moduleId)) {
      videoByModuleId.set(video.moduleId, video.id);
    }
  }

  return modules.map((mod, index) =>
    mapModuleRow(mod, index, videoByModuleId.get(mod.id) ?? null, userId)
  );
}

export async function listModules(ctx: OrganizationContext & { userId?: string }) {
  const modules = await getOrganizationModules(
    ctx.organizationId,
    ctx.userId
  );

  if (!isAdmin(ctx.role)) {
    return modules;
  }

  const scores = await getLatestInclusionScores(
    ctx.organizationId,
    "MODULE",
    modules.map((m) => m.id)
  );

  return modules.map((m) => ({
    ...m,
    inclusionScore: scores.get(m.id)?.score ?? null,
  }));
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

  const video = await db.document.findFirst({
    where: {
      organizationId,
      moduleId: mod.id,
      type: "VIDEO",
      status: "READY",
      fileUrl: { not: null },
    },
    orderBy: { updatedAt: "desc" },
    select: { id: true },
  });

  const card = mapModuleRow(
    mod,
    mod.orderIndex,
    video?.id ?? null,
    userId
  );

  return { module: mod, card };
}

export async function createModule(
  ctx: AdminContext,
  input: {
    title: string;
    description?: string;
    audience?: string;
    estimatedMins?: number;
    status?: "DRAFT" | "PUBLISHED";
  }
) {
  const title = input.title.trim();
  if (!title) {
    throw new ServiceError("VALIDATION", "Título requerido");
  }

  const baseSlug = slugify(title) || `modulo-${Date.now()}`;
  let slug = baseSlug;
  let suffix = 1;
  while (
    await db.trainingModule.findFirst({
      where: { organizationId: ctx.organizationId, slug },
    })
  ) {
    slug = `${baseSlug}-${suffix++}`;
  }

  const count = await db.trainingModule.count({
    where: { organizationId: ctx.organizationId },
  });

  return db.trainingModule.create({
    data: {
      organizationId: ctx.organizationId,
      slug,
      title,
      description: input.description?.trim(),
      audience: input.audience?.trim(),
      estimatedMins: input.estimatedMins ? Number(input.estimatedMins) : 20,
      status: input.status === "DRAFT" ? "DRAFT" : "PUBLISHED",
      orderIndex: count,
    },
  });
}
