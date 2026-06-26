"use client";

import { useCallback, useEffect, useRef } from "react";
import { Pause, Play, Volume2, X } from "lucide-react";
import { announce } from "@/lib/alae/announcer";
import {
  ASSISTED_READING_HELP,
  getMainContentSpeech,
} from "@/lib/alae/read-element";
import { Button } from "@/components/ui/button";
import { useAccessibility } from "./accessibility-provider";

export function AssistedReadingToolbar() {
  const {
    assistedReadingMode,
    isSpeaking,
    updatePreferences,
    stopSpeaking: stop,
    speakForUser,
  } = useAccessibility();

  const welcomedRef = useRef(false);

  const readAloud = useCallback(
    (text: string) => {
      speakForUser(text);
    },
    [speakForUser]
  );

  const readPage = useCallback(() => {
    const content = getMainContentSpeech();
    readAloud(content);
    announce("Leyendo contenido de la página");
  }, [readAloud]);

  const disableMode = useCallback(async () => {
    stop();
    await updatePreferences({ assistedReadingMode: false });
    announce("Modo lectura asistida desactivado");
  }, [stop, updatePreferences]);

  useEffect(() => {
    if (!assistedReadingMode) {
      welcomedRef.current = false;
      return;
    }

    if (!welcomedRef.current) {
      welcomedRef.current = true;
      announce(
        "Modo lectura asistida activado. La página se leerá en voz alta al entrar. " +
          "Atajos: Alt R lee la página, Alt S detiene, Alt H ayuda."
      );
    }
  }, [assistedReadingMode]);

  useEffect(() => {
    if (!assistedReadingMode) return;

    function onKeyDown(event: KeyboardEvent) {
      if (!event.altKey) return;

      const key = event.key.toLowerCase();
      if (key === "r") {
        event.preventDefault();
        readPage();
      } else if (key === "s") {
        event.preventDefault();
        stop();
        announce("Lectura detenida");
      } else if (key === "h") {
        event.preventDefault();
        readAloud(ASSISTED_READING_HELP);
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [assistedReadingMode, readAloud, readPage, stop]);

  if (!assistedReadingMode) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[60] border-t border-brand-cobalt/30 bg-[#0a0a0a] px-3 py-3 text-white shadow-[0_-8px_32px_rgba(0,0,0,0.35)] md:px-6"
      role="region"
      aria-label="Controles de lectura asistida"
      data-alae-skip-speech
    >
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-medium">
          <Volume2 className="h-5 w-5 shrink-0 text-brand-lavender" aria-hidden />
          Modo para lectura por voz
        </p>
        <p className="w-full text-xs text-white/70 md:w-auto">
          Si no escuchas nada, pulsa Leer página o haz clic en la pantalla una vez.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            className="bg-brand-cobalt text-white hover:bg-brand-cobalt/90"
            onClick={readPage}
            aria-keyshortcuts="Alt+R"
          >
            <Play className="h-4 w-4" aria-hidden />
            Leer página
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="border-white/20 bg-transparent text-white hover:bg-white/10"
            onClick={() => {
              stop();
              announce("Lectura detenida");
            }}
            disabled={!isSpeaking}
            aria-keyshortcuts="Alt+S"
          >
            <Pause className="h-4 w-4" aria-hidden />
            Detener
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="border-white/20 bg-transparent text-white hover:bg-white/10"
            onClick={() => readAloud(ASSISTED_READING_HELP)}
            aria-keyshortcuts="Alt+H"
          >
            Ayuda
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="text-white/80 hover:bg-white/10 hover:text-white"
            onClick={() => void disableMode()}
            aria-label="Desactivar modo lectura asistida"
          >
            <X className="h-4 w-4" aria-hidden />
            Salir
          </Button>
        </div>
      </div>
    </div>
  );
}
