"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  Bot,
  CheckCircle2,
  GripVertical,
  Loader2,
  Trophy,
  XCircle,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useAccessibility } from "@/components/alae/accessibility-provider";
import { FeedbackBanner } from "@/components/shared/feedback-banner";
import { cn } from "@/lib/utils";

type ActivityData = {
  id: string;
  title: string;
  type: string;
  moduleTitle: string;
  moduleSlug: string | null;
  question?: string;
  options?: { id: string; text: string; correct: boolean }[];
  steps?: { id: string; text: string; hasError?: boolean }[];
  explanation?: string;
  current: number;
  total: number;
};

const typeLabels: Record<string, string> = {
  MULTIPLE_CHOICE: "Opción múltiple",
  TRUE_FALSE: "Verdadero / Falso",
  ORDER_STEPS: "Ordenar pasos",
  ERROR_DETECTION: "Detectar error",
};

export default function ActivitiesContent() {
  const { stepByStepMode, simplifiedLanguage, learningPace } = useAccessibility();
  const effectiveStepByStep = stepByStepMode || learningPace === "SLOW";
  const searchParams = useSearchParams();
  const moduleId = searchParams.get("moduleId");
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"question" | "answer">("question");
  const [errorStepIndex, setErrorStepIndex] = useState(0);

  const [activity, setActivity] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [order, setOrder] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [passed, setPassed] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const params = new URLSearchParams();
      if (moduleId) params.set("moduleId", moduleId);
      params.set("index", String(index));
      const res = await fetch(`/api/activities?${params}`);
      const data = await res.json();
      if (!res.ok) {
        setLoadError(data.error ?? "No se pudieron cargar las actividades");
        setActivity(null);
        return;
      }
      if (data.activity) {
        setActivity(data.activity);
        setOrder(
          data.activity.type === "ORDER_STEPS"
            ? (data.activity.steps ?? []).map((s: { id: string }) => s.id)
            : []
        );
        setSelected(null);
        setShowResult(false);
        setExplanation(null);
        setPhase("question");
        setErrorStepIndex(0);
        setPhase("question");
        setErrorStepIndex(0);
      } else {
        setActivity(null);
      }
    } catch {
      setActivity(null);
      setLoadError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }, [moduleId, index]);

  useEffect(() => {
    load();
  }, [load]);

  const progress = activity ? (activity.current / activity.total) * 100 : 0;

  async function submit(answers: { selectedId?: string; order?: string[] }) {
    if (!activity || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`/api/activities/${activity.id}/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });
      const data = await res.json();
      if (res.ok) {
        setPassed(!!data.passed);
        setExplanation(data.explanation ?? activity.explanation ?? null);
      } else {
        setSubmitError(data.error ?? "No se pudo enviar la respuesta");
        setExplanation(activity.explanation ?? null);
      }
    } catch {
      setSubmitError("Error de conexión. Intenta de nuevo.");
      setExplanation(activity.explanation ?? null);
    } finally {
      setSubmitting(false);
      setShowResult(true);
    }
  }

  function moveStep(stepId: string, dir: -1 | 1) {
    setOrder((prev) => {
      const i = prev.indexOf(stepId);
      if (i < 0) return prev;
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  if (loading) {
    return (
      <p className="text-sm text-brand-muted-gray flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando actividad…
      </p>
    );
  }

  if (!activity) {
    return (
      <div className="mx-auto max-w-lg text-center space-y-4 py-12">
        <h1 className="font-heading text-2xl font-bold">Actividades</h1>
        {loadError ? (
          <>
            <FeedbackBanner variant="error" message={loadError} />
            <Button onClick={() => load()}>Reintentar</Button>
          </>
        ) : (
          <>
            <p className="text-brand-muted-gray">
              No hay actividades disponibles. Sube un PDF en Documentos para
              generarlas con IA.
            </p>
            <Button asChild>
              <Link href="/dashboard/documents">Ir a documentos</Link>
            </Button>
          </>
        )}
      </div>
    );
  }

  const stepById = new Map(activity.steps?.map((s) => [s.id, s]));

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-8">
      <div className="text-center">
        <Badge className="mb-3">
          {typeLabels[activity.type] ?? activity.type}
        </Badge>
        <h1 className="font-heading text-3xl font-bold">Actividades</h1>
        <p className="mt-1 text-brand-muted-gray">{activity.moduleTitle}</p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">
            Actividad {activity.current} de {activity.total}
          </span>
          <span className="text-brand-muted-gray">{Math.round(progress)}%</span>
        </div>
        <ProgressBar value={progress} size="lg" />
      </div>

      {effectiveStepByStep && (
        <p className="rounded-xl border border-brand-cobalt/20 bg-brand-champagne/40 px-4 py-2 text-center text-sm text-brand-muted-gray">
          Modo paso a paso ALAE — lee la pregunta antes de responder
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-xl leading-snug">
            {activity.question}
          </CardTitle>
          {simplifiedLanguage && (
            <p className="text-sm text-brand-muted-gray">
              Elige la opción que mejor describa el procedimiento correcto.
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {(activity.type === "MULTIPLE_CHOICE" ||
            activity.type === "TRUE_FALSE") &&
            effectiveStepByStep &&
            phase === "question" && (
              <Button className="w-full" onClick={() => setPhase("answer")}>
                Paso 2: Ver opciones de respuesta
              </Button>
            )}

          {(activity.type === "MULTIPLE_CHOICE" ||
            activity.type === "TRUE_FALSE") &&
            (!effectiveStepByStep || phase === "answer") &&
            activity.options?.map((opt) => {
              const isSelected = selected === opt.id;
              const showCorrect = showResult && opt.correct;
              const showWrong = showResult && isSelected && !opt.correct;
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={showResult || submitting}
                  onClick={() => {
                    setSelected(opt.id);
                    void submit({ selectedId: opt.id });
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl border px-4 py-4 text-left text-sm transition-all",
                    !showResult &&
                      "hover:border-brand-cobalt/30 hover:bg-brand-champagne/30",
                    showCorrect && "border-emerald-500 bg-emerald-50",
                    showWrong && "border-red-400 bg-red-50",
                    isSelected &&
                      !showResult &&
                      "border-brand-cobalt bg-brand-champagne/50"
                  )}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-light-bg text-xs font-bold">
                    {opt.id.toUpperCase()}
                  </span>
                  {opt.text}
                  {showCorrect && (
                    <CheckCircle2 className="ml-auto h-5 w-5 text-emerald-600" />
                  )}
                  {showWrong && (
                    <XCircle className="ml-auto h-5 w-5 text-red-500" />
                  )}
                </button>
              );
            })}

          {activity.type === "ORDER_STEPS" && (
            <>
              {order.map((stepId, i) => {
                const step = stepById.get(stepId);
                if (!step) return null;
                return (
                  <div
                    key={stepId}
                    className="flex items-center gap-2 rounded-2xl border border-black/5 bg-brand-light-bg px-4 py-3"
                  >
                    <GripVertical className="h-4 w-4 text-brand-muted-gray" />
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-sm">{step.text}</span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        disabled={i === 0 || showResult}
                        onClick={() => moveStep(stepId, -1)}
                        className="rounded-lg p-1 hover:bg-white disabled:opacity-30"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        disabled={i === order.length - 1 || showResult}
                        onClick={() => moveStep(stepId, 1)}
                        className="rounded-lg p-1 hover:bg-white disabled:opacity-30"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {!showResult && (
                <Button
                  className="w-full"
                  disabled={submitting}
                  onClick={() => submit({ order })}
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Verificar orden
                </Button>
              )}
            </>
          )}

          {activity.type === "ERROR_DETECTION" && activity.steps && (
            <>
              {(effectiveStepByStep
                ? activity.steps.slice(errorStepIndex, errorStepIndex + 1)
                : activity.steps
              ).map((step) => {
                const isSelected = selected === step.id;
                const showCorrect = showResult && step.hasError;
                const showWrong = showResult && isSelected && !step.hasError;
                return (
                  <button
                    key={step.id}
                    type="button"
                    disabled={showResult || submitting}
                    onClick={() => {
                      setSelected(step.id);
                      void submit({ selectedId: step.id });
                    }}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-2xl border px-4 py-4 text-left text-sm",
                      showCorrect && "border-emerald-500 bg-emerald-50",
                      showWrong && "border-red-400 bg-red-50",
                      isSelected &&
                        !showResult &&
                        "border-brand-cobalt bg-brand-champagne/50"
                    )}
                  >
                    <span className="font-bold">{step.id.toUpperCase()}.</span>
                    {step.text}
                  </button>
                );
              })}
              {effectiveStepByStep &&
                !showResult &&
                errorStepIndex < (activity.steps?.length ?? 0) - 1 && (
                  <Button
                    variant="outline"
                    onClick={() => setErrorStepIndex((i) => i + 1)}
                  >
                    Siguiente paso ({errorStepIndex + 2}/
                    {activity.steps.length})
                  </Button>
                )}
            </>
          )}
        </CardContent>
      </Card>

      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Card
              className={cn(
                "border-2",
                passed
                  ? "border-emerald-200 bg-emerald-50/50"
                  : "border-amber-200 bg-amber-50/50"
              )}
            >
              <CardContent className="flex gap-4 pt-6">
                {passed ? (
                  <Trophy className="h-8 w-8 shrink-0 text-emerald-600" />
                ) : (
                  <Zap className="h-8 w-8 shrink-0 text-amber-600" />
                )}
                <div>
                  {submitError ? (
                    <>
                      <p className="font-heading font-bold text-red-700">
                        Error al enviar
                      </p>
                      <p className="mt-2 text-sm text-red-600" role="alert">
                        {submitError}
                      </p>
                      <Button
                        size="sm"
                        className="mt-4"
                        variant="outline"
                        onClick={() => {
                          setShowResult(false);
                          setSubmitError(null);
                        }}
                      >
                        Reintentar
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="font-heading font-bold">
                        {passed ? "¡Correcto!" : "Sigue practicando"}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-brand-muted-gray">
                        {explanation ?? activity.explanation}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {activity.current < activity.total && (
                          <Button size="sm" onClick={() => setIndex((i) => i + 1)}>
                            Siguiente actividad
                          </Button>
                        )}
                        {activity.moduleSlug && (
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/dashboard/modules/${activity.moduleSlug}`}>
                              Volver al módulo
                            </Link>
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-center gap-2 text-xs text-brand-muted-gray">
        <Bot className="h-4 w-4" />
        Feedback basado en el contenido de capacitación de tu empresa
      </div>
    </div>
  );
}
