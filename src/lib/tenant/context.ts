import type { Session } from "next-auth";
import { auth } from "@/auth";
import type {
  AdminContext,
  OrganizationContext,
  ServiceContext,
} from "@/services/server/types";
import { ServiceError } from "@/services/server/errors";
import { isAdmin } from "@/lib/auth/roles";
import { getTenantDb } from "@/lib/db/tenant-client";

export function buildServiceContext(session: Session): ServiceContext {
  const userId = session.user?.id;
  const organizationId = session.user?.organizationId;
  const role = session.user?.role;

  if (!userId || !organizationId || !role) {
    throw new ServiceError("UNAUTHORIZED", "Sesión incompleta");
  }

  return { userId, organizationId, role, db: getTenantDb(organizationId) };
}

export function buildOrganizationContext(
  session: Session
): OrganizationContext {
  const organizationId = session.user?.organizationId;
  if (!organizationId) {
    throw new ServiceError("UNAUTHORIZED", "Debes iniciar sesión");
  }
  return {
    organizationId,
    role: session.user?.role,
    db: getTenantDb(organizationId),
  };
}

export function buildAdminContext(session: Session): AdminContext {
  const ctx = buildServiceContext(session);
  if (!isAdmin(ctx.role)) {
    throw new ServiceError("FORBIDDEN", "Solo los administradores pueden realizar esta acción");
  }
  return ctx as AdminContext;
}

type TenantSessionResult =
  | { ok: true; session: Session; ctx: ServiceContext }
  | { ok: false; status: 401; error: string };

/** Para route handlers: sesión + contexto de servicio en un paso. */
export async function requireTenantSession(): Promise<TenantSessionResult> {
  const session = await auth();
  if (!session?.user?.organizationId || !session.user.id || !session.user.role) {
    return { ok: false, status: 401, error: "Debes iniciar sesión" };
  }
  return {
    ok: true,
    session,
    ctx: buildServiceContext(session),
  };
}
