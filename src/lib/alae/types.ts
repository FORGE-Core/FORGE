import type {
  LearningModality,
  LearningPace,
  SupportLevel,
} from "@prisma/client";

export type AccessibilityProfileData = {
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
};

export type LearningProfileData = {
  modalityScores: Record<string, number>;
  supportLevel: SupportLevel;
  preferredModality: LearningModality;
  readingCount: number;
  listeningCount: number;
  visualCount: number;
  practiceCount: number;
};

export type DeclaredNeeds = {
  summaries?: boolean;
  examples?: boolean;
  simulations?: boolean;
};

export type AlaeContext = {
  accessibility: AccessibilityProfileData;
  learning: LearningProfileData;
  declaredNeeds: DeclaredNeeds;
};

export type InclusionAuditResult = {
  overallScore: number;
  dimensions: {
    language: number;
    structure: number;
    examples: number;
    clarity: number;
  };
  issues: { code: string; severity: string; message: string }[];
  recommendations: string[];
};

export type AdaptRequest =
  | { type: "SIMPLIFY"; content: string; title?: string }
  | { type: "STEP_BY_STEP"; content: string; title?: string };

export type AdaptResult = {
  type: string;
  content: string;
  steps?: { order: number; title: string; body: string }[];
};
