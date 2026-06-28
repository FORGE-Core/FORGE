import { NextResponse } from "next/server";
import { serviceErrorResponse } from "@/lib/api/service-response";
import {
  buildOrganizationContext,
  requireAdminApi,
  requireTenantApi,
} from "@/lib/api/tenant-route";
import { getTeamMemberDetail, updateUser } from "@/services/server/users";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenant = await requireTenantApi();
    if (!tenant.ok) return tenant.response;

    const { id } = await params;
    const data = await getTeamMemberDetail(
      buildOrganizationContext(tenant.session),
      id
    );
    return NextResponse.json(data);
  } catch (error) {
    return serviceErrorResponse(error);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenant = await requireAdminApi();
    if (!tenant.ok) return tenant.response;

    const { id } = await params;
    const body = await req.json();

    const user = await updateUser(tenant.admin, id, {
      name: body.name,
      role: body.role,
      status: body.status,
      password: body.password,
    });

    return NextResponse.json({ user });
  } catch (error) {
    return serviceErrorResponse(error);
  }
}
