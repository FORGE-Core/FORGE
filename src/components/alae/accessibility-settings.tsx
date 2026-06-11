"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccessibility } from "./accessibility-provider";
import { ModalitySelector } from "./modality-selector";

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
        <div>
          <label htmlFor="font-scale" className="text-sm font-medium">
            Tamaño de texto ({Math.round(fontScale * 100)}%)
          </label>
          <input
            id="font-scale"
            type="range"
            min={0.875}
            max={2}
            step={0.125}
            value={fontScale}
            onChange={(e) =>
              void updatePreferences({ fontScale: Number(e.target.value) })
            }
            className="mt-2 w-full accent-brand-cobalt"
          />
        </div>

        <ModalitySelector />

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
