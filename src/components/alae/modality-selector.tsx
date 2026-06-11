"use client";

import type { LearningModality } from "@prisma/client";
import { cn } from "@/lib/utils";
import { useAccessibility } from "./accessibility-provider";

const OPTIONS: { value: LearningModality; label: string }[] = [
  { value: "READING", label: "Lectura" },
  { value: "LISTENING", label: "Escucha" },
  { value: "VISUAL", label: "Visual" },
  { value: "PRACTICE", label: "Práctica" },
  { value: "MIXED", label: "Mixto" },
];

export function ModalitySelector({ className }: { className?: string }) {
  const { preferredModality, updatePreferences } = useAccessibility();

  return (
    <fieldset className={cn("space-y-2", className)}>
      <legend className="text-sm font-medium">Modalidad de aprendizaje</legend>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() =>
              void updatePreferences({ preferredModality: opt.value })
            }
            className={cn(
              "rounded-full border px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cobalt",
              preferredModality === opt.value
                ? "border-brand-cobalt bg-brand-cobalt text-white"
                : "hover:bg-black/5"
            )}
            aria-pressed={preferredModality === opt.value}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
