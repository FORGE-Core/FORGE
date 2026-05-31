import { db } from "@/lib/db";

export async function getOrganizationDocument(
  documentId: string,
  organizationId: string
) {
  return db.document.findFirst({
    where: { id: documentId, organizationId },
  });
}
