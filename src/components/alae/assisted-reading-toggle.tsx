"use client";

import { Eye, Volume2 } from "lucide-react";
import { clampFontScale } from "@/lib/alae/dom-effects";
import { cn } from "@/lib/utils";
import { useAccessibility } from "./accessibility-provider";

type AssistedReadingToggleProps = {
  className?: string;
  compact?: boolean;
};

/** Activa lectura por voz del navegador — sin instalar NVDA ni JAWS. */
export function AssistedReadingToggle({
  className,
  compact = false,
}: AssistedReadingToggleProps) {
  const { assistedReadingMode, loading, updatePreferences, fontScale } =
    useAccessibility();

  async function toggle() {
    const enabling = !assistedReadingMode;
    await updatePreferences({
      assistedReadingMode: enabling,
      ...(enabling
        ? {
            fontScale: clampFontScale(Math.max(fontScale, 1.25)),
            darkMode: true,
            highContrast: false,
            autoReadAloud: true,
            reduceMotion: true,
            voiceInputEnabled: true,
          }
        : {
            highContrast: false,
          }),
    });
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => void toggle()}
      aria-pressed={assistedReadingMode}
      className={cn(
        "flex items-center gap-2 rounded-2xl border-2 px-4 py-3 text-left transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cobalt focus-visible:ring-offset-2",
        assistedReadingMode
          ? "border-brand-cobalt bg-brand-cobalt text-white"
          : "border-brand-cobalt/40 bg-white hover:border-brand-cobalt hover:bg-brand-champagne/30",
        compact && "w-full justify-center px-3 py-2.5 text-sm",
        className
      )}
    >
      {assistedReadingMode ? (
        <Volume2 className="h-5 w-5 shrink-0" aria-hidden />
      ) : (
        <Eye className="h-5 w-5 shrink-0" aria-hidden />
      )}
      <span>
        <span className="block font-semibold">
          {assistedReadingMode
            ? "Modo lectura activo"
            : "Modo lectura asistida"}
        </span>
        {!compact && (
          <span
            className={cn(
              "mt-0.5 block text-xs",
              assistedReadingMode ? "text-white/85" : "text-brand-muted-gray"
            )}
          >
            {assistedReadingMode
              ? "La app lee en voz alta con Tab. Alt+R lee la página."
              : "Para personas con baja visión. Solo el navegador, sin instalar apps."}
          </span>
        )}
      </span>
    </button>
  );
}
