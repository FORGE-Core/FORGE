"use client";

import dynamic from "next/dynamic";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { LearningModality, LearningPace } from "@prisma/client";
import {
  readCachedProfile,
  writeCachedProfile,
} from "@/lib/alae/profile-cache";
import { applyAccessibilityDomEffects } from "@/lib/alae/dom-effects";
import { announce } from "@/lib/alae/announcer";
import type { AccessibilityProfileData } from "@/lib/alae/types";
import { speakNow, speakText, stopSpeaking, unlockSpeechFromGesture } from "@/lib/alae/speech";
import { accessibilityClient } from "@/services/client";

const PreferenceWizard = dynamic(
  () =>
    import("./preference-wizard").then((mod) => ({
      default: mod.PreferenceWizard,
    })),
  { ssr: false }
);

type PrefsValue = AccessibilityProfileData & { loading: boolean };

type AccessibilityActions = {
  updatePreferences: (
    patch: Partial<AccessibilityProfileData>
  ) => Promise<void>;
  refresh: () => Promise<void>;
  speakAloud: (text: string) => void;
  speakForUser: (text: string) => void;
  stopSpeaking: () => void;
};

const PrefsContext = createContext<PrefsValue | null>(null);
const TransientContext = createContext<{ isSpeaking: boolean } | null>(null);
const ActionsContext = createContext<AccessibilityActions | null>(null);

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

function applyDomEffects(profile: AccessibilityProfileData) {
  applyAccessibilityDomEffects(profile);
}

function normalizeAssistedProfile(
  profile: AccessibilityProfileData
): AccessibilityProfileData {
  if (profile.assistedReadingMode) {
    return {
      ...profile,
      darkMode: true,
      highContrast: false,
      voiceInputEnabled: true,
      autoReadAloud: true,
    };
  }
  // Sin modo lectura asistida el fontScale vuelve al default para evitar que
  // configuraciones previas del botón de voz dejen el texto inflado.
  return { ...profile, fontScale: 1 };
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
  const profileRef = useRef(profile);
  profileRef.current = profile;

  useEffect(() => {
    const cached = readCachedProfile();
    if (cached) {
      const normalized = normalizeAssistedProfile(cached);
      setProfile(normalized);
      applyDomEffects(normalized);
      if (
        normalized.darkMode !== cached.darkMode ||
        normalized.highContrast !== cached.highContrast
      ) {
        writeCachedProfile(normalized);
      }
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const data = await accessibilityClient.getProfile();
      if (data.profile) {
        const next = normalizeAssistedProfile(
          data.profile as AccessibilityProfileData
        );
        setProfile(next);
        applyDomEffects(next);
        writeCachedProfile(next);
        if (!next.wizardCompleted && !next.assistedReadingMode) {
          setShowWizard(true);
        }
      }
    } catch {
      const cached = readCachedProfile();
      if (cached) {
        const normalized = normalizeAssistedProfile(cached);
        setProfile(normalized);
        applyDomEffects(normalized);
      } else {
        applyDomEffects(DEFAULTS);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    let idleId: number | undefined;

    const run = () => {
      if (!cancelled) void refresh();
    };

    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(run, { timeout: 2500 });
    } else {
      const timer = setTimeout(run, 400);
      return () => {
        cancelled = true;
        clearTimeout(timer);
      };
    }

    return () => {
      cancelled = true;
      if (idleId !== undefined) window.cancelIdleCallback(idleId);
    };
  }, [refresh]);

  const updatePreferences = useCallback(
    async (patch: Partial<AccessibilityProfileData>) => {
      setProfile((prev) => {
        const next = normalizeAssistedProfile({ ...prev, ...patch });
        applyDomEffects(next);
        writeCachedProfile(next);

        if (patch.fontScale != null && patch.fontScale !== prev.fontScale) {
          announce(
            `Tamaño de texto ajustado al ${Math.round(patch.fontScale * 100)} por ciento`
          );
        }
        if (patch.highContrast != null && patch.highContrast !== prev.highContrast) {
          announce(
            patch.highContrast ? "Alto contraste activado" : "Alto contraste desactivado"
          );
        }
        if (patch.darkMode != null && patch.darkMode !== prev.darkMode) {
          announce(patch.darkMode ? "Modo oscuro activado" : "Modo oscuro desactivado");
        }
        if (
          patch.assistedReadingMode != null &&
          patch.assistedReadingMode !== prev.assistedReadingMode
        ) {
          announce(
            patch.assistedReadingMode
              ? "Modo lectura asistida activado"
              : "Modo lectura asistida desactivado"
          );
        }

        return next;
      });

      const data = await accessibilityClient.updateProfile(patch).catch(() => null);
      if (data?.profile) {
        const updated = data.profile as AccessibilityProfileData;
        setProfile(updated);
        applyDomEffects(updated);
        writeCachedProfile(updated);
      }
    },
    []
  );

  const speakForUser = useCallback((text: string) => {
    unlockSpeechFromGesture();
    const hooks = {
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
    };
    if (text.length > 240) {
      speakText(text, "es-MX", hooks);
    } else {
      speakNow(text, "es-MX", hooks);
    }
  }, []);

  const speakAloud = useCallback(
    (text: string) => {
      if (
        !profileRef.current.autoReadAloud &&
        !profileRef.current.assistedReadingMode
      ) {
        return;
      }
      speakForUser(text);
    },
    [speakForUser]
  );

  const handleStopSpeaking = useCallback(() => {
    stopSpeaking({ onEnd: () => setIsSpeaking(false) });
  }, []);

  const prefsValue = useMemo(
    () => ({ ...profile, loading }),
    [profile, loading]
  );

  const transientValue = useMemo(() => ({ isSpeaking }), [isSpeaking]);

  const actionsValue = useMemo(
    () => ({
      updatePreferences,
      refresh,
      speakAloud,
      speakForUser,
      stopSpeaking: handleStopSpeaking,
    }),
    [updatePreferences, refresh, speakAloud, speakForUser, handleStopSpeaking]
  );

  return (
    <ActionsContext.Provider value={actionsValue}>
      <PrefsContext.Provider value={prefsValue}>
        <TransientContext.Provider value={transientValue}>
          {children}
          {showWizard && (
            <PreferenceWizard
              onComplete={() => {
                setShowWizard(false);
                void refresh();
              }}
            />
          )}
        </TransientContext.Provider>
      </PrefsContext.Provider>
    </ActionsContext.Provider>
  );
}

export function useAccessibilityPrefs() {
  const ctx = useContext(PrefsContext);
  if (!ctx) {
    throw new Error(
      "useAccessibilityPrefs debe usarse dentro de AccessibilityProvider"
    );
  }
  return ctx;
}

export function useAccessibilityActions() {
  const ctx = useContext(ActionsContext);
  if (!ctx) {
    throw new Error(
      "useAccessibilityActions debe usarse dentro de AccessibilityProvider"
    );
  }
  return ctx;
}

export function useAccessibilityTransient() {
  const ctx = useContext(TransientContext);
  if (!ctx) {
    throw new Error(
      "useAccessibilityTransient debe usarse dentro de AccessibilityProvider"
    );
  }
  return ctx;
}

/** Compatibilidad: combina los tres contextos (preferir hooks selectivos). */
export function useAccessibility() {
  const prefs = useAccessibilityPrefs();
  const actions = useAccessibilityActions();
  const transient = useAccessibilityTransient();
  return { ...prefs, ...actions, ...transient };
}

export type { LearningModality, LearningPace };
