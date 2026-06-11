import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AccessDenied } from "@/components/shared/access-denied";
import { getReportsOverview } from "@/lib/analytics/reports";
import { canViewReports } from "@/lib/auth/roles";
import { ReportsView } from "./reports-view";

export default async function ReportsPage() {
  const session = await auth();
  const organizationId = session?.user?.organizationId;
  const role = session?.user?.role;

  if (!organizationId) redirect("/login");

  if (!canViewReports(role)) {
    return (
      <AccessDenied
        title="Reportes"
        description="Los reportes están disponibles para administradores y supervisores de tu organización."
      />
    );
  }

  const data = await getReportsOverview(organizationId, role);
  if (!data) {
    return (
      <AccessDenied
        title="Reportes"
        description="No se pudieron cargar los reportes. Verifica tu rol e intenta de nuevo."
      />
    );
  }

  return <ReportsView data={data} />;
}
