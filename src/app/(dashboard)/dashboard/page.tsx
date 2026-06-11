import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDashboardData } from "@/lib/analytics/dashboard";
import { db } from "@/lib/db";
import { DashboardView } from "./dashboard-view";

export default async function DashboardPage() {
  const session = await auth();
  const organizationId = session?.user?.organizationId;
  const userId = session?.user?.id;

  if (!organizationId || !userId) redirect("/login");

  const org = await db.organization.findUnique({
    where: { id: organizationId },
    select: { name: true },
  });

  const data = await getDashboardData(
    organizationId,
    userId,
    session.user.name,
    org?.name ?? "Tu empresa"
  );

  return <DashboardView data={data} />;
}
