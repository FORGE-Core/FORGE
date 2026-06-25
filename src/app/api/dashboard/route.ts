import { NextResponse } from "next/server";
import { serviceErrorResponse } from "@/lib/api/service-response";
import { requireTenantApi } from "@/lib/api/tenant-route";
import { getDashboardData } from "@/services/server/dashboard";
import { getOrganizationName } from "@/services/server/organization";

export async function GET() {
  try {
    const tenant = await requireTenantApi();
    if (!tenant.ok) return tenant.response;

    const orgName = await getOrganizationName(tenant.ctx.organizationId);
    const data = await getDashboardData(
      tenant.ctx,
      tenant.session.user.name,
      orgName
    );

    return NextResponse.json(data);
  } catch (error) {
    return serviceErrorResponse(error);
  }
}
