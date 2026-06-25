import { NextResponse } from "next/server";
import { canViewReports } from "@/lib/auth/roles";
import { serviceErrorResponse } from "@/lib/api/service-response";
import { buildOrganizationContext, requireTenantApi } from "@/lib/api/tenant-route";
import { getReportsOverview } from "@/services/server/reports";

export async function GET() {
  try {
    const tenant = await requireTenantApi();
    if (!tenant.ok) return tenant.response;

    const orgCtx = buildOrganizationContext(tenant.session);
    if (!canViewReports(orgCtx.role)) {
      return NextResponse.json(
        { error: "No tienes permiso para ver reportes" },
        { status: 403 }
      );
    }

    const data = await getReportsOverview(orgCtx);
    return NextResponse.json(data);
  } catch (error) {
    return serviceErrorResponse(error);
  }
}
