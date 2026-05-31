"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Gamepad2, Star } from "lucide-react";
import { simulation } from "@/data/mock-content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";

export default function SimulationsPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  const chosen = simulation.options.find((o) => o.id === selected);
  const score = chosen?.score ?? 0;

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-8">
      <div>
        <Badge className="mb-3">Simulación práctica</Badge>
        <h1 className="font-heading text-3xl font-bold">Simulaciones</h1>
        <p className="mt-1 text-brand-muted-gray">
          Toma decisiones reales y recibe feedback de la IA
        </p>
      </div>

      <Card className="border-brand-cobalt/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5 text-brand-cobalt" />
            <CardTitle>Caso: {simulation.title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="rounded-2xl bg-brand-light-bg px-5 py-4 text-sm leading-relaxed">
            {simulation.scenario}
          </p>

          {!finished ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {simulation.options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelected(opt.id)}
                  className={cn(
                    "flex gap-3 rounded-2xl border px-4 py-4 text-left transition-all",
                    selected === opt.id
                      ? "border-brand-cobalt bg-brand-champagne/50"
                      : "hover:border-black/10 hover:bg-brand-light-bg"
                  )}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl gradient-brand font-bold text-white">
                    {opt.label}
                  </span>
                  <span className="text-sm font-medium">{opt.text}</span>
                </button>
              ))}
            </div>
          ) : null}

          {!finished && selected && (
            <Button className="w-full" onClick={() => setFinished(true)}>
              Ver resultado y análisis IA
            </Button>
          )}

          <AnimatePresence>
            {finished && chosen && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full gradient-brand">
                    <span className="font-heading text-3xl font-bold text-white">
                      {score}
                    </span>
                  </div>
                  <p className="font-heading text-xl font-bold">Puntuación</p>
                  <div className="mt-4 flex justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={cn(
                          "h-6 w-6",
                          s <= Math.round(score / 20)
                            ? "fill-amber-400 text-amber-400"
                            : "text-brand-muted-gray/30"
                        )}
                      />
                    ))}
                  </div>
                </div>

                <ProgressBar value={score} size="lg" />

                <Card className="bg-brand-champagne/30">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-brand-cobalt" />
                      <CardTitle className="text-base">Análisis IA</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm leading-relaxed">
                    <p>{simulation.aiAnalysis}</p>
                    <div className="rounded-2xl bg-white px-4 py-3">
                      <p className="font-medium text-brand-cobalt">Mejora recomendada</p>
                      <p className="mt-1 text-brand-muted-gray">
                        Practica el módulo de devoluciones y repite esta simulación para
                        consolidar el flujo de verificación.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSelected(null);
                    setFinished(false);
                  }}
                >
                  Intentar otro escenario
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
