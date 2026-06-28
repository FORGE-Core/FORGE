import type { UserRole } from "@prisma/client";

/** Usuario empleado demo — solo para `prisma db seed` en desarrollo. */
export type SeedStaffUser = {
  email: string;
  password: string;
  name: string;
  roleTitle: string;
  role?: UserRole;
};

export type SeedAdminUser = {
  email: string;
  password: string;
  name: string;
};

export type SeedOrganizationConfig = {
  name: string;
  slug: string;
  industry: string;
  logoUrl?: string | null;
  settings: Record<string, unknown>;
};

export type SeedTrainingModule = {
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

/**
 * Definición de datos demo para `prisma db seed`.
 * No se usa en runtime: las empresas reales viven en PostgreSQL (`Organization`).
 */
export type OrganizationSeedDefinition = {
  /** Identificador del bundle bajo `seed-data/demos/{id}/` */
  id: string;
  organization: SeedOrganizationConfig;
  admin: SeedAdminUser;
  staff: SeedStaffUser[];
  modules: SeedTrainingModule[];
  /** Subcarpeta con markdown, relativa a `seed-data/demos/{id}/` */
  contentDir: string;
};
