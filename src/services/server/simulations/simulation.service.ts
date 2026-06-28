import { db } from "@/lib/db";

export type SimulationData = {
  id: string;
  title: string;
  scenario: string;
  options: { id: string; label: string; text: string; score: number }[];
  aiAnalysis: string;
  moduleTitle: string | null;
  moduleSlug: string | null;
  current: number;
  total: number;
};

export async function getSimulationForPage(
  organizationId: string,
  index: number
): Promise<{ simulation: SimulationData | null; total: number }> {
  const safeIndex = Math.max(0, index);
  const where = { organizationId, type: "CASE_STUDY" as const };

  const [total, simulations] = await Promise.all([
    db.activity.count({ where }),
    db.activity.findMany({
      where,
      include: {
        module: { select: { title: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: safeIndex,
      take: 1,
    }),
  ]);

  const activity = simulations[0];
  if (!activity) {
    return { simulation: null, total };
  }

  const content = activity.content as {
    scenario?: string;
    options?: {
      id: string;
      label: string;
      text: string;
      score: number;
    }[];
    aiAnalysis?: string;
  };

  return {
    simulation: {
      id: activity.id,
      title: activity.title,
      scenario: content.scenario ?? "",
      options: content.options ?? [],
      aiAnalysis: content.aiAnalysis ?? "",
      moduleTitle: activity.module?.title ?? null,
      moduleSlug: activity.module?.slug ?? null,
      current: safeIndex + 1,
      total,
    },
    total,
  };
}
