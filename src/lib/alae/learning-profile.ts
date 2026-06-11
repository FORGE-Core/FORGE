import type { LearningModality, Prisma, SupportLevel } from "@prisma/client";
import { db } from "@/lib/db";
import type { LearningProfileData } from "./types";

export function inferPreferredModality(
  profile: Pick<
    Prisma.LearningProfileGetPayload<object>,
    "readingCount" | "listeningCount" | "visualCount" | "practiceCount"
  >
): LearningModality {
  const scores = {
    READING: profile.readingCount,
    LISTENING: profile.listeningCount,
    VISUAL: profile.visualCount,
    PRACTICE: profile.practiceCount,
  };
  const max = Math.max(...Object.values(scores));
  if (max === 0) return "MIXED";
  const entry = Object.entries(scores).find(([, v]) => v === max);
  return (entry?.[0] as LearningModality) ?? "MIXED";
}

export function serializeLearningProfile(
  row: Prisma.LearningProfileGetPayload<object> | null
): LearningProfileData {
  if (!row) {
    return {
      modalityScores: {},
      supportLevel: "STANDARD",
      preferredModality: "MIXED",
      readingCount: 0,
      listeningCount: 0,
      visualCount: 0,
      practiceCount: 0,
    };
  }
  const modalityScores =
    typeof row.modalityScores === "object" && row.modalityScores
      ? (row.modalityScores as Record<string, number>)
      : {};
  return {
    modalityScores,
    supportLevel: row.supportLevel,
    preferredModality: inferPreferredModality(row),
    readingCount: row.readingCount,
    listeningCount: row.listeningCount,
    visualCount: row.visualCount,
    practiceCount: row.practiceCount,
  };
}

export async function getOrCreateLearningProfile(
  userId: string,
  organizationId: string
) {
  let profile = await db.learningProfile.findUnique({ where: { userId } });
  if (!profile) {
    profile = await db.learningProfile.create({
      data: { userId, organizationId },
    });
  }
  return profile;
}

export async function applyWizardToProfiles(
  userId: string,
  organizationId: string,
  wizard: {
    preferredModality: LearningModality;
    stepByStep: boolean;
    simplified: boolean;
    summaries: boolean;
    examples: boolean;
    simulations: boolean;
  }
) {
  await getOrCreateLearningProfile(userId, organizationId);

  const modalityField = {
    READING: "readingCount",
    LISTENING: "listeningCount",
    VISUAL: "visualCount",
    PRACTICE: "practiceCount",
    MIXED: null,
  } as const;

  const field = modalityField[wizard.preferredModality];
  const learningUpdate: Prisma.LearningProfileUpdateInput = {
    supportLevel: wizard.simplified ? "SIMPLIFIED" : "GUIDED",
  };
  if (field) {
    learningUpdate[field] = { increment: 3 };
  }

  await db.learningProfile.update({
    where: { userId },
    data: learningUpdate,
  });

  const preferredModality =
    wizard.simulations && wizard.preferredModality === "MIXED"
      ? "PRACTICE"
      : wizard.preferredModality;

  await db.accessibilityProfile.upsert({
    where: { userId },
    create: {
      userId,
      organizationId,
      preferredModality,
      stepByStepMode: wizard.stepByStep || wizard.summaries,
      simplifiedLanguage: wizard.simplified || wizard.summaries,
      wizardCompleted: true,
      declaredNeeds: {
        summaries: wizard.summaries,
        examples: wizard.examples,
        simulations: wizard.simulations,
      },
    },
    update: {
      preferredModality,
      stepByStepMode: wizard.stepByStep || wizard.summaries,
      simplifiedLanguage: wizard.simplified || wizard.summaries,
      wizardCompleted: true,
      declaredNeeds: {
        summaries: wizard.summaries,
        examples: wizard.examples,
        simulations: wizard.simulations,
      },
    },
  });
}

export async function recordModalityUse(
  userId: string,
  organizationId: string,
  modality: LearningModality
) {
  await getOrCreateLearningProfile(userId, organizationId);
  const fieldMap: Record<LearningModality, string | null> = {
    READING: "readingCount",
    LISTENING: "listeningCount",
    VISUAL: "visualCount",
    PRACTICE: "practiceCount",
    MIXED: null,
  };
  const field = fieldMap[modality];
  if (!field) return;

  await db.learningProfile.update({
    where: { userId },
    data: { [field]: { increment: 1 }, lastAdaptedAt: new Date() },
  });
}

export async function updateSupportFromSignals(
  userId: string,
  organizationId: string,
  signals: { failedAttempts?: number; chatQuestions?: number }
) {
  const profile = await getOrCreateLearningProfile(userId, organizationId);
  let supportLevel: SupportLevel = profile.supportLevel;

  if ((signals.failedAttempts ?? 0) >= 3) {
    supportLevel = "INTENSIVE";
  } else if ((signals.failedAttempts ?? 0) >= 1) {
    supportLevel = "SIMPLIFIED";
  } else if ((signals.chatQuestions ?? 0) >= 10) {
    supportLevel = "GUIDED";
  } else if (
    profile.supportLevel !== "STANDARD" &&
    (signals.failedAttempts ?? 0) === 0
  ) {
    supportLevel = "STANDARD";
  }

  if (supportLevel !== profile.supportLevel) {
    await db.learningProfile.update({
      where: { userId },
      data: { supportLevel, lastAdaptedAt: new Date() },
    });
  }
}

export async function syncSupportLevelFromActivity(
  userId: string,
  organizationId: string
) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [failedAttempts, chatQuestions] = await Promise.all([
    db.activityAttempt.count({
      where: { userId, passed: false, createdAt: { gte: thirtyDaysAgo } },
    }),
    db.learningEvent.count({
      where: {
        userId,
        organizationId,
        eventType: "CHAT_QUESTION",
        createdAt: { gte: thirtyDaysAgo },
      },
    }),
  ]);

  await updateSupportFromSignals(userId, organizationId, {
    failedAttempts,
    chatQuestions,
  });
}
