import type { Session } from "next-auth";
import { db } from "@/lib/db";
import {
  DEFAULT_TENANT_FEATURES,
  type TenantFeatureFlags,
  type TenantSnapshot,
} from "./types";

function parseFeatureFlags(settings: Record<string, unknown>): TenantFeatureFlags {
  const raw = settings.features;
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_TENANT_FEATURES };
  }
  const flags = raw as Record<string, unknown>;
  return {
    analytics: flags.analytics !== false,
    reports: flags.reports !== false,
    automations: flags.automations !== false,
    pushNotifications: flags.pushNotifications !== false,
  };
}

export async function getTenantSnapshot(
  organizationId: string
): Promise<Omit<TenantSnapshot, "userId" | "userName" | "userEmail" | "role"> | null> {
  const org = await db.organization.findUnique({
    where: { id: organizationId },
    select: {
      id: true,
      name: true,
      slug: true,
      industry: true,
      logoUrl: true,
      settings: true,
    },
  });

  if (!org) return null;

  const settings = (org.settings ?? {}) as Record<string, unknown>;
  const plan = (settings.plan as string) ?? "starter";

  return {
    organizationId: org.id,
    name: org.name,
    slug: org.slug,
    industry: org.industry,
    logoUrl: org.logoUrl,
    plan,
    features: parseFeatureFlags(settings),
  };
}

export async function getTenantSnapshotForSession(
  session: Session
): Promise<TenantSnapshot | null> {
  const organizationId = session.user?.organizationId;
  const userId = session.user?.id;
  const role = session.user?.role;

  if (!organizationId || !userId || !role) return null;

  const org = await getTenantSnapshot(organizationId);
  if (!org) return null;

  return {
    ...org,
    userId,
    userName: session.user?.name ?? null,
    userEmail: session.user?.email ?? null,
    role,
  };
}

export async function requireActiveOrganization(organizationId: string) {
  const org = await db.organization.findUnique({
    where: { id: organizationId },
    select: { id: true, name: true, slug: true },
  });
  if (!org) {
    throw new Error("Organización no encontrada");
  }
  return org;
}
