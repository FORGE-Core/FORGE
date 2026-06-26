"use client";

import { Eye, Mic, Settings2, Type, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  clampFontScale,
  FONT_SCALE_MAX,
  FONT_SCALE_MIN,
  FONT_SCALE_STEP,
} from "@/lib/alae/dom-effects";
import { useAccessibility } from "./accessibility-provider";
import { ModalitySelector } from "./modality-selector";
import { AssistedReadingToggle } from "./assisted-reading-toggle";
import { ScreenReaderGuide } from "./screen-reader-guide";

const FONT_PRESETS = [
  { label: "Pequeño", value: 0.875 },
  { label: "Normal", value: 1 },
  { label: "Grande", value: 1.25 },
  { label: "Muy grande", value: 1.5 },
  { label: "Extra grande", value: 2 },
] as const;

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-black/5 bg-brand-light-bg px-3 py-2.5 text-sm transition-colors hover:border-brand-cobalt/20">
      <span className="font-medium leading-none">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cobalt",
          checked ? "bg-brand-cobalt" : "bg-black/15"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition-transform",
            checked ? "translate-x-4" : "translate-x-0"
          )}
        />
      </button>
    </label>
  );
}

export function AccessibilitySettings() {
  const {
    fontScale,
    highContrast,
    darkMode,
    reduceMotion,
    simplifiedLanguage,
    stepByStepMode,
    autoReadAloud,
    captionsEnabled,
    learningPace,
    voiceCommandsEnabled,
    voiceInputEnabled,
    updatePreferences,
    loading,
  } = useAccessibility();

  const scaledPercent = Math.round(fontScale * 100);

  async function setFontScale(next: number) {
    await updatePreferences({ fontScale: clampFontScale(next) });
  }

  if (loading) {
    return <p className="text-sm text-brand-muted-gray">Cargando preferencias…</p>;
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-brand-cobalt" />
          <CardTitle className="text-base">Accesibilidad (ALAE)</CardTitle>
        </div>
        <p className="text-xs text-brand-muted-gray">
          FORGE se adapta automáticamente a cómo aprendes y lees.
        </p>
      </CardHeader>

      <CardContent className="space-y-5">

        {/* Lectura asistida */}
        <AssistedReadingToggle />

        <div className="h-px bg-black/5" />

        {/* Tamaño de texto */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Type className="h-3.5 w-3.5 text-brand-muted-gray" />
              <span className="text-sm font-medium">Tamaño de texto</span>
            </div>
            <span className="text-sm font-semibold text-brand-cobalt" aria-live="polite">
              {scaledPercent}%
            </span>
          </div>
          <input
            id="font-scale"
            type="range"
            min={FONT_SCALE_MIN}
            max={FONT_SCALE_MAX}
            step={FONT_SCALE_STEP}
            value={fontScale}
            onChange={(e) => void setFontScale(Number(e.target.value))}
            className="w-full accent-brand-cobalt"
          />
          <div className="flex gap-1.5">
            {FONT_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => void setFontScale(preset.value)}
                className={cn(
                  "flex-1 rounded-lg border py-1.5 text-xs font-medium transition-colors",
                  Math.abs(fontScale - preset.value) < 0.001
                    ? "border-brand-cobalt bg-brand-cobalt/10 text-brand-cobalt"
                    : "border-black/10 bg-brand-light-bg hover:border-brand-cobalt/30"
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-black/5" />

        {/* Visual + Lectura en 2 columnas */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 mb-2">
            <Eye className="h-3.5 w-3.5 text-brand-muted-gray" />
            <span className="text-xs font-semibold uppercase tracking-wide text-brand-muted-gray">Visual y lectura</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Toggle label="Alto contraste" checked={highContrast} onChange={(v) => void updatePreferences({ highContrast: v })} />
            <Toggle label="Modo oscuro" checked={darkMode} onChange={(v) => void updatePreferences({ darkMode: v })} />
            <Toggle label="Sin animaciones" checked={reduceMotion} onChange={(v) => void updatePreferences({ reduceMotion: v })} />
            <Toggle label="Subtítulos" checked={captionsEnabled} onChange={(v) => void updatePreferences({ captionsEnabled: v })} />
            <Toggle label="Lectura auto." checked={autoReadAloud} onChange={(v) => void updatePreferences({ autoReadAloud: v })} />
            <Toggle label="Lenguaje simple" checked={simplifiedLanguage} onChange={(v) => void updatePreferences({ simplifiedLanguage: v })} />
          </div>
        </div>

        <div className="h-px bg-black/5" />

        {/* Aprendizaje */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 mb-2">
            <Zap className="h-3.5 w-3.5 text-brand-muted-gray" />
            <span className="text-xs font-semibold uppercase tracking-wide text-brand-muted-gray">Aprendizaje</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Toggle label="Paso a paso" checked={stepByStepMode} onChange={(v) => void updatePreferences({ stepByStepMode: v })} />
          </div>
          <ModalitySelector />
          <select
            value={learningPace}
            onChange={(e) => void updatePreferences({ learningPace: e.target.value as "SLOW" | "NORMAL" | "FAST" })}
            className="mt-1 w-full rounded-xl border border-black/10 bg-brand-light-bg px-3 py-2 text-sm"
          >
            <option value="SLOW">Ritmo lento</option>
            <option value="NORMAL">Ritmo normal</option>
            <option value="FAST">Ritmo rápido</option>
          </select>
        </div>

        <div className="h-px bg-black/5" />

        {/* Voz */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 mb-2">
            <Mic className="h-3.5 w-3.5 text-brand-muted-gray" />
            <span className="text-xs font-semibold uppercase tracking-wide text-brand-muted-gray">Voz</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Toggle label="Entrada por voz" checked={voiceInputEnabled} onChange={(v) => void updatePreferences({ voiceInputEnabled: v })} />
            <Toggle label="Comandos globales" checked={voiceCommandsEnabled} onChange={(v) => void updatePreferences({ voiceCommandsEnabled: v })} />
          </div>
          <p className="text-xs text-brand-muted-gray pt-1">
            Comandos: «abrir mentor», «modo oscuro», «paso a paso», «aumentar texto».
          </p>
        </div>

        <ScreenReaderGuide />
      </CardContent>
    </Card>
  );
}
