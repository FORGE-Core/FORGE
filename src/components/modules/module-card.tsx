import { Clock, Play } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
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

  return (
    <div
      className="animate-in fade-in slide-in-from-bottom-3 duration-300 fill-mode-both"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <Link
        href={`/dashboard/modules/${module.slug}`}
        className="group block overflow-hidden rounded-[24px] border border-black/5 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
      >
        <div
          className={cn(
            "relative flex h-36 items-end bg-gradient-to-br p-5",
            module.gradient
          )}
        >
          <Badge className="absolute right-4 top-4 border-white/20 bg-white/15 text-white backdrop-blur-sm">
            {statusLabel}
          </Badge>
          <div className="text-white">
            <p className="text-xs font-medium uppercase tracking-wide text-white/70">
              {module.category}
            </p>
            <h3 className="font-heading text-lg font-bold leading-tight">
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
          <ProgressBar value={module.progress} />
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-brand-cobalt">
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
