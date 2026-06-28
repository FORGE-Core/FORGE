import Link from "next/link";
import { ArrowLeft, HeartHandshake } from "lucide-react";
import { InclusionBulkAuditButton } from "./inclusion-bulk-audit-button";
import { InclusionIssuesList } from "@/components/alae/inclusion-issues-list";
import { InclusionScoreCard } from "@/components/alae/inclusion-score-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EnrichedInclusionReport } from "@/types/reports";

type InclusionReportViewProps = {
  report: EnrichedInclusionReport;
  embedded?: boolean;
};

export function InclusionReportView({ report, embedded }: InclusionReportViewProps) {
  const sampleIssues = report.lowest.flatMap((item) =>
    item.issues.map((message) => ({
      code: item.targetId,
      severity: "medium" as const,
      message: `${item.title}: ${message}`,
    }))
  );

  return (
    <div className="space-y-8 pb-8">
      {!embedded && (
      <Link
        href="/reports"
        className="inline-flex items-center gap-2 text-sm text-brand-muted-gray hover:text-brand-cobalt"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a reportes
      </Link>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <HeartHandshake className="h-8 w-8 text-brand-cobalt" aria-hidden />
          <div>
            <h1 className="font-heading text-2xl font-bold">
              Dashboard de inclusión
            </h1>
            <p className="text-sm text-brand-muted-gray">
              ALAE analiza claridad, estructura y accesibilidad del contenido.
            </p>
          </div>
        </div>
        <InclusionBulkAuditButton />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <InclusionScoreCard
          score={report.averageScore}
          label="Inclusion Score promedio"
          size="lg"
        />
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-brand-muted-gray">
              Contenidos auditados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-3xl font-bold">
              {report.auditCount}
            </p>
          </CardContent>
        </Card>
        {report.belowThreshold != null && report.belowThreshold > 0 && (
          <Card className="border-amber-200 bg-amber-50/50">
            <CardHeader>
              <CardTitle className="text-sm text-amber-800">
                Bajo umbral ({report.policy?.minAcceptableScore ?? 60}%)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-3xl font-bold text-amber-700">
                {report.belowThreshold}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contenido más complejo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {report.lowest.length === 0 ? (
            <p className="text-sm text-brand-muted-gray">
              Aún no hay auditorías. Sube PDFs para generar Inclusion Score.
            </p>
          ) : (
            report.lowest.map((item) => (
              <div
                key={`${item.targetType}-${item.targetId}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border px-4 py-3"
              >
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-brand-muted-gray">
                    {item.targetType}
                  </p>
                </div>
                <InclusionScoreCard score={item.score} size="sm" />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {report.complexModules && report.complexModules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Módulos más complejos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {report.complexModules.map((mod) => (
              <div
                key={mod.targetId}
                className="rounded-xl border border-amber-200/60 bg-amber-50/40 px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{mod.title}</p>
                  <InclusionScoreCard score={mod.score} size="sm" />
                </div>
                {mod.issues.length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs text-brand-muted-gray">
                    {mod.issues.map((issue) => (
                      <li key={issue}>• {issue}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recomendaciones IA</CardTitle>
        </CardHeader>
        <CardContent>
          <InclusionIssuesList
            issues={sampleIssues.slice(0, 6)}
            recommendations={report.recommendations}
          />
        </CardContent>
      </Card>
    </div>
  );
}
