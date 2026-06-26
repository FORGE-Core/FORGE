import { Clock, Play } from "lucide-react";
import Link from "next/link";
import { getModuleStatusClasses } from "@/lib/training/module-status-styles";
import { cn } from "@/lib/utils";

export interface ModuleCardData {
  slug: string;
  title: string;
  category: string;
  level: string;
  duration: string;
  status: "pending" | "in_progress" | "completed";
  progress: number;
  gradient: string;
  inclusionScore?: number | null;
}

function ModuleProgressBar({
  value,
  status,
}: {
  value: number;
  status: ModuleCardData["status"];
}) {
  const classes = getModuleStatusClasses(status);
  const pct = Math.min(100, Math.max(0, value));

  return (
    <div
      className={cn(
        "module-card__progress h-2.5 w-full overflow-hidden rounded-full bg-brand-light-bg",
        classes.progress
      )}
    >
      <div
        className="module-card__progress-fill h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function ModuleCard({
  module,
  index = 0,
}: {
  module: ModuleCardData;
  index?: number;
}) {
  const statusLabel =
    module.status === "completed"
      ? "Completado"
      : module.status === "in_progress"
        ? "En progreso"
        : "Pendiente";

  const classes = getModuleStatusClasses(module.status);

  return (
    <div
      className="animate-in fade-in slide-in-from-bottom-3 duration-300 fill-mode-both"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <Link
        href={`/modules/${module.slug}`}
        className={cn(
          "group block shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg",
          classes.card
        )}
      >
        <div className={classes.header}>
          <span className={classes.badge}>{statusLabel}</span>
          <div>
            <p
              className={cn(
                "text-xs font-medium uppercase tracking-wide",
                module.status === "pending"
                  ? "text-[#5c4a1a]/70"
                  : "text-white/70"
              )}
            >
              {module.category}
            </p>
            <h3
              className={cn(
                "font-heading text-lg font-bold leading-tight",
                module.status === "pending" && "text-[#5c4a1a]"
              )}
            >
              {module.title}
            </h3>
          </div>
        </div>
        <div className="space-y-3 p-5">
          <div className="flex items-center justify-between text-xs text-brand-muted-gray">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {module.duration}
            </span>
            <span>{module.level}</span>
          </div>
          <ModuleProgressBar value={module.progress} status={module.status} />
          <div className="flex items-center justify-between">
            <span className={cn("text-sm font-semibold", classes.progressText)}>
              {module.progress}%
            </span>
            <span className="flex items-center gap-1 text-xs font-medium text-brand-muted-gray transition-colors group-hover:text-brand-cobalt">
              <Play className="h-3.5 w-3.5" />
              Continuar
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
