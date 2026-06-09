import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import {
  parseErrorDetectionContent,
  parseOrderStepsContent,
  parseQuizContent,
  type QuizContent,
} from "./types";

export type { QuizContent };

export async function ensureModuleQuiz(
  organizationId: string,
  moduleId: string,
  moduleTitle: string
) {
  const existing = await db.activity.findFirst({
    where: { moduleId, type: "MULTIPLE_CHOICE" },
  });
  if (existing) return existing;

  const content: QuizContent = {
    question: `Según el módulo "${moduleTitle}", ¿cuál es la práctica correcta en operaciones?`,
    options: [
      {
        id: "a",
        text: "Seguir el procedimiento oficial de la empresa",
        correct: true,
      },
      {
        id: "b",
        text: "Improvisar para terminar más rápido",
        correct: false,
      },
      {
        id: "c",
        text: "Omitir pasos si no hay supervisor",
        correct: false,
      },
    ],
    explanation:
      "La capacitación operativa exige seguir los procedimientos documentados de tu empresa.",
  };

  return db.activity.create({
    data: {
      organizationId,
      moduleId,
      type: "MULTIPLE_CHOICE",
      title: `Quiz: ${moduleTitle}`,
      content: content as unknown as Prisma.InputJsonValue,
      difficulty: 1,
      points: 10,
    },
  });
}

export async function ensureSimulationActivity(
  organizationId: string,
  moduleId: string | null,
  title: string
) {
  const existing = await db.activity.findFirst({
    where: {
      organizationId,
      type: "CASE_STUDY",
      title,
    },
  });
  if (existing) return existing;

  return db.activity.create({
    data: {
      organizationId,
      moduleId: moduleId ?? (await firstModuleId(organizationId)),
      type: "CASE_STUDY",
      title,
      content: {
        scenario:
          "Un cliente reporta que su paquete no llegó. El tracking muestra «entregado» pero el cliente insiste que no lo recibió.",
        options: [
          {
            id: "a",
            label: "A",
            text: "Escalar inmediatamente sin verificar",
            score: 20,
          },
          {
            id: "b",
            label: "B",
            text: "Verificar estado del envío y evidencia de entrega",
            score: 100,
          },
          {
            id: "c",
            label: "C",
            text: "Crear un nuevo pedido sin investigar",
            score: 10,
          },
          {
            id: "d",
            label: "D",
            text: "Cerrar el caso sin documentar",
            score: 0,
          },
        ],
        aiAnalysis:
          "La opción correcta prioriza verificación antes de acciones irreversibles.",
      } as unknown as Prisma.InputJsonValue,
      difficulty: 2,
      points: 20,
    },
  });
}

async function firstModuleId(organizationId: string) {
  const mod = await db.trainingModule.findFirst({
    where: { organizationId, status: "PUBLISHED" },
    select: { id: true },
  });
  if (!mod) throw new Error("No hay módulos publicados");
  return mod.id;
}

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
