import { getLearningPatternReport } from "@/lib/alae/learning-analytics";
import { canViewReports } from "@/lib/auth/roles";
import {
  requireTenantApi,
  tenantAuthJsonError,
} from "@/lib/api/tenant-route";

export async function GET() {
  const tenant = await requireTenantApi();
  if (!tenant.ok) return tenant.response;

  const { organizationId, role } = tenant.ctx;
  if (!canViewReports(role)) {
    return tenantAuthJsonError({
      ok: false,
      status: 403,
      error: "No autorizado",
    });
  }

  const report = await getLearningPatternReport(organizationId);
  return Response.json(report);
}
