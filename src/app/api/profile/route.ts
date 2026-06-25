import { NextResponse } from "next/server";
import { serviceErrorResponse } from "@/lib/api/service-response";
import { requireTenantApi } from "@/lib/api/tenant-route";
import { getProfileData } from "@/services/server/profile";
import { getOrganizationName } from "@/services/server/organization";

export async function GET() {
  try {
    const tenant = await requireTenantApi();
    if (!tenant.ok) return tenant.response;

    const orgName = await getOrganizationName(tenant.ctx.organizationId);
    const data = await getProfileData(
      tenant.ctx,
      {
        name: tenant.session.user.name ?? null,
        email: tenant.session.user.email ?? "",
        role: tenant.session.user.role ?? "EMPLOYEE",
      },
      orgName
    );

    return NextResponse.json(data);
  } catch (error) {
    return serviceErrorResponse(error);
  }
}
