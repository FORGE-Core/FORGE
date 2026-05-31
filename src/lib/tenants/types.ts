import type { UserRole } from "@prisma/client";

export type TenantStaffSeed = {
  email: string;
  password: string;
  name: string;
  roleTitle: string;
  role?: UserRole;
};

export type TenantAdminSeed = {
  email: string;
  password: string;
  name: string;
};

export type TenantOrganization = {
  name: string;
  slug: string;
  industry: string;
  logoUrl?: string | null;
  settings: Record<string, unknown>;
};

export type TenantTrainingModule = {
  slug: string;
  file: string;
  title: string;
  description: string;
  audience: string;
  estimatedMins: number;
  orderIndex: number;
  category: string;
  level: string;
  gradient: string;
};

export type TenantDefinition = {
  /** Carpeta del tenant bajo `tenants/` */
  id: string;
  organization: TenantOrganization;
  admin: TenantAdminSeed;
  staff: TenantStaffSeed[];
  modules: TenantTrainingModule[];
  /** Subcarpeta con markdown, relativa a `tenants/{id}/` */
  contentDir: string;
};
