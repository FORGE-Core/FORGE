import { getInclusionReport } from "@/lib/alae/inclusion-scorer";
import { db } from "@/lib/db";
import type { EnrichedInclusionReport } from "@/types/reports";

export async function getEnrichedInclusionReport(
  organizationId: string
): Promise<EnrichedInclusionReport> {
  const report = await getInclusionReport(organizationId);

  const [documents, modules] = await Promise.all([
    db.document.findMany({
      where: { organizationId },
      select: { id: true, title: true },
      take: 50,
    }),
    db.trainingModule.findMany({
      where: { organizationId },
      select: { id: true, title: true },
      take: 50,
    }),
  ]);

  const titleMap = new Map([
    ...documents.map((d) => [d.id, d.title] as const),
    ...modules.map((m) => [m.id, m.title] as const),
  ]);

  return {
    ...report,
    lowest: report.lowest.map((item) => ({
      ...item,
      title: titleMap.get(item.targetId) ?? item.targetId,
    })),
    complexModules: report.complexModules.map((item) => ({
      ...item,
      title: titleMap.get(item.targetId) ?? item.targetId,
    })),
  };
}
