"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  claimVoiceInputSession,
  releaseVoiceInputSession,
} from "@/lib/alae/voice-input-session";
import { stopSpeaking } from "@/lib/alae/speech";
import {
  getSpeechErrorMessage,
  getSpeechRecognition,
  isVoiceSupported,
} from "@/lib/alae/voice-recognition";

type UseVoiceInputOptions = {
  onError?: (message: string) => void;
};

export function useVoiceInput(
  onFinal: (text: string) => void,
  options: UseVoiceInputOptions = {}
) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const onFinalRef = useRef(onFinal);
  const onErrorRef = useRef(options.onError);
  const accumulatedRef = useRef("");
  const transcriptRef = useRef("");
  const recRef = useRef<InstanceType<
    NonNullable<ReturnType<typeof getSpeechRecognition>>
  > | null>(null);
  const releaseRef = useRef<(() => void) | null>(null);

  onFinalRef.current = onFinal;
  onErrorRef.current = options.onError;

  const cleanupRecognition = useCallback(() => {
    setListening(false);
    setInterim("");
    transcriptRef.current = "";
    accumulatedRef.current = "";
    recRef.current = null;
    releaseRef.current?.();
    releaseRef.current = null;
  }, []);

  const stop = useCallback(() => {
    try {
      recRef.current?.stop();
    } catch {
      cleanupRecognition();
    }
  }, [cleanupRecognition]);

  const start = useCallback(async () => {
    const Ctor = getSpeechRecognition();
    if (!Ctor) {
      onErrorRef.current?.(
        "Tu navegador no admite dictado por voz. Usa Chrome o Edge."
      );
      return;
    }

    stopSpeaking();

    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch {
      onErrorRef.current?.(
        "Permiso de micrófono denegado. Permite el micrófono en el navegador."
      );
      return;
    }

    try {
      recRef.current?.abort();
    } catch {
      /* ignore */
    }

    releaseRef.current?.();
    releaseRef.current = claimVoiceInputSession(stop);

    accumulatedRef.current = "";
    transcriptRef.current = "";
    setInterim("");

    const rec = new Ctor();
    rec.lang = "es-MX";
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (ev) => {
      let interimPart = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const result = ev.results[i];
        const transcript = result?.[0]?.transcript ?? "";
        if (result.isFinal) {
          accumulatedRef.current += transcript;
        } else {
          interimPart += transcript;
        }
      }
      transcriptRef.current = accumulatedRef.current + interimPart;
      setInterim(transcriptRef.current);
    };

    rec.onerror = (ev) => {
      if (ev.error === "aborted" || ev.error === "no-speech") {
        cleanupRecognition();
        return;
      }
      const message = getSpeechErrorMessage(ev.error);
      if (message) onErrorRef.current?.(message);
      cleanupRecognition();
    };

    rec.onend = () => {
      const text = transcriptRef.current.trim();
      cleanupRecognition();
      if (text) onFinalRef.current(text);
    };

    recRef.current = rec;

    try {
      rec.start();
      setListening(true);
    } catch {
      onErrorRef.current?.("No se pudo iniciar el micrófono. Intenta de nuevo.");
      cleanupRecognition();
    }
  }, [cleanupRecognition, stop]);

  const toggle = useCallback(() => {
    if (listening) stop();
    else void start();
  }, [listening, start, stop]);

  useEffect(
    () => () => {
      try {
        recRef.current?.abort();
      } catch {
        /* ignore */
      }
      releaseVoiceInputSession(stop);
    },
    [stop]
  );

  return {
    listening,
    interim,
    supported: isVoiceSupported(),
    start,
    stop,
    toggle,
  };
}
