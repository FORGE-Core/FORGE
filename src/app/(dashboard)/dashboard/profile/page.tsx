import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getProfileData } from "@/services/server/profile";
import { getOrganizationName } from "@/services/server/organization";
import { ProfileView } from "./profile-view";

export default async function ProfilePage() {
  const session = await auth();
  const organizationId = session?.user?.organizationId;
  const userId = session?.user?.id;
  const role = session?.user?.role;

  if (!organizationId || !userId || !role) redirect("/login");

  const orgName = await getOrganizationName(organizationId);
  const profile = await getProfileData(
    { organizationId, userId, role },
    {
      name: session.user.name ?? null,
      email: session.user.email ?? "",
      role: session.user.role ?? "EMPLOYEE",
    },
    orgName
  );

  return <ProfileView profile={profile} />;
}
