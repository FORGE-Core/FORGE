"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getSpeechRecognition,
  isVoiceSupported,
} from "@/lib/alae/voice-recognition";

export function useVoiceInput(onFinal: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [supported] = useState(isVoiceSupported);
  const recRef = useRef<InstanceType<
    NonNullable<ReturnType<typeof getSpeechRecognition>>
  > | null>(null);

  const stop = useCallback(() => {
    recRef.current?.stop();
    setListening(false);
    setInterim("");
  }, []);

  const start = useCallback(() => {
    const Ctor = getSpeechRecognition();
    if (!Ctor) return;

    const rec = new Ctor();
    rec.lang = "es-MX";
    rec.continuous = false;
    rec.interimResults = true;

    rec.onresult = (ev) => {
      const result = ev.results[ev.results.length - 1];
      const transcript = result?.[0]?.transcript ?? "";
      const isFinal = (result as { isFinal?: boolean } | undefined)?.isFinal;
      if (isFinal) {
        setInterim("");
        if (transcript.trim()) onFinal(transcript.trim());
        stop();
      } else {
        setInterim(transcript);
      }
    };

    rec.onerror = () => {
      setListening(false);
      setInterim("");
    };

    rec.onend = () => setListening(false);

    recRef.current = rec;
    rec.start();
    setListening(true);
  }, [onFinal, stop]);

  const toggle = useCallback(() => {
    if (listening) stop();
    else start();
  }, [listening, start, stop]);

  useEffect(() => () => recRef.current?.abort(), []);

  return { listening, interim, supported, start, stop, toggle };
}
