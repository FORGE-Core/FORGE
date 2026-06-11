import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AccessDenied } from "@/components/shared/access-denied";
import { getInclusionReport } from "@/lib/alae/inclusion-scorer";
import { canViewReports } from "@/lib/auth/roles";
import { db } from "@/lib/db";
import { InclusionReportView } from "./inclusion-report-view";

export default async function InclusionReportPage() {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) redirect("/login");

  if (!canViewReports(session.user.role)) {
    return (
      <AccessDenied
        title="Dashboard de inclusión"
        description="Esta vista está disponible para administradores y supervisores."
        backHref="/dashboard/reports"
        backLabel="Volver a reportes"
      />
    );
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

  const enriched = {
    ...report,
    lowest: report.lowest.map((item) => ({
      ...item,
      title: titleMap.get(item.targetId) ?? item.targetId,
    })),
    complexModules: report.complexModules.map((item) => ({
      ...item,
      title: titleMap.get(item.targetId) ?? item.targetId,
    })),
  };

  return <InclusionReportView report={enriched} />;
}
