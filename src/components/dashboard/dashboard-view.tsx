import {
  Award,
  BookOpen,
  Clock,
  Sparkles,
  Target,
  Zap,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { AlaeDashboardCard } from "@/components/alae/alae-dashboard-card";
import { AIRecommendations } from "@/components/dashboard/ai-recommendations";
import { MetricCard } from "@/components/dashboard/metric-card";
import { WelcomeHero } from "@/components/dashboard/welcome-hero";
import { ModuleCard, type ModuleCardData } from "@/components/modules/module-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { getDashboardData } from "@/services/server/dashboard/dashboard.service";
import { getActivityRowClass, getModuleStatusClasses } from "@/lib/training/module-status-styles";
import { cn } from "@/lib/utils";

const kpiIcons: Record<string, LucideIcon> = {
  book: BookOpen,
  clock: Clock,
  time: Clock,
  zap: Zap,
  target: Target,
  sparkles: Sparkles,
};

const activityIcons: Record<string, string> = {
  complete: "✅",
  quiz: "📝",
  ai: "🤖",
  sim: "🎮",
};

type DashboardViewProps = {
  data: Awaited<ReturnType<typeof getDashboardData>>;
};

export function DashboardView({ data }: DashboardViewProps) {
  return (
    <div className="space-y-8 pb-8">
      <WelcomeHero
        name={data.user.name}
        pendingCount={data.user.pendingCount}
        overallProgress={data.user.overallProgress}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {data.kpis.map((kpi, i) => {
          const Icon = kpiIcons[kpi.icon] ?? BookOpen;
          return (
            <MetricCard
              key={kpi.title}
              title={kpi.title}
              value={kpi.value}
              change={kpi.change}
              trend={kpi.trend}
              icon={Icon}
              delayMs={i * 50}
            />
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Progreso general</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-brand text-2xl font-bold text-white">
                {data.user.level}
              </div>
              <div>
                <p className="font-heading text-xl font-bold">
                  Nivel {data.user.level} — {data.user.levelTitle}
                </p>
                <p className="text-brand-muted-gray">
                  {data.user.overallProgress}% completado
                </p>
              </div>
            </div>
            <ProgressBar value={data.user.overallProgress} size="lg" />
            {data.nextModule && (
              <div className="rounded-2xl border border-brand-cobalt/10 bg-brand-champagne/50 px-4 py-4">
                <p className="text-xs font-medium uppercase tracking-wide text-brand-cobalt">
                  Próximo objetivo
                </p>
                <p className="mt-1 font-medium">
                  Completar módulo: {data.nextModule.title}
                </p>
                <Button size="sm" className="mt-3" variant="outline" asChild>
                  <Link href={`/modules/${data.nextModule.slug}`}>
                    Continuar
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {data.alae && <AlaeDashboardCard alae={data.alae} />}
          <AIRecommendations items={data.recommendations} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Actividad reciente</CardTitle>
            <Badge variant="muted">Reciente</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentActivity.length === 0 ? (
              <p className="text-sm text-brand-muted-gray">
                Aún no hay actividad. Explora un módulo o pregunta al mentor IA.
              </p>
            ) : (
              data.recentActivity.map((item, i) => (
                <div
                  key={item.id}
                  className={cn(
                    "animate-in fade-in slide-in-from-left-2 duration-300 fill-mode-both",
                    getActivityRowClass(item.type)
                  )}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <span className="text-lg">
                    {activityIcons[item.type] ?? "📌"}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{item.text}</p>
                    <p className="text-xs text-brand-muted-gray">{item.time}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Continúa aprendiendo</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/modules">Ver todos</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.featuredModules.map((m: ModuleCardData) => {
              const classes = getModuleStatusClasses(m.status);
              return (
                <Link
                  key={m.slug}
                  href={`/modules/${m.slug}`}
                  className={classes.row}
                >
                  <div className={classes.icon}>
                    <Award className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{m.title}</p>
                    <div
                      className={cn(
                        "module-card__progress mt-2 h-1.5 w-full overflow-hidden rounded-full bg-brand-light-bg",
                        classes.progress
                      )}
                    >
                      <div
                        className="module-card__progress-fill h-full rounded-full"
                        style={{ width: `${m.progress}%` }}
                      />
                    </div>
                  </div>
                  <span className={cn("text-sm font-semibold", classes.progressText)}>
                    {m.progress}%
                  </span>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold">Módulos destacados</h2>
          <Button variant="outline" size="sm" asChild>
            <Link href="/modules">Explorar catálogo</Link>
          </Button>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {data.highlightModules.map((m, i) => (
            <ModuleCard key={m.slug} module={m} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
