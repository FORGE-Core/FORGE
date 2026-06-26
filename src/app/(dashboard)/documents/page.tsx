import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { listDocuments } from "@/services/server/documents";
import { DocumentsContent } from "@/components/documents";

export default async function DocumentsPage() {
  const session = await auth();
  const organizationId = session?.user?.organizationId;
  const role = session?.user?.role;

  if (!organizationId) redirect("/login");

  const { documents } = await listDocuments({
    organizationId,
    role,
  });

  return <DocumentsContent initialDocuments={documents} />;
}
