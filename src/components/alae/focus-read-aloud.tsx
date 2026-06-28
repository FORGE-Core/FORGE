"use client";

import { useEffect, useRef, useState } from "react";
import { announce } from "@/lib/alae/announcer";
import { getReadableLabel } from "@/lib/alae/read-element";
import { isSpeechUnlocked, speakNow, stopSpeaking } from "@/lib/alae/speech";
import { useAccessibility } from "./accessibility-provider";

function shouldSkipFocusTarget(target: Element): boolean {
  if (target.closest('[aria-label="Controles de lectura asistida"]')) return true;
  if (
    target.matches("input, textarea, select") &&
    target.closest('[data-alae-auto-voice="true"]')
  ) {
    return true;
  }
  return false;
}

/** Lee en voz alta el elemento enfocado con Tab. */
export function FocusReadAloud() {
  const { assistedReadingMode } = useAccessibility();
  const [unlocked, setUnlocked] = useState(false);
  const lastTargetRef = useRef<Element | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setUnlocked(isSpeechUnlocked());
    const onUnlock = () => setUnlocked(true);
    window.addEventListener("alae-speech-unlocked", onUnlock);
    return () => window.removeEventListener("alae-speech-unlocked", onUnlock);
  }, []);

  const enabled = unlocked && assistedReadingMode;

  useEffect(() => {
    if (!enabled) {
      lastTargetRef.current = null;
      return;
    }

    function onFocusIn(event: FocusEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (shouldSkipFocusTarget(target)) return;

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (lastTargetRef.current === target) return;
        lastTargetRef.current = target;

        const label = getReadableLabel(target);
        if (!label) return;

        stopSpeaking();
        announce(label, "assertive");
        speakNow(label);
      }, 150);
    }

    document.addEventListener("focusin", onFocusIn, true);
    return () => {
      document.removeEventListener("focusin", onFocusIn, true);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [enabled]);

  return null;
}
