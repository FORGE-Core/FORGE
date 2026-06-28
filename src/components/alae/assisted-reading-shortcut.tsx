"use client";

import { useEffect } from "react";
import { clampFontScale } from "@/lib/alae/dom-effects";
import { unlockSpeechFromGesture, speakNow } from "@/lib/alae/speech";
import { useAccessibility } from "./accessibility-provider";

const HELP =
  "Atajo de teclado: Alt, Mayús y L, para activar o desactivar el modo lectura en cualquier página.";

/** Atajo global Alt+Shift+L para activar modo lectura sin usar el mouse. */
export function AssistedReadingShortcut() {
  const { assistedReadingMode, updatePreferences, fontScale } =
    useAccessibility();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!event.altKey || !event.shiftKey) return;
      if (event.key.toLowerCase() !== "l") return;

      event.preventDefault();
      unlockSpeechFromGesture();
      const enabling = !assistedReadingMode;
      void updatePreferences({
        assistedReadingMode: enabling,
        ...(enabling
          ? {
              fontScale: clampFontScale(Math.max(fontScale, 1.25)),
              darkMode: true,
              highContrast: false,
            autoReadAloud: true,
            reduceMotion: true,
            voiceInputEnabled: true,
          }
          : { highContrast: false }),
      });

      speakNow(
        enabling
          ? "Modo lectura activado. " + HELP
          : "Modo lectura desactivado."
      );
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [assistedReadingMode, fontScale, updatePreferences]);

  return null;
}
