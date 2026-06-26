"use client";

import { useEffect } from "react";
import { installSpeechUnlockListeners } from "@/lib/alae/speech";

/** Desbloquea speechSynthesis en el primer clic o tecla del usuario. */
export function SpeechUnlock() {
  useEffect(() => installSpeechUnlockListeners(), []);
  return null;
}
