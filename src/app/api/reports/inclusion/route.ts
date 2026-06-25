import { getInclusionReport } from "@/lib/alae/inclusion-scorer";
import { canViewReports } from "@/lib/auth/roles";
import { db } from "@/lib/db";
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

  const report = await getInclusionReport(organizationId);

  const [documents, modules] = await Promise.all([
    db.document.findMany({
      where: { organizationId },
      select: { id: true, title: true },
      take: 50,
    }),
    db.trainingModule.findMany({
      where: { organizationId },
      select: { id: true, title: true },
      take: 50,
    }),
  ]);
  const titleMap = new Map([
    ...documents.map((d) => [d.id, d.title] as const),
    ...modules.map((m) => [m.id, m.title] as const),
  ]);

  const enrichedLowest = report.lowest.map((item) => ({
    ...item,
    title: titleMap.get(item.targetId) ?? item.targetId,
  }));

  const enrichedModules = report.complexModules.map((item) => ({
    ...item,
    title: titleMap.get(item.targetId) ?? item.targetId,
  }));

  return Response.json({
    ...report,
    lowest: enrichedLowest,
    complexModules: enrichedModules,
  });
}
