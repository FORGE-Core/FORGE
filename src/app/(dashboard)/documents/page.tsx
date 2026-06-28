import { redirect } from "next/navigation";
import { getCachedTenant } from "@/lib/auth/cached-session";
import { cachedDocuments } from "@/lib/cache/page-data";
import { DocumentsContent } from "@/components/documents";

export default async function DocumentsPage() {
  const tenant = await getCachedTenant();
  if (!tenant) redirect("/login");

  const { documents } = await cachedDocuments(
    tenant.organizationId,
    tenant.role
  );

  return <DocumentsContent initialDocuments={documents} />;
}
