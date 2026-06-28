"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Volume2 } from "lucide-react";
import { clampFontScale } from "@/lib/alae/dom-effects";
import {
  isSpeechUnlocked,
  isSpeechSupported,
  speakNow,
  unlockSpeechFromGesture,
} from "@/lib/alae/speech";
import { useAccessibility } from "./accessibility-provider";

const AUTH_PATHS = new Set(["/login", "/register"]);

/**
 * Banner en login/registro: un clic desbloquea la voz del navegador.
 * Chrome no habla sin interacción del usuario.
 */
export function AuthVoiceAssist() {
  const pathname = usePathname();
  const { assistedReadingMode, updatePreferences, fontScale } = useAccessibility();
  const [ready, setReady] = useState(false);
  const [activated, setActivated] = useState(false);

  const isAuth = AUTH_PATHS.has(pathname);

  useEffect(() => {
    if (!isAuth) return;
    setReady(true);
    setActivated(isSpeechUnlocked());
    const onUnlock = () => setActivated(true);
    window.addEventListener("alae-speech-unlocked", onUnlock);
    return () => window.removeEventListener("alae-speech-unlocked", onUnlock);
  }, [isAuth, pathname]);

  const activate = useCallback(async () => {
    unlockSpeechFromGesture();

    if (!assistedReadingMode) {
      await updatePreferences({
        assistedReadingMode: true,
        fontScale: clampFontScale(Math.max(fontScale, 1.25)),
        darkMode: true,
        highContrast: false,
        autoReadAloud: true,
        reduceMotion: true,
        wizardCompleted: true,
        voiceInputEnabled: true,
      });
    }

    setActivated(true);
    speakNow(
      "Voz activada. Usa Tab para moverte. En correo y contraseña puedes dictar. Di arroba y punto en el correo."
    );
  }, [assistedReadingMode, updatePreferences, fontScale]);

  if (!isAuth || !ready) return null;

  if (activated && isSpeechUnlocked()) return null;

  if (!isSpeechSupported()) {
    return (
      <div className="mb-4 w-full max-w-md rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        Tu navegador no soporta voz. Usa Chrome o Edge en computadora.
      </div>
    );
  }

  return (
    <div className="mb-4 w-full max-w-md">
      <button
        type="button"
        onClick={() => void activate()}
        className="flex w-full items-center gap-3 rounded-2xl border-4 border-brand-cobalt bg-brand-cobalt px-5 py-4 text-left text-white shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-lavender"
      >
        <Volume2 className="h-8 w-8 shrink-0" aria-hidden />
        <span>
          <span className="block text-lg font-bold">Toca aquí para activar la voz</span>
          <span className="block text-sm text-white/90">
            Obligatorio en Chrome antes de leer o dictar
          </span>
        </span>
      </button>
    </div>
  );
}
