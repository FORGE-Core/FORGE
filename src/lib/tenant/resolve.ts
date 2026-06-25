import type { Session } from "next-auth";
import { auth } from "@/auth";

/**
 * Resuelve el tenant únicamente desde la sesión autenticada.
 * No confía en headers del cliente (evita spoofing de organizationId).
 */
export async function resolveOrganizationId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.organizationId ?? null;
}

export function resolveOrganizationIdFromSession(
  session: Session | null
): string | null {
  return session?.user?.organizationId ?? null;
}

export function resolveUserIdFromSession(session: Session | null): string | null {
  return session?.user?.id ?? null;
}

/** Filtro Prisma estándar por tenant. */
export function tenantScope(organizationId: string) {
  return { organizationId };
}
