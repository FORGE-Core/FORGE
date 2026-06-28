"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { getLearningPatternReport } from "@/lib/alae/learning-analytics";
import type { getReportsOverview } from "@/services/server/reports/reports.service";
import type { EnrichedInclusionReport } from "@/types/reports";
import { InclusionReportView } from "./inclusion-report-view";
import { LearningPatternsView } from "./learning-patterns-view";
import { ReportsView } from "./reports-view";

const TABS = [
  { id: "overview", label: "Resumen" },
  { id: "inclusion", label: "Inclusión" },
  { id: "patterns", label: "Patrones" },
] as const;

type TabId = (typeof TABS)[number]["id"];

type ReportsHubProps = {
  overview: NonNullable<Awaited<ReturnType<typeof getReportsOverview>>>;
  inclusion: EnrichedInclusionReport;
  patterns: Awaited<ReturnType<typeof getLearningPatternReport>>;
  initialTab: TabId;
};

export function ReportsHub({
  overview,
  inclusion,
  patterns,
  initialTab,
}: ReportsHubProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = (searchParams.get("tab") as TabId | null) ?? initialTab;

  function setTab(id: TabId) {
    const params = new URLSearchParams(searchParams.toString());
    if (id === "overview") params.delete("tab");
    else params.set("tab", id);
    const qs = params.toString();
    router.replace(qs ? `/reports?${qs}` : "/reports", { scroll: false });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2 rounded-2xl border border-black/5 bg-brand-light-bg p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "rounded-xl px-4 py-2 text-sm font-medium transition-colors",
                tab === t.id
                  ? "bg-white text-brand-cobalt shadow-sm"
                  : "text-brand-muted-gray hover:text-brand-cobalt"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        {tab === "overview" && (
          <Button variant="outline" asChild>
            <a href="/api/reports/export" download>
              <Download className="h-4 w-4" />
              Exportar CSV
            </a>
          </Button>
        )}
      </div>

      {tab === "overview" && <ReportsView data={overview} embedded />}
      {tab === "inclusion" && <InclusionReportView report={inclusion} embedded />}
      {tab === "patterns" && <LearningPatternsView report={patterns} embedded />}
    </div>
  );
}
