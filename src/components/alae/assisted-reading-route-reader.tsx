"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { getMainContentSpeech } from "@/lib/alae/read-element";
import { isSpeechUnlocked, speakText, stopSpeaking } from "@/lib/alae/speech";
import { useAccessibility } from "./accessibility-provider";

const SKIP_AUTO_READ = new Set(["/login", "/register", "/accesible"]);

/** Lee el contenido al cambiar de pantalla (no en login/registro). */
export function AssistedReadingRouteReader() {
  const pathname = usePathname();
  const { assistedReadingMode, speakForUser } = useAccessibility();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!assistedReadingMode || !isSpeechUnlocked()) {
      lastPathRef.current = null;
      return;
    }

    if (SKIP_AUTO_READ.has(pathname)) return;
    if (lastPathRef.current === pathname) return;
    lastPathRef.current = pathname;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      const content = getMainContentSpeech();
      if (!content || content === "Página sin texto legible.") return;
      stopSpeaking();
      speakText(content);
    }, 900);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pathname, assistedReadingMode, speakForUser]);

  return null;
}
