import { notFound, redirect } from "next/navigation";
import { getCachedTenant } from "@/lib/auth/cached-session";
import { getModuleDetailForPage } from "@/services/server/training/module-detail.service";
import { ModuleDetailContent } from "@/components/modules";

export default async function ModuleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const tenant = await getCachedTenant();
  if (!tenant) redirect("/login");

  const { slug } = await params;
  const moduleData = await getModuleDetailForPage(
    tenant.organizationId,
    tenant.userId,
    tenant.role,
    slug
  );

  if (!moduleData) notFound();

  return <ModuleDetailContent slug={slug} module={moduleData} />;
}
