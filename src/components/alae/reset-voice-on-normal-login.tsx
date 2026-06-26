"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { stopSpeaking } from "@/lib/alae/speech";
import { useAccessibility } from "./accessibility-provider";

/**
 * En login estándar (sin ?accesible=1) apaga voz e resets assistedReadingMode.
 * Garantiza que el acceso inclusivo quede solo para quien entra por /accesible.
 */
export function ResetVoiceOnNormalLogin() {
  const searchParams = useSearchParams();
  const { assistedReadingMode, autoReadAloud, updatePreferences, loading } =
    useAccessibility();

  useEffect(() => {
    if (searchParams.get("accesible") === "1") return;

    // Silenció inmediatamente cualquier síntesis de voz activa
    stopSpeaking();

    if (loading) return;
    if (!assistedReadingMode && !autoReadAloud) return;

    void updatePreferences({
      assistedReadingMode: false,
      autoReadAloud: false,
      voiceInputEnabled: false,
      voiceCommandsEnabled: false,
    });
  }, [loading, assistedReadingMode, autoReadAloud, searchParams, updatePreferences]);

  return null;
}
