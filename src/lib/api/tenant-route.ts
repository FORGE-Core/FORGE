import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { assertAdminSession } from "@/lib/auth/roles";
import {
  buildAdminContext,
  buildOrganizationContext,
  requireTenantSession,
} from "@/lib/tenant";
import type { AdminContext, ServiceContext } from "@/services/server/types";

export function tenantAuthError(
  result: { ok: false; status: number; error: string }
) {
  return NextResponse.json({ error: result.error }, { status: result.status });
}

export function tenantAuthJsonError(
  result: { ok: false; status: number; error: string }
) {
  return Response.json({ error: result.error }, { status: result.status });
}

type TenantApiOk = {
  ok: true;
  session: Session;
  ctx: ServiceContext;
};

type TenantApiFail = {
  ok: false;
  response: NextResponse;
};

export async function requireTenantApi(): Promise<TenantApiOk | TenantApiFail> {
  const tenant = await requireTenantSession();
  if (!tenant.ok) {
    return { ok: false, response: tenantAuthError(tenant) };
  }
  return { ok: true, session: tenant.session, ctx: tenant.ctx };
}

type AdminApiOk = TenantApiOk & { admin: AdminContext };

export async function requireAdminApi(): Promise<AdminApiOk | TenantApiFail> {
  const tenant = await requireTenantApi();
  if (!tenant.ok) return tenant;

  const check = assertAdminSession(tenant.session);
  if (!check.ok) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: check.error },
        { status: check.status }
      ),
    };
  }

  return {
    ok: true,
    session: tenant.session,
    ctx: tenant.ctx,
    admin: buildAdminContext(tenant.session),
  };
}

export { buildOrganizationContext };
