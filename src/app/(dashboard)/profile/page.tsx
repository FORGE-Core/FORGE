import { redirect } from "next/navigation";
import { getCachedTenant } from "@/lib/auth/cached-session";
import { cachedProfileData } from "@/lib/cache/page-data";
import { ProfileView } from "@/components/profile";

export default async function ProfilePage() {
  const tenant = await getCachedTenant();
  if (!tenant) redirect("/login");

  const profile = await cachedProfileData(
    tenant.organizationId,
    tenant.userId,
    tenant.role,
    tenant.userName,
    tenant.userEmail ?? "",
    tenant.name
  );

  return <ProfileView profile={profile} />;
}
