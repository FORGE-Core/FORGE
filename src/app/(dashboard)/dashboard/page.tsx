"use client";

import { motion } from "framer-motion";
import {
  Award,
  BookOpen,
  Clock,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { WelcomeHero } from "@/components/dashboard/welcome-hero";
import { AIRecommendations } from "@/components/dashboard/ai-recommendations";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ModuleCard } from "@/components/modules/module-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import {
  currentUser,
  dashboardKpis,
  recentActivity,
  trainingModules,
} from "@/data/mock-content";

const kpiIcons = {
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

export default function DashboardPage() {
  const featuredModules = trainingModules.filter((m) => m.status !== "completed").slice(0, 3);

  return (
    <div className="space-y-8 pb-8">
      <WelcomeHero />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {dashboardKpis.map((kpi, i) => {
          const Icon = kpiIcons[kpi.icon as keyof typeof kpiIcons] ?? BookOpen;
          return (
            <MetricCard
              key={kpi.title}
              title={kpi.title}
              value={kpi.value}
              change={kpi.change}
              trend={kpi.trend}
              icon={Icon}
              delay={i * 0.05}
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
                {currentUser.level}
              </div>
              <div>
                <p className="font-heading text-xl font-bold">
                  Nivel {currentUser.level} — {currentUser.levelTitle}
                </p>
                <p className="text-brand-muted-gray">
                  {currentUser.overallProgress}% completado
                </p>
              </div>
            </div>
            <ProgressBar value={currentUser.overallProgress} size="lg" />
            <div className="rounded-2xl border border-brand-cobalt/10 bg-brand-champagne/50 px-4 py-4">
              <p className="text-xs font-medium uppercase tracking-wide text-brand-cobalt">
                Próximo objetivo
              </p>
              <p className="mt-1 font-medium">Completar módulo de devoluciones</p>
              <Button size="sm" className="mt-3" variant="outline" asChild>
                <Link href="/dashboard/modules/manejo-devoluciones">Continuar</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <AIRecommendations />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Actividad reciente</CardTitle>
            <Badge variant="muted">Esta semana</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex gap-3 rounded-2xl bg-brand-light-bg px-4 py-3"
              >
                <span className="text-lg">{activityIcons[item.type]}</span>
                <div>
                  <p className="text-sm font-medium">{item.text}</p>
                  <p className="text-xs text-brand-muted-gray">{item.time}</p>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Continúa aprendiendo</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/modules">Ver todos</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {featuredModules.map((m) => (
              <Link
                key={m.slug}
                href={`/dashboard/modules/${m.slug}`}
                className="flex items-center gap-4 rounded-2xl border border-black/5 p-3 transition-colors hover:bg-brand-light-bg"
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${m.gradient} text-white`}
                >
                  <Award className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-sm">{m.title}</p>
                  <ProgressBar value={m.progress} size="sm" className="mt-2" />
                </div>
                <span className="text-sm font-semibold text-brand-cobalt">
                  {m.progress}%
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold">Módulos destacados</h2>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/modules">Explorar catálogo</Link>
          </Button>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {trainingModules.slice(0, 3).map((m, i) => (
            <ModuleCard key={m.slug} module={m} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
