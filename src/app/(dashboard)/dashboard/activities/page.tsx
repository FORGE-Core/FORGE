"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, CheckCircle2, Trophy, XCircle, Zap } from "lucide-react";
import Link from "next/link";
import { quizQuestion } from "@/data/mock-content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";

export default function ActivitiesPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const correct = quizQuestion.options.find((o) => o.correct);
  const isCorrect = selected === correct?.id;
  const progress = (quizQuestion.current / quizQuestion.total) * 100;

  function handleSelect(id: string) {
    if (showResult) return;
    setSelected(id);
    setShowResult(true);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-8">
      <div className="text-center">
        <Badge className="mb-3">Quiz interactivo</Badge>
        <h1 className="font-heading text-3xl font-bold">Actividades</h1>
        <p className="mt-1 text-brand-muted-gray">
          Aprende jugando — estilo Duolingo para operaciones
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">
            Pregunta {quizQuestion.current} de {quizQuestion.total}
          </span>
          <span className="text-brand-muted-gray">{Math.round(progress)}%</span>
        </div>
        <ProgressBar value={progress} size="lg" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl leading-snug">{quizQuestion.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {quizQuestion.options.map((opt) => {
            const isSelected = selected === opt.id;
            const showCorrect = showResult && opt.correct;
            const showWrong = showResult && isSelected && !opt.correct;

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelect(opt.id)}
                disabled={showResult}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl border px-4 py-4 text-left text-sm transition-all",
                  !showResult && "hover:border-brand-cobalt/30 hover:bg-brand-champagne/30",
                  showCorrect && "border-emerald-300 bg-emerald-50",
                  showWrong && "border-red-300 bg-red-50",
                  isSelected && !showResult && "border-brand-cobalt bg-brand-champagne/50"
                )}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-light-bg font-semibold uppercase">
                  {opt.id}
                </span>
                {opt.text}
              </button>
            );
          })}
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
                isCorrect ? "border-emerald-200 bg-emerald-50/50" : "border-amber-200 bg-amber-50/50"
              )}
            >
              <CardContent className="flex gap-4 pt-6">
                {isCorrect ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white"
                  >
                    <CheckCircle2 className="h-6 w-6" />
                  </motion.div>
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white">
                    <XCircle className="h-6 w-6" />
                  </div>
                )}
                <div className="space-y-3">
                  <p className="font-heading font-bold">
                    {isCorrect ? "¡Excelente! 🎉" : "Casi — repasemos esto"}
                  </p>
                  <p className="text-sm leading-relaxed text-brand-muted-gray">
                    {quizQuestion.explanation}
                  </p>
                  {!isCorrect && (
                    <p className="text-sm text-amber-800">
                      Por qué fue incorrecta: la opción elegida omite la verificación en
                      sistema, paso obligatorio según el manual operativo.
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {!isCorrect && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/dashboard/chat">
                          <Bot className="h-4 w-4" />
                          Pedir explicación a la IA
                        </Link>
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelected(null);
                        setShowResult(false);
                      }}
                    >
                      Siguiente pregunta
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-3 gap-4 text-center">
        {[
          { icon: Zap, label: "Racha", value: "5 días" },
          { icon: Trophy, label: "Puntos", value: "1,240" },
          { icon: CheckCircle2, label: "Aciertos", value: "87%" },
        ].map((stat) => (
          <Card key={stat.label} className="p-4">
            <stat.icon className="mx-auto h-5 w-5 text-brand-cobalt" />
            <p className="mt-2 font-heading text-lg font-bold">{stat.value}</p>
            <p className="text-xs text-brand-muted-gray">{stat.label}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
