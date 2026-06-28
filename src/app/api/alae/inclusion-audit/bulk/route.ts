import { canViewReports } from "@/lib/auth/roles";
import {
  auditContentInclusion,
  saveInclusionAudit,
} from "@/lib/alae/inclusion-scorer";
import { db } from "@/lib/db";
import { requireTenantApi, tenantAuthJsonError } from "@/lib/api/tenant-route";

export const maxDuration = 120;

export async function POST() {
  const tenant = await requireTenantApi();
  if (!tenant.ok) return tenant.response;

  const { organizationId, role } = tenant.ctx;
  if (!canViewReports(role)) {
    return tenantAuthJsonError({
      ok: false,
      status: 403,
      error: "No autorizado",
    });
  }

  const documents = await db.document.findMany({
    where: { organizationId, type: { in: ["PDF", "MANUAL"] } },
    select: { id: true, title: true },
  });

  const modules = await db.trainingModule.findMany({
    where: { organizationId },
    select: { id: true, title: true, description: true },
  });

  let audited = 0;
  const results: { targetType: string; targetId: string; score: number }[] =
    [];

  for (const doc of documents) {
    const chunks = await db.documentChunk.findMany({
      where: { documentId: doc.id },
      take: 8,
      orderBy: { chunkIndex: "asc" },
    });
    if (chunks.length === 0) continue;

    const text = chunks.map((c) => c.content).join("\n\n");
    const result = await auditContentInclusion(text, true);
    await saveInclusionAudit({
      organizationId,
      targetType: "DOCUMENT",
      targetId: doc.id,
      result,
    });
    audited++;
    results.push({
      targetType: "DOCUMENT",
      targetId: doc.id,
      score: result.overallScore,
    });
  }

  for (const mod of modules) {
    if (!mod.description) continue;
    const result = await auditContentInclusion(
      `${mod.title}\n\n${mod.description}`,
      true
    );
    await saveInclusionAudit({
      organizationId,
      targetType: "MODULE",
      targetId: mod.id,
      result,
    });
    audited++;
    results.push({
      targetType: "MODULE",
      targetId: mod.id,
      score: result.overallScore,
    });
  }

  return Response.json({ audited, results });
}
