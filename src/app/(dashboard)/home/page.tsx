import { redirect } from "next/navigation";
import { getCachedTenant } from "@/lib/auth/cached-session";
import { getDashboardData } from "@/services/server/dashboard";
import { HomeChrome } from "@/components/layout/home-chrome";
import { DashboardView } from "@/components/dashboard";
import { getTenantDb } from "@/lib/db/tenant-client";

export default async function DashboardPage() {
  const tenant = await getCachedTenant();
  if (!tenant) redirect("/login");

  const data = await getDashboardData(
    {
      organizationId: tenant.organizationId,
      userId: tenant.userId,
      role: tenant.role,
      db: getTenantDb(tenant.organizationId),
    },
    tenant.userName,
    tenant.name
  );

  return (
    <>
      <DashboardView data={data} />
      <HomeChrome />
    </>
  );
}
