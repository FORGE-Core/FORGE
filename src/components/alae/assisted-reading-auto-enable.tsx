"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { clampFontScale } from "@/lib/alae/dom-effects";
import { useAccessibility } from "./accessibility-provider";

/** Activa lectura asistida si la URL incluye ?accesible=1 */
export function AssistedReadingAutoEnable() {
  const searchParams = useSearchParams();
  const { assistedReadingMode, updatePreferences, loading, fontScale } =
    useAccessibility();

  useEffect(() => {
    if (loading || assistedReadingMode) return;
    if (searchParams.get("accesible") !== "1") return;
    void updatePreferences({
      assistedReadingMode: true,
      fontScale: clampFontScale(Math.max(fontScale, 1.25)),
      darkMode: true,
      highContrast: false,
      autoReadAloud: true,
      reduceMotion: true,
      wizardCompleted: true,
      voiceInputEnabled: true,
    });
  }, [loading, assistedReadingMode, searchParams, updatePreferences, fontScale]);

  return null;
}
