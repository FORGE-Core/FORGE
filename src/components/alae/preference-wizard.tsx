"use client";

import { useState } from "react";
import type { LearningModality } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { accessibilityClient } from "@/services/client";

const LEARN_OPTIONS: { id: LearningModality; label: string; desc: string }[] =
  [
    { id: "READING", label: "Leer", desc: "Texto y resúmenes" },
    { id: "LISTENING", label: "Escuchar", desc: "Explicaciones orales" },
    { id: "VISUAL", label: "Ver ejemplos", desc: "Listas y diagramas" },
    { id: "PRACTICE", label: "Practicar", desc: "Simulaciones y ejercicios" },
  ];

const HELP_OPTIONS = [
  { id: "stepByStep", label: "Paso a paso" },
  { id: "simplified", label: "Lenguaje fácil" },
  { id: "examples", label: "Ejemplos" },
  { id: "simulations", label: "Simulaciones" },
] as const;

async function skipWizard() {
  await accessibilityClient.updateProfile({ wizardCompleted: true });
}

export function PreferenceWizard({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [modality, setModality] = useState<LearningModality>("MIXED");
  const [helps, setHelps] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  const toggleHelp = (id: string) => {
    setHelps((h) => ({ ...h, [id]: !h[id] }));
  };

  const handleSkip = async () => {
    setSaving(true);
    try {
      await skipWizard();
      onComplete();
    } finally {
      setSaving(false);
    }
  };

  const finish = async () => {
    setSaving(true);
    try {
      await accessibilityClient.updateLearningProfile({
        wizard: {
          preferredModality: modality,
          stepByStep: !!helps.stepByStep,
          simplified: !!helps.simplified,
          summaries: !!helps.simplified,
          examples: !!helps.examples,
          simulations: !!helps.simulations,
        },
      });
      onComplete();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="alae-wizard-title"
    >
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle id="alae-wizard-title">
            {step === 0
              ? "¿Cómo prefieres aprender?"
              : "¿Qué te ayuda más?"}
          </CardTitle>
          <p className="text-sm text-brand-muted-gray">
            ALAE adaptará FORGE a tu forma de aprender. Puedes cambiar esto
            después en tu perfil.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 0 ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {LEARN_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setModality(opt.id)}
                  className={cn(
                    "rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cobalt",
                    modality === opt.id
                      ? "border-brand-cobalt bg-brand-cobalt/10"
                      : "hover:bg-black/5"
                  )}
                  aria-pressed={modality === opt.id}
                >
                  <span className="font-medium">{opt.label}</span>
                  <p className="text-xs text-brand-muted-gray">{opt.desc}</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {HELP_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleHelp(opt.id)}
                  className={cn(
                    "rounded-xl border p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cobalt",
                    helps[opt.id]
                      ? "border-brand-cobalt bg-brand-cobalt/10"
                      : "hover:bg-black/5"
                  )}
                  aria-pressed={!!helps[opt.id]}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          <div className="flex justify-between pt-2">
            {step > 0 ? (
              <Button variant="outline" onClick={() => setStep(0)}>
                Atrás
              </Button>
            ) : (
              <Button
                variant="ghost"
                disabled={saving}
                onClick={() => void handleSkip()}
              >
                Omitir
              </Button>
            )}
            {step === 0 ? (
              <Button onClick={() => setStep(1)}>Siguiente</Button>
            ) : (
              <Button onClick={() => void finish()} disabled={saving}>
                {saving ? "Guardando…" : "Comenzar"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
