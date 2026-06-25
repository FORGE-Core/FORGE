import { NextResponse } from "next/server";
import { serviceErrorResponse } from "@/lib/api/service-response";
import {
  buildOrganizationContext,
  requireAdminApi,
  requireTenantApi,
} from "@/lib/api/tenant-route";
import { createUser, listUsers } from "@/services/server/users";

export async function GET() {
  try {
    const tenant = await requireTenantApi();
    if (!tenant.ok) return tenant.response;

    const users = await listUsers(
      buildOrganizationContext(tenant.session)
    );
    return NextResponse.json({ users });
  } catch (error) {
    return serviceErrorResponse(error);
  }
}

export async function POST(req: Request) {
  try {
    const tenant = await requireAdminApi();
    if (!tenant.ok) return tenant.response;

    const body = await req.json();
    const user = await createUser(tenant.admin, {
      email: body.email,
      name: body.name,
      password: body.password,
      role: body.role,
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return serviceErrorResponse(error);
  }
}
