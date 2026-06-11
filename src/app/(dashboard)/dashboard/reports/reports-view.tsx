import Link from "next/link";
import {
  BarChart3,
  Brain,
  Download,
  HeartHandshake,
  Lightbulb,
  TrendingUp,
  Users,
} from "lucide-react";
import { InclusionScoreCard } from "@/components/alae/inclusion-score-card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { getReportsOverview } from "@/lib/analytics/reports";

type ReportsViewProps = {
  data: NonNullable<Awaited<ReturnType<typeof getReportsOverview>>>;
};

export function ReportsView({ data }: ReportsViewProps) {
  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge className="mb-3">Vista ejecutiva</Badge>
          <h1 className="font-heading text-3xl font-bold">Reportes</h1>
          <p className="mt-1 text-brand-muted-gray">
            Métricas y hallazgos de tu organización
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/reports/learning-patterns">
              Patrones ALAE
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/reports/inclusion">Inclusión</Link>
          </Button>
          <Button variant="outline" asChild>
            <a href="/api/reports/export" download>
              <Download className="h-4 w-4" />
              Exportar CSV
            </a>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {data.metrics.map((m, i) => (
          <MetricCard
            key={m.label}
            title={m.label}
            value={m.value}
            change={m.change}
            trend="up"
            icon={[Users, TrendingUp, BarChart3, TrendingUp][i]}
            delayMs={i * 80}
          />
        ))}
      </div>

      {data.inclusion?.averageScore != null && (
        <Card className="border-brand-lavender/20">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <HeartHandshake className="h-5 w-5 text-brand-cobalt" />
              <CardTitle>Inclusión ALAE</CardTitle>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/reports/inclusion">Ver detalle</Link>
            </Button>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-6">
            <InclusionScoreCard
              score={data.inclusion.averageScore}
              label="Score promedio"
              size="lg"
            />
            <p className="text-sm text-brand-muted-gray">
              {data.inclusion.auditCount} contenidos auditados automáticamente
              al procesar PDFs y generar módulos.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-brand-lavender" />
              <CardTitle>Hallazgos inteligentes</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {(data.aiInsights ?? data.insights).map((insight, i) => (
              <div
                key={insight}
                className="flex gap-3 rounded-2xl border border-brand-lavender/10 bg-brand-champagne/30 px-4 py-4 animate-in fade-in slide-in-from-left-2 duration-300 fill-mode-both"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <span className="text-lg">📊</span>
                <p className="text-sm font-medium leading-relaxed">{insight}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-brand-cobalt" />
              <CardTitle>Recomendaciones</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recommendations.map((rec, i) => (
              <p
                key={rec}
                className="rounded-2xl bg-brand-light-bg px-4 py-3 text-sm leading-relaxed animate-in fade-in duration-300 fill-mode-both"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {rec}
              </p>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
