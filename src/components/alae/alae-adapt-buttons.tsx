"use client";

import { useState } from "react";
import { Footprints, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccessibility } from "./accessibility-provider";
import { SimplifiedContent } from "./simplified-content";
import { StepByStepView } from "./step-by-step-view";
import { alaeClient } from "@/services/client";

export function AlaeAdaptButtons({
  content,
  title,
  sourceId,
  sourceType = "MODULE",
}: {
  content: string;
  title?: string;
  sourceId?: string;
  sourceType?: string;
}) {
  const [simplified, setSimplified] = useState<string | null>(null);
  const [steps, setSteps] = useState<
    { order: number; title: string; body: string }[] | null
  >(null);
  const [loading, setLoading] = useState<"simplify" | "steps" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { speakAloud } = useAccessibility();

  const adapt = async (type: "SIMPLIFY" | "STEP_BY_STEP") => {
    setLoading(type === "SIMPLIFY" ? "simplify" : "steps");
    setError(null);
    try {
      const data = await alaeClient.adapt({
        type,
        content,
        title,
        sourceId,
        sourceType,
      });
      if (type === "SIMPLIFY") {
        setSimplified(data.content as string);
        speakAloud(data.content as string);
      } else {
        setSteps((data.steps ?? []) as { order: number; title: string; body: string }[]);
        speakAloud(data.content as string);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo adaptar el contenido"
      );
    } finally {
      setLoading(null);
    }
  };

  if (!content.trim()) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void adapt("SIMPLIFY")}
          disabled={loading !== null}
          aria-label="Explicar fácil"
        >
          <Sparkles className="mr-1 h-4 w-4" aria-hidden />
          {loading === "simplify" ? "Generando…" : "✨ Explicar fácil"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void adapt("STEP_BY_STEP")}
          disabled={loading !== null}
          aria-label="Guíame paso a paso"
        >
          <Footprints className="mr-1 h-4 w-4" aria-hidden />
          {loading === "steps" ? "Generando…" : "👣 Guíame paso a paso"}
        </Button>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {simplified && <SimplifiedContent content={simplified} />}
      {steps && steps.length > 0 && <StepByStepView steps={steps} />}
    </div>
  );
}
