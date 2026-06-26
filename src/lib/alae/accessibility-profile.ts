import type { LearningModality, LearningPace, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { parseDeclaredNeeds } from "./declared-needs";
import type { AccessibilityProfileData } from "./types";

const DEFAULTS: AccessibilityProfileData = {
  fontScale: 1,
  highContrast: false,
  darkMode: false,
  reduceMotion: false,
  preferredModality: "MIXED",
  simplifiedLanguage: false,
  stepByStepMode: false,
  autoReadAloud: false,
  captionsEnabled: true,
  learningPace: "NORMAL",
  wizardCompleted: false,
  voiceCommandsEnabled: false,
  voiceInputEnabled: false,
  assistedReadingMode: false,
};

export function serializeAccessibilityProfile(
  row: Prisma.AccessibilityProfileGetPayload<object> | null
): AccessibilityProfileData {
  if (!row) return { ...DEFAULTS };
  return {
    fontScale: row.fontScale,
    highContrast: row.highContrast,
    darkMode: row.darkMode,
    reduceMotion: row.reduceMotion,
    preferredModality: row.preferredModality,
    simplifiedLanguage: row.simplifiedLanguage,
    stepByStepMode: row.stepByStepMode,
    autoReadAloud: row.autoReadAloud,
    captionsEnabled: row.captionsEnabled,
    learningPace: row.learningPace,
    wizardCompleted: row.wizardCompleted,
    voiceCommandsEnabled: row.voiceCommandsEnabled,
    voiceInputEnabled: row.voiceInputEnabled,
    assistedReadingMode: row.assistedReadingMode,
  };
}

export async function getOrCreateAccessibilityProfile(
  userId: string,
  organizationId: string
) {
  let profile = await db.accessibilityProfile.findUnique({ where: { userId } });
  if (!profile) {
    profile = await db.accessibilityProfile.create({
      data: { userId, organizationId },
    });
  }
  return profile;
}

export async function updateAccessibilityProfile(
  userId: string,
  organizationId: string,
  data: Partial<{
    fontScale: number;
    highContrast: boolean;
    darkMode: boolean;
    reduceMotion: boolean;
    preferredModality: LearningModality;
    simplifiedLanguage: boolean;
    stepByStepMode: boolean;
    autoReadAloud: boolean;
    captionsEnabled: boolean;
    learningPace: LearningPace;
    wizardCompleted: boolean;
    voiceCommandsEnabled: boolean;
    voiceInputEnabled: boolean;
    assistedReadingMode: boolean;
    declaredNeeds: object;
  }>
) {
  await getOrCreateAccessibilityProfile(userId, organizationId);
  return db.accessibilityProfile.update({
    where: { userId },
    data: {
      ...data,
      fontScale:
        data.fontScale !== undefined
          ? Math.min(2, Math.max(0.875, data.fontScale))
          : undefined,
    },
  });
}

export async function getAlaeContextForUser(
  userId: string,
  organizationId: string
) {
  const [accessibility, learning] = await Promise.all([
    getOrCreateAccessibilityProfile(userId, organizationId),
    db.learningProfile.findUnique({ where: { userId } }),
  ]);

  const { serializeLearningProfile, inferPreferredModality } = await import(
    "./learning-profile"
  );

  const learningData = learning
    ? serializeLearningProfile(learning)
    : {
        modalityScores: {},
        supportLevel: "STANDARD" as const,
        preferredModality: accessibility.preferredModality,
        readingCount: 0,
        listeningCount: 0,
        visualCount: 0,
        practiceCount: 0,
      };

  if (learning) {
    learningData.preferredModality = inferPreferredModality(learning);
  }

  return {
    accessibility: serializeAccessibilityProfile(accessibility),
    learning: learningData,
    declaredNeeds: parseDeclaredNeeds(accessibility.declaredNeeds),
  };
}
