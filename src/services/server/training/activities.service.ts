import { db } from "@/lib/db";
import {
  parseErrorDetectionContent,
  parseOrderStepsContent,
  parseQuizContent,
} from "@/lib/activities/types";
import { ServiceError } from "@/services/server/errors";
import type { ServiceContext } from "@/services/server/types";

const ACTIVITY_TYPES = [
  "MULTIPLE_CHOICE",
  "TRUE_FALSE",
  "ORDER_STEPS",
  "ERROR_DETECTION",
  "CASE_STUDY",
] as const;

function serializeActivity(
  activity: {
    id: string;
    title: string;
    type: string;
    content: unknown;
    module: { title: string; slug: string | null };
  },
  index: number,
  total: number
) {
  const base = {
    id: activity.id,
    title: activity.title,
    type: activity.type,
    moduleTitle: activity.module.title,
    moduleSlug: activity.module.slug,
    current: index + 1,
    total,
  };

  if (activity.type === "ORDER_STEPS") {
    const content = parseOrderStepsContent(activity.content);
    return {
      ...base,
      question: content?.question,
      steps: content?.steps,
      explanation: content?.explanation,
    };
  }

  if (activity.type === "ERROR_DETECTION") {
    const content = parseErrorDetectionContent(activity.content);
    return {
      ...base,
      question: content?.question,
      steps: content?.steps,
      explanation: content?.explanation,
    };
  }

  if (activity.type === "CASE_STUDY") {
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
      ...base,
      scenario: content.scenario ?? "",
      options: content.options?.map((o) => ({
        id: o.id,
        text: o.text,
        correct: o.score >= 70,
        label: o.label,
        score: o.score,
      })),
      explanation: content.aiAnalysis ?? "",
    };
  }

  const quiz = parseQuizContent(activity.content);
  return {
    ...base,
    question: quiz?.question,
    options: quiz?.options,
    explanation: quiz?.explanation,
  };
}

export async function getActivityAtIndex(
  ctx: ServiceContext,
  input: { moduleId?: string | null; index?: number }
) {
  const index = Math.max(0, input.index ?? 0);

  if (input.moduleId) {
    const mod = await db.trainingModule.findFirst({
      where: {
        id: input.moduleId,
        organizationId: ctx.organizationId,
        status: "PUBLISHED",
      },
    });
    if (!mod) {
      throw new ServiceError("NOT_FOUND", "Módulo no encontrado");
    }
  }

  const where = {
    organizationId: ctx.organizationId,
    ...(input.moduleId ? { moduleId: input.moduleId } : {}),
    type: { in: [...ACTIVITY_TYPES] },
  };

  const [total, activities] = await Promise.all([
    db.activity.count({ where }),
    db.activity.findMany({
      where,
      include: {
        module: { select: { title: true, slug: true } },
        attempts: {
          where: { userId: ctx.userId },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "asc" },
      skip: index,
      take: 1,
    }),
  ]);

  const activity = activities[0];
  if (!activity) {
    return { activity: null, total };
  }

  return {
    activity: {
      ...serializeActivity(activity, index, total),
      lastPassed: activity.attempts[0]?.passed ?? false,
    },
    total,
  };
}

export async function submitActivityAttempt({
  userId,
  organizationId,
  activityId,
  answers,
  timeSecs,
}: {
  userId: string;
  organizationId: string;
  activityId: string;
  answers: { selectedId?: string; order?: string[] };
  timeSecs?: number;
}) {
  const activity = await db.activity.findFirst({
    where: { id: activityId, organizationId },
    include: { module: true },
  });
  if (!activity) {
    throw new ServiceError("NOT_FOUND", "Actividad no encontrada");
  }

  let score = 0;
  let passed = false;

  if (activity.type === "MULTIPLE_CHOICE" || activity.type === "TRUE_FALSE") {
    const quiz = parseQuizContent(activity.content);
    const correct = quiz?.options.find((o) => o.correct);
    passed = correct?.id === answers.selectedId;
    score = passed ? 100 : 0;
  } else if (activity.type === "CASE_STUDY") {
    const content = activity.content as {
      options?: { id: string; score: number }[];
    };
    const opt = content.options?.find((o) => o.id === answers.selectedId);
    score = opt?.score ?? 0;
    passed = score >= 70;
  } else if (activity.type === "ORDER_STEPS") {
    const content = parseOrderStepsContent(activity.content);
    const order = answers.order ?? [];
    const correct = content?.correctOrder ?? [];
    passed =
      order.length === correct.length &&
      order.every((id, i) => id === correct[i]);
    score = passed
      ? 100
      : Math.max(0, 100 - Math.abs(order.length - correct.length) * 20);
  } else if (activity.type === "ERROR_DETECTION") {
    const content = parseErrorDetectionContent(activity.content);
    const errorStep = content?.steps.find((s) => s.hasError);
    passed = errorStep?.id === answers.selectedId;
    score = passed ? 100 : 0;
  }

  const attempt = await db.activityAttempt.create({
    data: {
      userId,
      activityId,
      score,
      passed,
      answers: answers as object,
      timeSecs,
    },
  });

  if (activity.moduleId) {
    const prev = await db.userProgress.findUnique({
      where: {
        userId_moduleId: { userId, moduleId: activity.moduleId },
      },
    });
    const nextPercent = passed
      ? Math.min(100, (prev?.percentComplete ?? 0) + 25)
      : (prev?.percentComplete ?? 0);

    await db.userProgress.upsert({
      where: {
        userId_moduleId: { userId, moduleId: activity.moduleId },
      },
      create: {
        userId,
        moduleId: activity.moduleId,
        percentComplete: nextPercent,
        score,
        completedAt: nextPercent >= 100 ? new Date() : null,
        lastAccessedAt: new Date(),
      },
      update: {
        percentComplete: nextPercent,
        score,
        completedAt: nextPercent >= 100 ? new Date() : undefined,
        lastAccessedAt: new Date(),
      },
    });
  }

  return { attempt, score, passed, activity };
}
