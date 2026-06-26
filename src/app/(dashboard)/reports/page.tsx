import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AccessDenied } from "@/components/shared/access-denied";
import { getLearningPatternReport } from "@/lib/alae/learning-analytics";
import { canViewReports } from "@/lib/auth/roles";
import { getReportsOverview } from "@/services/server/reports";
import { getEnrichedInclusionReport } from "@/services/server/reports/inclusion-report.service";
import { ReportsHub } from "@/components/reports";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
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

  const { tab: tabParam } = await searchParams;
  const initialTab =
    tabParam === "inclusion" || tabParam === "patterns" ? tabParam : "overview";

  try {
    const [overview, inclusion, patterns] = await Promise.all([
      getReportsOverview({ organizationId, role }),
      getEnrichedInclusionReport(organizationId),
      getLearningPatternReport(organizationId),
    ]);

    return (
      <div className="space-y-6 pb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold">Reportes</h1>
          <p className="mt-1 text-brand-muted-gray">
            Métricas, inclusión y patrones de aprendizaje
          </p>
        </div>
        <Suspense fallback={null}>
          <ReportsHub
            overview={overview}
            inclusion={inclusion}
            patterns={patterns}
            initialTab={initialTab}
          />
        </Suspense>
      </div>
    );
  } catch {
    return (
      <AccessDenied
        title="Reportes"
        description="No se pudieron cargar los reportes. Verifica tu rol e intenta de nuevo."
      />
    );
  }
}
