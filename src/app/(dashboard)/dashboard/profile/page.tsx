import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getProfileData } from "@/lib/analytics/profile";
import { db } from "@/lib/db";
import { ProfileView } from "./profile-view";

export default async function ProfilePage() {
  const session = await auth();
  const organizationId = session?.user?.organizationId;
  const userId = session?.user?.id;

  if (!organizationId || !userId) redirect("/login");

  const org = await db.organization.findUnique({
    where: { id: organizationId },
    select: { name: true },
  });

  const profile = await getProfileData(
    organizationId,
    userId,
    {
      name: session.user.name ?? null,
      email: session.user.email ?? "",
      role: session.user.role ?? "EMPLOYEE",
    },
    org?.name ?? "Tu organización"
  );

  return <ProfileView profile={profile} />;
}
