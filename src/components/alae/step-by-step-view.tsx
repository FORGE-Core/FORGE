"use client";

import { Footprints } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Step = { order: number; title: string; body: string };

export function StepByStepView({
  steps,
  title = "Guía paso a paso",
}: {
  steps: Step[];
  title?: string;
}) {
  if (!steps.length) return null;

  return (
    <Card className="border-brand-cobalt/30" role="region" aria-label={title}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Footprints className="h-4 w-4" aria-hidden />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="space-y-4">
          {steps.map((step) => (
            <li
              key={step.order}
              className="rounded-lg border bg-white/60 p-4"
              aria-label={`Paso ${step.order}`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-cobalt">
                Paso {step.order}
              </p>
              <h4 className="mt-1 font-medium">{step.title}</h4>
              <p className="mt-1 text-sm text-brand-muted-gray">{step.body}</p>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
