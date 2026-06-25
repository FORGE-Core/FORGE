import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDashboardData } from "@/services/server/dashboard";
import { getOrganizationName } from "@/services/server/organization";
import { DashboardView } from "./dashboard-view";

export default async function DashboardPage() {
  const session = await auth();
  const organizationId = session?.user?.organizationId;
  const userId = session?.user?.id;
  const role = session?.user?.role;

  if (!organizationId || !userId || !role) redirect("/login");

  const orgName = await getOrganizationName(organizationId);
  const data = await getDashboardData(
    { organizationId, userId, role },
    session.user.name,
    orgName
  );

  return <DashboardView data={data} />;
}
