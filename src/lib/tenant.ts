import { headers } from "next/headers";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export const TENANT_HEADER = "x-organization-id";

/** Resuelve el tenant desde header (API) o sesión (app) */
export async function getOrganizationId(): Promise<string | null> {
  const h = await headers();
  const fromHeader = h.get(TENANT_HEADER);
  if (fromHeader) return fromHeader;

  const session = await auth();
  return session?.user?.organizationId ?? null;
}

export async function requireOrganization(organizationId: string) {
  const org = await db.organization.findUnique({
    where: { id: organizationId },
  });
  if (!org) throw new Error("Organización no encontrada");
  return org;
}

/** Aísla queries Prisma por tenant */
export function tenantScope(organizationId: string) {
  return { organizationId };
}
