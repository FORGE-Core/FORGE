"use client";

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
    return (
      <p className="text-sm text-brand-muted-gray">
        Cargando preferencias de accesibilidad…
      </p>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Accesibilidad (ALAE)</CardTitle>
        <p className="text-sm text-brand-muted-gray">
          FORGE se adapta automáticamente a cómo aprendes y lees.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <AssistedReadingToggle />

        <div className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <label htmlFor="font-scale" className="text-sm font-medium">
              Tamaño de texto
            </label>
            <span
              className="text-sm font-semibold text-brand-cobalt"
              aria-live="polite"
            >
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
            aria-valuemin={FONT_SCALE_MIN}
            aria-valuemax={FONT_SCALE_MAX}
            aria-valuenow={fontScale}
            aria-valuetext={`${scaledPercent} por ciento`}
            className="w-full accent-brand-cobalt"
          />

          <div className="flex flex-wrap gap-2">
            {FONT_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => void setFontScale(preset.value)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm transition-colors",
                  Math.abs(fontScale - preset.value) < 0.001
                    ? "border-brand-cobalt bg-brand-cobalt/10 font-medium text-brand-cobalt"
                    : "border-black/10 bg-brand-light-bg hover:border-brand-cobalt/30"
                )}
                aria-pressed={Math.abs(fontScale - preset.value) < 0.001}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <p
            className="rounded-2xl border border-black/5 bg-brand-champagne/40 px-4 py-3 leading-relaxed"
            aria-hidden
          >
            Vista previa: este es el tamaño del texto en toda la aplicación
            cuando navegas módulos, documentos y el mentor IA.
          </p>
        </div>

        <ModalitySelector />

        <ScreenReaderGuide />

        <div>
          <label htmlFor="learning-pace" className="text-sm font-medium">
            Ritmo de aprendizaje
          </label>
          <select
            id="learning-pace"
            value={learningPace}
            onChange={(e) =>
              void updatePreferences({
                learningPace: e.target.value as "SLOW" | "NORMAL" | "FAST",
              })
            }
            className="mt-2 w-full rounded-2xl border border-black/10 bg-brand-light-bg px-4 py-2.5 text-sm"
          >
            <option value="SLOW">Lento — menos pasos, más pausas</option>
            <option value="NORMAL">Normal</option>
            <option value="FAST">Rápido — respuestas concisas</option>
          </select>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              key: "highContrast",
              label: "Alto contraste",
              value: highContrast,
            },
            { key: "darkMode", label: "Modo oscuro", value: darkMode },
            {
              key: "reduceMotion",
              label: "Reducir animaciones",
              value: reduceMotion,
            },
            {
              key: "simplifiedLanguage",
              label: "Lenguaje simplificado",
              value: simplifiedLanguage,
            },
            {
              key: "stepByStepMode",
              label: "Modo paso a paso",
              value: stepByStepMode,
            },
            {
              key: "autoReadAloud",
              label: "Lectura automática",
              value: autoReadAloud,
            },
            {
              key: "captionsEnabled",
              label: "Subtítulos en videos",
              value: captionsEnabled,
            },
            {
              key: "voiceInputEnabled",
              label: "Entrada por voz (NOVA)",
              value: voiceInputEnabled,
            },
            {
              key: "voiceCommandsEnabled",
              label: "Comandos de voz globales",
              value: voiceCommandsEnabled,
            },
          ].map((opt) => (
            <label
              key={opt.key}
              className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm"
            >
              <input
                type="checkbox"
                checked={opt.value}
                onChange={(e) =>
                  void updatePreferences({
                    [opt.key]: e.target.checked,
                  } as Parameters<typeof updatePreferences>[0])
                }
                className="accent-brand-cobalt"
              />
              {opt.label}
            </label>
          ))}
        </div>

        <p className="text-xs text-brand-muted-gray">
          Comandos de voz: «abrir mentor», «modo oscuro», «paso a paso»,
          «aumentar texto», «detener».
        </p>
      </CardContent>
    </Card>
  );
}
