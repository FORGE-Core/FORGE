import { db } from "@/lib/db";
import {
  parseErrorDetectionContent,
  parseOrderStepsContent,
  parseQuizContent,
  type QuizContent,
} from "./types";

export type { QuizContent };

export { parseQuizContent } from "./types";

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
  if (!activity) throw new Error("Actividad no encontrada");

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
    score = passed ? 100 : Math.max(0, 100 - Math.abs(order.length - correct.length) * 20);
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
