import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { listOrganizationDocuments } from "@/lib/documents/list";
import { DocumentsContent } from "./documents-content";

export default async function DocumentsPage() {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) redirect("/login");

  const { documents, canManage } = await listOrganizationDocuments(
    organizationId,
    session.user.role
  );

  return (
    <DocumentsContent
      initialDocuments={documents}
      initialCanManage={canManage}
    />
  );
}
