import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AccessDenied } from "@/components/shared/access-denied";
import { isAdmin, isSupervisor } from "@/lib/auth/roles";
import { getTeamMembers } from "@/lib/team/members";
import { TeamContent } from "./team-content";

export default async function TeamPage() {
  const session = await auth();
  const organizationId = session?.user?.organizationId;
  const role = session?.user?.role;

  if (!organizationId) redirect("/login");

  if (!isAdmin(role) && !isSupervisor(role)) {
    return (
      <AccessDenied
        title="Equipo"
        description="Esta vista está disponible para administradores y supervisores."
      />
    );
  }

  const users = await getTeamMembers(organizationId);

  return <TeamContent initialUsers={users} />;
}
