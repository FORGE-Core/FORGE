import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCachedTenant } from "@/lib/auth/cached-session";
import { cachedReportsData } from "@/lib/cache/page-data";
import { AccessDenied } from "@/components/shared/access-denied";
import { canViewReports } from "@/lib/auth/roles";
import { ReportsHub } from "@/components/reports";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const tenant = await getCachedTenant();
  if (!tenant) redirect("/login");

  if (!canViewReports(tenant.role)) {
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
    const { overview, inclusion, patterns } = await cachedReportsData(
      tenant.organizationId,
      tenant.role
    );

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
