"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Gamepad2, Loader2, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { FeedbackBanner } from "@/components/shared/feedback-banner";
import { cn } from "@/lib/utils";
import { activitiesClient } from "@/services/client";
import { ApiClientError } from "@/services/client/http";

type Simulation = {
  id: string;
  title: string;
  scenario: string;
  options: { id: string; label: string; text: string; score: number }[];
  aiAnalysis: string;
  moduleTitle: string | null;
  moduleSlug: string | null;
  current: number;
  total: number;
};

export default function SimulationsPage() {
  const [simulation, setSimulation] = useState<Simulation | null>(null);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await activitiesClient.getSimulation(index);
      setSimulation((data.simulation ?? null) as Simulation | null);
      setSelected(null);
      setFinished(false);
      setSubmitError(null);
    } catch (err) {
      setError(
        err instanceof ApiClientError ? err.message : "Error de conexión"
      );
      setSimulation(null);
    } finally {
      setLoading(false);
    }
  }, [index]);

  useEffect(() => {
    load();
  }, [load]);

  const chosen = simulation?.options.find((o) => o.id === selected);
  const score = chosen?.score ?? 0;

  async function handleFinish() {
    if (!simulation || !selected) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await activitiesClient.submitSimulationAttempt(simulation.id, {
        selectedId: selected,
      });
      setFinished(true);
    } catch (err) {
      setSubmitError(
        err instanceof ApiClientError ? err.message : "Error de conexión al guardar"
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <p className="text-sm text-brand-muted-gray flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando simulación…
      </p>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-12">
        <FeedbackBanner variant="error" message={error} />
        <Button onClick={() => load()}>Reintentar</Button>
      </div>
    );
  }

  if (!simulation) {
    return (
      <div className="mx-auto max-w-lg text-center space-y-4 py-12">
        <Gamepad2 className="mx-auto h-12 w-12 text-brand-muted-gray/40" />
        <h1 className="font-heading text-2xl font-bold">Simulaciones</h1>
        <p className="text-brand-muted-gray">
          Aún no hay simulaciones. Sube un PDF en Documentos y genera contenido
          con IA para crear casos prácticos.
        </p>
        <Button asChild>
          <Link href="/dashboard/documents">Ir a documentos</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-8">
      <div>
        <Badge className="mb-3">Simulación práctica</Badge>
        <h1 className="font-heading text-3xl font-bold">Simulaciones</h1>
        <p className="mt-1 text-brand-muted-gray">
          Toma decisiones reales y recibe feedback
        </p>
        {simulation.total > 1 && (
          <p className="mt-2 text-sm text-brand-muted-gray">
            Caso {simulation.current} de {simulation.total}
            {simulation.moduleTitle && ` · ${simulation.moduleTitle}`}
          </p>
        )}
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

          {submitError && (
            <FeedbackBanner variant="error" message={submitError} />
          )}

          {!finished && selected && (
            <Button
              className="w-full"
              disabled={submitting}
              onClick={handleFinish}
            >
              {submitting ? "Guardando…" : "Ver resultado y análisis"}
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
                      <CardTitle className="text-base">Análisis</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm leading-relaxed">
                    <p>{simulation.aiAnalysis}</p>
                  </CardContent>
                </Card>

                <div className="flex flex-wrap gap-2">
                  {simulation.current < simulation.total && (
                    <Button
                      className="flex-1"
                      onClick={() => setIndex((i) => i + 1)}
                    >
                      Siguiente simulación
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setSelected(null);
                      setFinished(false);
                      setSubmitError(null);
                    }}
                  >
                    Intentar de nuevo
                  </Button>
                  {simulation.moduleSlug && (
                    <Button variant="outline" className="flex-1" asChild>
                      <Link href={`/dashboard/modules/${simulation.moduleSlug}`}>
                        Ver módulo
                      </Link>
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
