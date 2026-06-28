import { redirect } from "next/navigation";
import { getCachedTenant } from "@/lib/auth/cached-session";
import { cachedTeamMembers } from "@/lib/cache/page-data";
import { AccessDenied } from "@/components/shared/access-denied";
import { isAdmin, isSupervisor } from "@/lib/auth/roles";
import { TeamContent } from "@/components/team";

export default async function TeamPage() {
  const tenant = await getCachedTenant();
  if (!tenant) redirect("/login");

  if (!isAdmin(tenant.role) && !isSupervisor(tenant.role)) {
    return (
      <AccessDenied
        title="Equipo"
        description="Esta vista está disponible para administradores y supervisores."
      />
    );
  }

  const users = await cachedTeamMembers(tenant.organizationId);

  return <TeamContent initialUsers={users} />;
}
