import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getOrganizationSettings } from "@/lib/organization/settings";
import { SettingsContent } from "@/components/settings";

export default async function SettingsPage() {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) redirect("/login");

  const org = await getOrganizationSettings(organizationId);
  if (!org) redirect("/home");

  return <SettingsContent initialOrg={org} />;
}
