import type { UserRole } from "@prisma/client";

/** Datos del tenant expuestos al cliente (sin secretos). */
export type TenantSnapshot = {
  organizationId: string;
  name: string;
  slug: string;
  industry: string | null;
  logoUrl: string | null;
  plan: string;
  features: TenantFeatureFlags;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  role: UserRole;
};

export type TenantFeatureFlags = {
  analytics: boolean;
  reports: boolean;
  automations: boolean;
  pushNotifications: boolean;
};

export const DEFAULT_TENANT_FEATURES: TenantFeatureFlags = {
  analytics: true,
  reports: true,
  automations: true,
  pushNotifications: true,
};
