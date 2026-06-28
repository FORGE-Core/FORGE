import { redirect } from "next/navigation";
import { getCachedTenant } from "@/lib/auth/cached-session";
import { cachedOrganizationSettings } from "@/lib/cache/page-data";
import { SettingsContent } from "@/components/settings";

export default async function SettingsPage() {
  const tenant = await getCachedTenant();
  if (!tenant) redirect("/login");

  const org = await cachedOrganizationSettings(tenant.organizationId);
  if (!org) redirect("/home");

  return <SettingsContent initialOrg={org} />;
}
