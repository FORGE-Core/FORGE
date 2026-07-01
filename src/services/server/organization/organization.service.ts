import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth/roles";
import {
  isValidHexColor,
  parseOrganizationBranding,
  type OrganizationBranding,
} from "@/lib/organization/branding";
import { ServiceError } from "@/services/server/errors";
import type { AdminContext, OrganizationContext } from "@/services/server/types";
// Note: db (global) is used for shared-schema tables (organizations, users)
// ctx.db is used for tenant-schema tables (trainingModule, documents)

export async function getOrganization(ctx: OrganizationContext) {
  const [org, activeUsers, moduleCount, documentCount] = await Promise.all([
    db.organization.findUnique({
      where: { id: ctx.organizationId },
      select: {
        id: true,
        name: true,
        slug: true,
        industry: true,
        logoUrl: true,
        settings: true,
      },
    }),
    db.user.count({
      where: { organizationId: ctx.organizationId, status: "ACTIVE" },
    }),
    ctx.db.trainingModule.count({
      where: { organizationId: ctx.organizationId, status: "PUBLISHED" },
    }),
    ctx.db.document.count({ where: { organizationId: ctx.organizationId } }),
  ]);

  if (!org) {
    throw new ServiceError("NOT_FOUND", "Organización no encontrada");
  }

  const settings = (org.settings ?? {}) as Record<string, unknown>;
  const plan = (settings.plan as string) ?? "starter";

  return {
    organization: {
      ...org,
      plan,
      branding: parseOrganizationBranding(settings),
      stats: {
        activeUsers,
        moduleCount,
        documentCount,
      },
    },
    canManage: isAdmin(ctx.role),
  };
}

export async function updateOrganization(
  ctx: AdminContext,
  input: {
    name?: string;
    industry?: string;
    plan?: string;
    notifications?: Record<string, unknown>;
    alae?: Record<string, unknown>;
    branding?: Partial<OrganizationBranding>;
  }
) {
  const org = await db.organization.findUnique({
    where: { id: ctx.organizationId },
  });

  if (!org) {
    throw new ServiceError("NOT_FOUND", "Organización no encontrada");
  }

  const currentSettings = (org.settings ?? {}) as Record<string, unknown>;
  const nextSettings = { ...currentSettings };

  if (input.plan) nextSettings.plan = input.plan;
  if (input.notifications) {
    nextSettings.notifications = {
      ...(currentSettings.notifications as object),
      ...input.notifications,
    };
  }
  if (input.alae) {
    nextSettings.alae = {
      ...(currentSettings.alae as object),
      ...input.alae,
    };
  }
  if (input.branding) {
    const currentBranding = parseOrganizationBranding(currentSettings);
    const nextBranding = { ...currentBranding };

    if (input.branding.primary !== undefined) {
      if (!isValidHexColor(input.branding.primary)) {
        throw new ServiceError("VALIDATION", "Color principal inválido");
      }
      nextBranding.primary = input.branding.primary.trim().toLowerCase();
    }
    if (input.branding.secondary !== undefined) {
      if (!isValidHexColor(input.branding.secondary)) {
        throw new ServiceError("VALIDATION", "Color secundario inválido");
      }
      nextBranding.secondary = input.branding.secondary.trim().toLowerCase();
    }
    if (input.branding.accent !== undefined) {
      if (!isValidHexColor(input.branding.accent)) {
        throw new ServiceError("VALIDATION", "Color de acento inválido");
      }
      nextBranding.accent = input.branding.accent.trim().toLowerCase();
    }

    nextSettings.branding = nextBranding;
  }

  return db.organization.update({
    where: { id: ctx.organizationId },
    data: {
      name: input.name?.trim() || org.name,
      industry: input.industry?.trim() || org.industry,
      settings: nextSettings as Prisma.InputJsonValue,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      industry: true,
      settings: true,
    },
  });
}

export async function getOrganizationName(organizationId: string) {
  const org = await db.organization.findUnique({
    where: { id: organizationId },
    select: { name: true },
  });
  return org?.name ?? "Tu empresa";
}
