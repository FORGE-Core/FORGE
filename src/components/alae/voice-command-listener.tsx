"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { getSpeechRecognition } from "@/lib/alae/voice-recognition";
import { matchVoiceCommand, VOICE_COMMAND_HINTS } from "@/lib/alae/voice-commands";
import { stopSpeaking } from "@/lib/alae/speech";
import { useAccessibility } from "./accessibility-provider";

export function VoiceCommandListener() {
  const router = useRouter();
  const {
    voiceCommandsEnabled,
    fontScale,
    updatePreferences,
    darkMode,
    stepByStepMode,
    simplifiedLanguage,
    autoReadAloud,
  } = useAccessibility();

  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const activeRef = useRef(false);

  const handleTranscript = useCallback(
    async (text: string) => {
      const match = matchVoiceCommand(text);
      if (!match) return;
      setLastCommand(match.feedback);

      const { action } = match;
      switch (action.type) {
        case "NAVIGATE":
          router.push(action.href);
          break;
        case "TOGGLE": {
          const map = {
            darkMode,
            stepByStepMode,
            simplifiedLanguage,
            autoReadAloud,
          };
          await updatePreferences({
            [action.key]: !map[action.key],
          } as Parameters<typeof updatePreferences>[0]);
          break;
        }
        case "ADJUST_FONT":
          await updatePreferences({
            fontScale: Math.min(
              2,
              Math.max(0.875, fontScale + action.delta)
            ),
          });
          break;
        case "STOP_SPEECH":
          stopSpeaking();
          break;
      }
    },
    [
      router,
      updatePreferences,
      darkMode,
      stepByStepMode,
      simplifiedLanguage,
      autoReadAloud,
      fontScale,
    ]
  );

  useEffect(() => {
    if (!voiceCommandsEnabled) return;

    const Ctor = getSpeechRecognition();
    if (!Ctor) return;

    let rec: InstanceType<typeof Ctor> | null = null;
    let restartTimer: ReturnType<typeof setTimeout>;

    function startListening() {
      if (activeRef.current || !Ctor) return;
      rec = new Ctor();
      rec.lang = "es-MX";
      rec.continuous = true;
      rec.interimResults = false;

      rec.onresult = (ev) => {
        const last = ev.results[ev.results.length - 1];
        const text = last?.[0]?.transcript;
        if (text) void handleTranscript(text);
      };

      rec.onend = () => {
        activeRef.current = false;
        if (voiceCommandsEnabled) {
          restartTimer = setTimeout(startListening, 800);
        }
      };

      rec.onerror = () => {
        activeRef.current = false;
      };

      try {
        rec.start();
        activeRef.current = true;
      } catch {
        activeRef.current = false;
      }
    }

    startListening();

    return () => {
      clearTimeout(restartTimer);
      rec?.abort();
      activeRef.current = false;
    };
  }, [voiceCommandsEnabled, handleTranscript]);

  if (!voiceCommandsEnabled) return null;

  return (
    <div
      className="fixed bottom-24 right-6 z-40 max-w-[200px] rounded-xl border border-brand-cobalt/30 bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur"
      role="status"
      aria-live="polite"
    >
      <p className="font-medium text-brand-cobalt">🎙 Comandos de voz</p>
      {lastCommand ? (
        <p className="mt-1 text-brand-muted-gray">{lastCommand}</p>
      ) : (
        <p className="mt-1 text-brand-muted-gray">
          Di: {VOICE_COMMAND_HINTS.slice(0, 3).join(", ")}…
        </p>
      )}
    </div>
  );
}
