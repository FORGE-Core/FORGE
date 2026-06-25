"use client";

import dynamic from "next/dynamic";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { LearningModality, LearningPace } from "@prisma/client";
import {
  readCachedProfile,
  writeCachedProfile,
} from "@/lib/alae/profile-cache";
import type { AccessibilityProfileData } from "@/lib/alae/types";
import { speakText, stopSpeaking } from "@/lib/alae/speech";
import { accessibilityClient } from "@/services/client";

const PreferenceWizard = dynamic(
  () =>
    import("./preference-wizard").then((mod) => ({
      default: mod.PreferenceWizard,
    })),
  { ssr: false }
);

type AccessibilityContextValue = AccessibilityProfileData & {
  loading: boolean;
  isSpeaking: boolean;
  updatePreferences: (
    patch: Partial<AccessibilityProfileData>
  ) => Promise<void>;
  refresh: () => Promise<void>;
  speakAloud: (text: string) => void;
  stopSpeaking: () => void;
};

const AccessibilityContext = createContext<AccessibilityContextValue | null>(
  null
);

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
};

function applyDomEffects(profile: AccessibilityProfileData) {
  const root = document.documentElement;
  root.style.setProperty("--alae-font-scale", String(profile.fontScale));
  root.dataset.alaeHighContrast = profile.highContrast ? "true" : "false";
  root.dataset.alaeDark = profile.darkMode ? "true" : "false";
  root.dataset.alaeReduceMotion = profile.reduceMotion ? "true" : "false";
  root.dataset.alaeSimplified = profile.simplifiedLanguage ? "true" : "false";
  root.dataset.alaeStepByStep = profile.stepByStepMode ? "true" : "false";
  root.classList.toggle("dark", profile.darkMode);
}

export function AccessibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [profile, setProfile] = useState<AccessibilityProfileData>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const cached = readCachedProfile();
    if (cached) {
      setProfile(cached);
      applyDomEffects(cached);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const data = await accessibilityClient.getProfile();
      if (data.profile) {
        const profile = data.profile as AccessibilityProfileData;
        setProfile(profile);
        applyDomEffects(profile);
        writeCachedProfile(profile);
        if (!profile.wizardCompleted) setShowWizard(true);
      }
    } catch {
      applyDomEffects(readCachedProfile() ?? DEFAULTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const updatePreferences = useCallback(
    async (patch: Partial<AccessibilityProfileData>) => {
      const next = { ...profile, ...patch };
      setProfile(next);
      applyDomEffects(next);
      writeCachedProfile(next);

      const data = await accessibilityClient.updateProfile(patch);
      if (data.profile) {
        const updated = data.profile as AccessibilityProfileData;
        setProfile(updated);
        applyDomEffects(updated);
        writeCachedProfile(updated);
      }
    },
    [profile]
  );

  const speakAloud = useCallback(
    (text: string) => {
      if (!profile.autoReadAloud) return;
      speakText(text, "es-MX", {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
      });
    },
    [profile.autoReadAloud]
  );

  const handleStopSpeaking = useCallback(() => {
    stopSpeaking({ onEnd: () => setIsSpeaking(false) });
  }, []);

  const value = useMemo(
    () => ({
      ...profile,
      loading,
      isSpeaking,
      updatePreferences,
      refresh,
      speakAloud,
      stopSpeaking: handleStopSpeaking,
    }),
    [
      profile,
      loading,
      isSpeaking,
      updatePreferences,
      refresh,
      speakAloud,
      handleStopSpeaking,
    ]
  );

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      {showWizard && (
        <PreferenceWizard
          onComplete={() => {
            setShowWizard(false);
            void refresh();
          }}
        />
      )}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) {
    throw new Error("useAccessibility debe usarse dentro de AccessibilityProvider");
  }
  return ctx;
}

export type { LearningModality, LearningPace };
