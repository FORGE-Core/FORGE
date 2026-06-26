import { AlertTriangle, Lightbulb } from "lucide-react";

type Issue = { code: string; severity: string; message: string };

export function InclusionIssuesList({
  issues,
  recommendations,
}: {
  issues: Issue[];
  recommendations: string[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section aria-labelledby="inclusion-issues-heading">
        <h3
          id="inclusion-issues-heading"
          className="mb-2 flex items-center gap-2 text-sm font-semibold"
        >
          <AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden />
          Problemas detectados
        </h3>
        {issues.length === 0 ? (
          <p className="text-sm text-brand-muted-gray">
            Sin problemas críticos detectados.
          </p>
        ) : (
          <ul className="space-y-2">
            {issues.map((issue) => (
              <li
                key={issue.code}
                className="rounded-lg border bg-white/70 px-3 py-2 text-sm"
              >
                {issue.message}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="inclusion-recs-heading">
        <h3
          id="inclusion-recs-heading"
          className="mb-2 flex items-center gap-2 text-sm font-semibold"
        >
          <Lightbulb className="h-4 w-4 text-brand-cobalt" aria-hidden />
          Recomendaciones
        </h3>
        <ul className="space-y-2">
          {recommendations.map((rec) => (
            <li
              key={rec}
              className="rounded-lg border border-brand-cobalt/20 bg-brand-cobalt/5 px-3 py-2 text-sm"
            >
              {rec}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
