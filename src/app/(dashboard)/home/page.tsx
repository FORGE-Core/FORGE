import { redirect } from "next/navigation";
import { getCachedTenant } from "@/lib/auth/cached-session";
import { cachedDashboardData } from "@/lib/cache/page-data";
import { HomeChrome } from "@/components/layout/home-chrome";
import { DashboardView } from "@/components/dashboard";

export default async function DashboardPage() {
  const tenant = await getCachedTenant();
  if (!tenant) redirect("/login");

  const data = await cachedDashboardData(
    tenant.organizationId,
    tenant.userId,
    tenant.role,
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
