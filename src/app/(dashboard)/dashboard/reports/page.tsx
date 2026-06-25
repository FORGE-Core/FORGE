import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AccessDenied } from "@/components/shared/access-denied";
import { canViewReports } from "@/lib/auth/roles";
import { getReportsOverview } from "@/services/server/reports";
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

  try {
    const data = await getReportsOverview({ organizationId, role });
    return <ReportsView data={data} />;
  } catch {
    return (
      <AccessDenied
        title="Reportes"
        description="No se pudieron cargar los reportes. Verifica tu rol e intenta de nuevo."
      />
    );
  }
}
