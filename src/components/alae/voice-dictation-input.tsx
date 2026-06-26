"use client";

import { Mic, MicOff } from "lucide-react";
import { useVoiceInput } from "@/hooks/use-voice-input";
import { useAuthVoiceEnabled } from "@/hooks/use-auth-voice-enabled";
import {
  normalizeSpokenEmail,
  normalizeSpokenText,
} from "@/lib/alae/voice-dictation";
import { isVoiceSupported } from "@/lib/alae/voice-recognition";
import { speakText } from "@/lib/alae/speech";
import { cn } from "@/lib/utils";
import {
  useAccessibilityActions,
  useAccessibilityPrefs,
} from "./accessibility-provider";

type VoiceDictationInputProps = {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "password";
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  className?: string;
  /** Siempre mostrar micrófono (login/registro) */
  authForm?: boolean;
};

export function VoiceDictationInput({
  id,
  name,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
  required,
  minLength,
  className,
  authForm = false,
}: VoiceDictationInputProps) {
  const { assistedReadingMode, voiceInputEnabled } = useAccessibilityPrefs();
  const { enabled: authVoice } = useAuthVoiceEnabled();
  const { speakForUser, stopSpeaking } = useAccessibilityActions();
  const voiceOn =
    assistedReadingMode || voiceInputEnabled || (authForm && authVoice);
  const supported = isVoiceSupported();

  const { listening, interim, start, stop } = useVoiceInput(
    (spoken) => {
      const next =
        type === "email"
          ? normalizeSpokenEmail(spoken)
          : normalizeSpokenText(spoken);
      onChange(next);
      if (type === "password") {
        speakForUser("Contraseña capturada por voz.");
      } else {
        speakForUser(`${label}: ${next}`);
      }
    },
    {
      onError: (message) => speakForUser(message),
    }
  );

  function handleMicClick() {
    stopSpeaking();
    if (listening) {
      stop();
      return;
    }
    void speakText(`Dicta ${label.toLowerCase()}. Habla ahora.`, "es-MX", {
      onEnd: () => start(),
    });
  }

  const displayValue = listening && interim ? interim : value;

  return (
    <div className={cn("space-y-1", className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          id={id}
          name={name}
          type={type}
          value={displayValue}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-label={label}
          readOnly={listening}
          className="min-w-0 flex-1 rounded-2xl border border-black/10 bg-brand-light-bg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-cobalt/30"
        />
        {voiceOn && supported && (
          <button
            type="button"
            onClick={handleMicClick}
            aria-label={
              listening
                ? `Detener dictado de ${label}`
                : `Dictar ${label} con el micrófono`
            }
            aria-pressed={listening}
            className={cn(
              "flex h-12 w-14 shrink-0 items-center justify-center rounded-2xl border-2 transition-colors",
              listening
                ? "border-brand-cobalt bg-brand-cobalt text-white"
                : "border-brand-cobalt bg-white text-brand-cobalt hover:bg-brand-cobalt/10"
            )}
          >
            {listening ? (
              <MicOff className="h-6 w-6" aria-hidden />
            ) : (
              <Mic className="h-6 w-6" aria-hidden />
            )}
          </button>
        )}
      </div>
      {voiceOn && supported && (
        <p className="text-xs text-brand-muted-gray">
          {listening ? "Escuchando…" : "Micrófono:"} dicta {label.toLowerCase()}
          {type === "email" ? ' (di "arroba" y "punto")' : ""}.
        </p>
      )}
      {voiceOn && !supported && (
        <p className="text-xs text-amber-700 dark:text-amber-300">
          Dictado por voz requiere Chrome o Edge.
        </p>
      )}
    </div>
  );
}
