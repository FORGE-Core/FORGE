import type { PrismaClient } from "@prisma/client";
import type { UserRole } from "@prisma/client";

/** Contexto de tenant obligatorio en toda operación de servicio. */
export interface ServiceContext {
  organizationId: string;
  userId: string;
  role: UserRole;
  /** Cliente Prisma apuntando al schema del tenant (search_path = tenant_{orgId},public) */
  db: PrismaClient;
}

/** Contexto mínimo para operaciones que solo requieren organización. */
export interface OrganizationContext {
  organizationId: string;
  role?: UserRole;
  /** Cliente Prisma apuntando al schema del tenant (search_path = tenant_{orgId},public) */
  db: PrismaClient;
}

export type AdminContext = ServiceContext & { role: "ADMIN" };
