import { canManageDocuments, isAdmin, EMPLOYEE_VISIBLE_DOCUMENT_TYPES } from "@/lib/auth/roles";
import { getLatestInclusionScores } from "@/lib/alae/inclusion-scorer";
import { db } from "@/lib/db";
import type { UserRole } from "@prisma/client";

export type OrganizationDocumentItem = {
  id: string;
  title: string;
  type: string;
  status: string;
  fileSize: number | null;
  chunkCount: number;
  embeddingCount: number;
  contentGenerated: boolean;
  createdAt: string;
  fileUrl: string | null;
  hasFile: boolean;
  inclusionScore: number | null;
  inclusionIssues: string[];
  inclusionRecommendations: string[];
};

export async function listOrganizationDocuments(
  organizationId: string,
  role: UserRole | undefined
) {
  const admin = isAdmin(role);
  const canManage = canManageDocuments(role);

  const documents = await db.document.findMany({
    where: admin
      ? { organizationId }
      : {
          organizationId,
          type: { in: [...EMPLOYEE_VISIBLE_DOCUMENT_TYPES] },
          fileUrl: { not: null },
          status: "READY",
        },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { chunks: true } } },
  });

  const pdfIds = documents.filter((d) => d.type === "PDF").map((d) => d.id);
  const inclusionScores = await getLatestInclusionScores(
    organizationId,
    "DOCUMENT",
    pdfIds
  );

  const items: OrganizationDocumentItem[] = documents.map((doc) => ({
    id: doc.id,
    title: doc.title,
    type: doc.type,
    status: doc.status,
    fileSize: doc.fileSize,
    chunkCount: doc._count.chunks,
    embeddingCount:
      typeof doc.metadata === "object" &&
      doc.metadata &&
      "embeddingCount" in doc.metadata
        ? Number((doc.metadata as { embeddingCount?: number }).embeddingCount)
        : 0,
    contentGenerated: !!(
      typeof doc.metadata === "object" &&
      doc.metadata &&
      "learningContentGeneratedAt" in doc.metadata
    ),
    createdAt: doc.createdAt.toISOString(),
    fileUrl: doc.fileUrl,
    hasFile: !!doc.fileUrl,
    inclusionScore: inclusionScores.get(doc.id)?.score ?? null,
    inclusionIssues: inclusionScores.get(doc.id)?.issues ?? [],
    inclusionRecommendations:
      inclusionScores.get(doc.id)?.recommendations ?? [],
  }));

  return { canManage, canUpload: canManage, documents: items };
}
