import { auth } from "@/auth";
import { getInclusionReport } from "@/lib/alae/inclusion-scorer";
import { canViewReports } from "@/lib/auth/roles";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  const organizationId = session?.user?.organizationId;
  const role = session?.user?.role;

  if (!organizationId || !canViewReports(role)) {
    return Response.json({ error: "No autorizado" }, { status: 403 });
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
