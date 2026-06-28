import { redirect } from "next/navigation";
import { getCachedTenant } from "@/lib/auth/cached-session";
import { cachedOrganizationModules } from "@/lib/cache/page-data";
import { ModulesContent } from "@/components/modules";

export default async function ModulesPage() {
  const tenant = await getCachedTenant();
  if (!tenant) redirect("/login");

  const modules = await cachedOrganizationModules(
    tenant.organizationId,
    tenant.userId,
    tenant.role
  );

  return <ModulesContent initialModules={modules} />;
}
