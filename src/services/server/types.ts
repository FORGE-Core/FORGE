import type { UserRole } from "@prisma/client";

/** Contexto de tenant obligatorio en toda operación de servicio. */
export interface ServiceContext {
  organizationId: string;
  userId: string;
  role: UserRole;
}

/** Contexto mínimo para operaciones que solo requieren organización. */
export interface OrganizationContext {
  organizationId: string;
  role?: UserRole;
}

export type AdminContext = ServiceContext & { role: "ADMIN" };
