import { Prisma } from "@prisma/client";
import { ServiceError } from "@/services/server/errors";
import type { AdminContext, OrganizationContext } from "@/services/server/types";
import { assertModuleInOrganization } from "@/services/server/shared/tenant-guards";

export async function listProcesses(
  ctx: OrganizationContext,
  moduleId?: string | null
) {
  if (moduleId) {
    await assertModuleInOrganization(moduleId, ctx.organizationId, ctx.db);
  }

  return ctx.db.process.findMany({
    where: {
      organizationId: ctx.organizationId,
      ...(moduleId ? { moduleId } : {}),
    },
    orderBy: { orderIndex: "asc" },
    include: {
      module: { select: { title: true, slug: true } },
      _count: { select: { documents: true } },
    },
  });
}

export async function createProcess(
  ctx: AdminContext,
  input: {
    title: string;
    description?: string;
    moduleId?: string | null;
    steps?: unknown[];
  }
) {
  if (!input.title?.trim()) {
    throw new ServiceError("VALIDATION", "Título requerido");
  }

  if (input.moduleId) {
    await assertModuleInOrganization(input.moduleId, ctx.organizationId);
  }

  const count = await ctx.db.process.count({
    where: {
      organizationId: ctx.organizationId,
      moduleId: input.moduleId ?? null,
    },
  });

  return ctx.db.process.create({
    data: {
      organizationId: ctx.organizationId,
      moduleId: input.moduleId || null,
      title: input.title.trim(),
      description: input.description?.trim(),
      steps: (Array.isArray(input.steps) ? input.steps : []) as Prisma.InputJsonValue,
      orderIndex: count,
    },
  });
}

export async function updateProcess(
  ctx: AdminContext,
  processId: string,
  input: {
    title?: string;
    description?: string;
    moduleId?: string | null;
    steps?: unknown[];
  }
) {
  const existing = await ctx.db.process.findFirst({
    where: { id: processId, organizationId: ctx.organizationId },
  });

  if (!existing) {
    throw new ServiceError("NOT_FOUND", "Proceso no encontrado");
  }

  if (input.moduleId) {
    await assertModuleInOrganization(input.moduleId, ctx.organizationId);
  }

  return ctx.db.process.update({
    where: { id: processId },
    data: {
      title: input.title?.trim() ?? existing.title,
      description: input.description?.trim() ?? existing.description,
      steps: (input.steps ?? existing.steps) as Prisma.InputJsonValue,
      moduleId: input.moduleId ?? existing.moduleId,
    },
  });
}

export async function deleteProcess(ctx: AdminContext, processId: string) {
  const existing = await ctx.db.process.findFirst({
    where: { id: processId, organizationId: ctx.organizationId },
  });

  if (!existing) {
    throw new ServiceError("NOT_FOUND", "Proceso no encontrado");
  }

  await ctx.db.process.delete({ where: { id: processId } });
  return { ok: true as const };
}
