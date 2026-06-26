"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Pause, Play, Volume2, X } from "lucide-react";
import { announce } from "@/lib/alae/announcer";
import {
  ASSISTED_READING_HELP,
  getMainContentSpeech,
  getReadableLabel,
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

  const pathname = usePathname();
  const lastFocusRef = useRef<Element | null>(null);
  const focusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
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
      readAloud(
        "Modo lectura asistida activado. FORGE leerá en voz alta lo que selecciones con Tab. " +
          ASSISTED_READING_HELP
      );
    }
  }, [assistedReadingMode, readAloud]);

  useEffect(() => {
    if (!assistedReadingMode) return;

    const timer = setTimeout(() => {
      const intro = getMainContentSpeech();
      if (intro.length > 20) readAloud(intro.slice(0, 280));
    }, 600);

    return () => clearTimeout(timer);
  }, [pathname, assistedReadingMode, readAloud]);

  useEffect(() => {
    if (!assistedReadingMode) return;

    function onFocusIn(event: FocusEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;

      if (focusTimer.current) clearTimeout(focusTimer.current);
      focusTimer.current = setTimeout(() => {
        if (lastFocusRef.current === target) return;
        lastFocusRef.current = target;

        const label = getReadableLabel(target);
        if (label) readAloud(label);
      }, 350);
    }

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

    document.addEventListener("focusin", onFocusIn, true);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("focusin", onFocusIn, true);
      document.removeEventListener("keydown", onKeyDown);
      if (focusTimer.current) clearTimeout(focusTimer.current);
    };
  }, [assistedReadingMode, readAloud, readPage, stop]);

  if (!assistedReadingMode) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[60] border-t border-brand-cobalt/30 bg-[#0a0a0a] px-3 py-3 text-white shadow-[0_-8px_32px_rgba(0,0,0,0.35)] md:px-6"
      role="region"
      aria-label="Controles de lectura asistida"
    >
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-medium">
          <Volume2 className="h-5 w-5 shrink-0 text-brand-lavender" aria-hidden />
          Modo para lectura por voz
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
