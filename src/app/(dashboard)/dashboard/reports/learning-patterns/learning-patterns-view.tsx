import Link from "next/link";
import { ArrowLeft, Brain, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { getLearningPatternReport } from "@/lib/alae/learning-analytics";

const MODALITY_LABELS: Record<string, string> = {
  READING: "Lectura",
  LISTENING: "Escucha",
  VISUAL: "Visual",
  PRACTICE: "Práctica",
};

type LearningPatternsViewProps = {
  report: Awaited<ReturnType<typeof getLearningPatternReport>>;
};

export function LearningPatternsView({ report }: LearningPatternsViewProps) {
  return (
    <div className="space-y-8 pb-8">
      <Link
        href="/dashboard/reports"
        className="inline-flex items-center gap-2 text-sm text-brand-muted-gray hover:text-brand-cobalt"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a reportes
      </Link>

      <div className="flex items-center gap-3">
        <Brain className="h-8 w-8 text-brand-lavender" aria-hidden />
        <div>
          <h1 className="font-heading text-2xl font-bold">
            Patrones de aprendizaje
          </h1>
          <p className="text-sm text-brand-muted-gray">
            Analítica ALAE basada en reglas — últimos 30 días
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-brand-muted-gray">
              Modalidad dominante
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-2xl font-bold">
              {MODALITY_LABELS[report.dominantModality] ??
                report.dominantModality}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-brand-muted-gray">
              Aprobación quizzes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-2xl font-bold">{report.passRate}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-brand-muted-gray">
              Hora pico ALAE
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-2xl font-bold">
              {report.peakHour}:00
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-brand-muted-gray">
              Perfiles activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-2xl font-bold">
              {report.userCount}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Uso por modalidad</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(report.modalityTotals).map(([k, v]) => (
              <div
                key={k}
                className="flex justify-between rounded-xl bg-brand-light-bg px-4 py-2 text-sm"
              >
                <span>{MODALITY_LABELS[k] ?? k}</span>
                <strong>{v} usuarios</strong>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nivel de soporte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(report.supportCounts).map(([k, v]) => (
              <div
                key={k}
                className="flex justify-between rounded-xl bg-brand-light-bg px-4 py-2 text-sm"
              >
                <span>{k}</span>
                <strong>{v}</strong>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {report.predictions?.length > 0 && (
        <Card className="border-brand-lavender/25">
          <CardHeader>
            <CardTitle className="text-base">Predicciones (reglas ALAE)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {report.predictions.map((p) => (
              <Link
                key={p.label}
                href={p.href}
                className="flex items-start justify-between gap-4 rounded-xl border px-4 py-3 transition-colors hover:bg-brand-light-bg"
              >
                <div>
                  <p className="text-sm font-medium">{p.label}</p>
                  <p className="mt-1 text-xs text-brand-muted-gray">{p.action}</p>
                </div>
                <Badge variant="muted">{p.confidence}%</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Insights ALAE</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {report.insights.map((insight) => (
            <p
              key={insight}
              className="rounded-xl border border-brand-lavender/20 bg-brand-champagne/30 px-4 py-3 text-sm"
            >
              {insight}
            </p>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <CardTitle className="text-base">Aprendices más activos</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {report.topLearners.length === 0 ? (
            <p className="text-sm text-brand-muted-gray">Sin actividad aún.</p>
          ) : (
            report.topLearners.map((l) => (
              <div
                key={l.name}
                className="flex justify-between rounded-xl border px-4 py-2 text-sm"
              >
                <span>{l.name}</span>
                <span className="text-brand-muted-gray">
                  {MODALITY_LABELS[l.modality] ?? l.modality} · {l.total} usos
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
