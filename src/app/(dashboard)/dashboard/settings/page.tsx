import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getOrganizationSettings } from "@/lib/organization/settings";
import { isAdmin } from "@/lib/auth/roles";
import { SettingsContent } from "./settings-content";

export default async function SettingsPage() {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) redirect("/login");

  const org = await getOrganizationSettings(organizationId);
  if (!org) redirect("/dashboard");

  return (
    <SettingsContent initialOrg={org} isAdmin={isAdmin(session.user.role)} />
  );
}
