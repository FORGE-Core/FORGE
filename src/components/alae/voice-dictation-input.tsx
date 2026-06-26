"use client";

import { useCallback, useRef } from "react";
import { Mic, MicOff } from "lucide-react";
import { useVoiceInput } from "@/hooks/use-voice-input";
import {
  normalizeSpokenEmail,
  normalizeSpokenText,
} from "@/lib/alae/voice-dictation";
import { isVoiceSupported } from "@/lib/alae/voice-recognition";
import { announce } from "@/lib/alae/announcer";
import { isSpeechUnlocked, speakNow, stopSpeaking } from "@/lib/alae/speech";
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
  alwaysShowVoice?: boolean;
  micFirst?: boolean;
  autoStartOnFocus?: boolean;
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
  alwaysShowVoice = false,
  micFirst = false,
  autoStartOnFocus = false,
}: VoiceDictationInputProps) {
  const { assistedReadingMode, voiceInputEnabled, autoReadAloud } =
    useAccessibilityPrefs();
  const { speakForUser } = useAccessibilityActions();
  const voiceOn = alwaysShowVoice || assistedReadingMode || voiceInputEnabled;
  const supported = isVoiceSupported();
  const showMic = voiceOn && supported;
  const hintId = `${id}-mic-hint`;
  const startRef = useRef<() => Promise<void>>(async () => {});
  const listeningRef = useRef(false);
  const focusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleFinal = useCallback(
    (spoken: string) => {
      const next =
        type === "email"
          ? normalizeSpokenEmail(spoken)
          : normalizeSpokenText(spoken);
      onChange(next);
      if (type === "password") {
        speakForUser("Contraseña capturada.");
      } else {
        speakForUser(`${label}: ${next}`);
      }
    },
    [type, onChange, speakForUser, label]
  );

  const handleError = useCallback(
    (message: string) => {
      announce(message, "assertive");
      speakForUser(message);
    },
    [speakForUser]
  );

  const { listening, interim, start, stop } = useVoiceInput(handleFinal, {
    onError: handleError,
  });

  startRef.current = start;
  listeningRef.current = listening;

  const beginDictation = useCallback(() => {
    if (!showMic || listeningRef.current) return;

    if (!isSpeechUnlocked()) {
      announce(
        "Primero toca el botón azul Activar voz en la parte superior.",
        "assertive"
      );
      speakNow("Primero toca el botón activar voz.");
      return;
    }

    stopSpeaking();

    const prompt =
      type === "email"
        ? `${label}. Dicta tu correo. Di arroba y punto.`
        : type === "password"
          ? `${label}. Dicta tu contraseña.`
          : `${label}. Dicta ahora.`;

    announce(prompt, "assertive");
    speakNow(prompt);

    window.setTimeout(() => {
      void startRef.current();
    }, 500);
  }, [showMic, label, type]);

  const handleInputFocus = useCallback(() => {
    if (!autoStartOnFocus || !showMic) return;
    if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
    focusTimerRef.current = setTimeout(() => {
      beginDictation();
    }, 200);
  }, [autoStartOnFocus, showMic, beginDictation]);

  const handleInputBlur = useCallback(() => {
    if (focusTimerRef.current) {
      clearTimeout(focusTimerRef.current);
      focusTimerRef.current = null;
    }
    if (!autoStartOnFocus || !listeningRef.current) return;
    window.setTimeout(() => {
      if (document.activeElement?.closest(`[data-alae-field-id="${id}"]`)) return;
      stop();
    }, 150);
  }, [autoStartOnFocus, stop, id]);

  const displayValue = listening && interim ? interim : value;

  const micLabel = listening
    ? `Detener dictado de ${label}`
    : `Dictar ${label} con el micrófono`;

  function handleMicActivate() {
    if (listening) {
      stop();
      speakForUser("Dictado detenido.");
      return;
    }
    beginDictation();
  }

  function handleMicKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      handleMicActivate();
    }
  }

  const micButton = showMic ? (
    <button
      type="button"
      id={`${id}-mic`}
      tabIndex={autoStartOnFocus ? -1 : 0}
      onClick={handleMicActivate}
      onKeyDown={handleMicKeyDown}
      aria-label={micLabel}
      aria-describedby={hintId}
      aria-pressed={listening}
      aria-controls={id}
      className={cn(
        "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cobalt focus-visible:ring-offset-2",
        listening
          ? "border-brand-cobalt bg-brand-cobalt text-white"
          : "border-black/10 bg-white text-brand-cobalt hover:border-brand-cobalt/40 dark:border-white/20 dark:bg-[#1c1c1f]"
      )}
    >
      {listening ? (
        <MicOff className="h-5 w-5" aria-hidden />
      ) : (
        <Mic className="h-5 w-5" aria-hidden />
      )}
    </button>
  ) : null;

  return (
    <div
      className={cn("space-y-1", className)}
      data-alae-auto-voice={autoStartOnFocus ? "true" : undefined}
      data-alae-field-id={id}
    >
      <label
        htmlFor={id}
        className={alwaysShowVoice ? "block text-sm font-medium" : "sr-only"}
      >
        {label}
      </label>
      {showMic && (
        <span id={hintId} className="sr-only">
          Al enfocar con Tab se lee el campo y se activa el micrófono.
        </span>
      )}
      <div className="flex gap-2">
        {micFirst && micButton}
        <input
          id={id}
          name={name}
          type={type}
          value={displayValue}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-label={label}
          aria-describedby={showMic ? hintId : undefined}
          readOnly={listening}
          className="min-w-0 flex-1 rounded-2xl border border-black/10 bg-brand-light-bg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-cobalt/30 dark:border-white/10 dark:bg-[#1c1c1f]"
        />
        {!micFirst && micButton}
      </div>
      {showMic && (
        <p className="text-xs text-brand-muted-gray" aria-hidden>
          Tab en {label.toLowerCase()}: lee y activa micrófono.
        </p>
      )}
      {(autoReadAloud || assistedReadingMode) && showMic && listening && (
        <p className="sr-only" role="status" aria-live="polite">
          Escuchando {label.toLowerCase()}
        </p>
      )}
    </div>
  );
}
