"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getSpeechRecognition,
  isVoiceSupported,
} from "@/lib/alae/voice-recognition";

type UseVoiceInputOptions = {
  onError?: (message: string) => void;
};

const ERROR_MESSAGES: Record<string, string> = {
  "not-allowed":
    "Permiso de micrófono denegado. Permite el micrófono en el navegador.",
  "service-not-allowed":
    "El micrófono no está disponible. Usa Chrome o Edge en HTTPS.",
  "no-speech": "No escuché nada. Intenta de nuevo, más cerca del micrófono.",
  aborted: "",
  "audio-capture": "No se detectó micrófono en este dispositivo.",
  network: "Error de red al usar el micrófono. Revisa tu conexión.",
};

export function useVoiceInput(
  onFinal: (text: string) => void,
  options: UseVoiceInputOptions = {}
) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [supported] = useState(isVoiceSupported);
  const onFinalRef = useRef(onFinal);
  const onErrorRef = useRef(options.onError);
  const interimRef = useRef("");
  const recRef = useRef<InstanceType<
    NonNullable<ReturnType<typeof getSpeechRecognition>>
  > | null>(null);

  onFinalRef.current = onFinal;
  onErrorRef.current = options.onError;

  const stop = useCallback(() => {
    recRef.current?.stop();
    setListening(false);
    setInterim("");
    interimRef.current = "";
  }, []);

  const commitTranscript = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      onFinalRef.current(trimmed);
    },
    []
  );

  const start = useCallback(() => {
    const Ctor = getSpeechRecognition();
    if (!Ctor) {
      onErrorRef.current?.(
        "Dictado no disponible en este navegador. Usa Chrome o Edge."
      );
      return;
    }

    recRef.current?.abort();

    const rec = new Ctor();
    rec.lang = "es-MX";
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onresult = (ev) => {
      let interimText = "";
      let finalText = "";

      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const result = ev.results[i];
        const transcript = result?.[0]?.transcript ?? "";
        if (result.isFinal) {
          finalText += transcript;
        } else {
          interimText += transcript;
        }
      }

      if (interimText) {
        interimRef.current = interimText;
        setInterim(interimText);
      }

      if (finalText.trim()) {
        interimRef.current = "";
        setInterim("");
        commitTranscript(finalText);
        stop();
      }
    };

    rec.onerror = (ev) => {
      const msg = ERROR_MESSAGES[ev.error] ?? "No se pudo usar el micrófono.";
      if (msg) onErrorRef.current?.(msg);
      setListening(false);
      setInterim("");
      interimRef.current = "";
    };

    rec.onend = () => {
      setListening(false);
      const pending = interimRef.current.trim();
      interimRef.current = "";
      setInterim("");
      if (pending) {
        commitTranscript(pending);
      }
    };

    recRef.current = rec;

    try {
      rec.start();
      setListening(true);
    } catch {
      onErrorRef.current?.("No se pudo iniciar el micrófono. Intenta de nuevo.");
      setListening(false);
    }
  }, [commitTranscript, stop]);

  const toggle = useCallback(() => {
    if (listening) stop();
    else start();
  }, [listening, start, stop]);

  useEffect(() => () => recRef.current?.abort(), []);

  return { listening, interim, supported, start, stop, toggle };
}
