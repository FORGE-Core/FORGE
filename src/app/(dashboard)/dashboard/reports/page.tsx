"use client";

import { motion } from "framer-motion";
import { BarChart3, Brain, Lightbulb, TrendingUp, Users } from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  reportInsights,
  reportMetrics,
  reportRecommendations,
} from "@/data/mock-content";

export default function ReportsPage() {
  return (
    <div className="space-y-8 pb-8">
      <div>
        <Badge className="mb-3">Vista ejecutiva</Badge>
        <h1 className="font-heading text-3xl font-bold">Reportes</h1>
        <p className="mt-1 text-brand-muted-gray">
          Métricas, hallazgos y recomendaciones impulsadas por IA
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {reportMetrics.map((m, i) => (
          <MetricCard
            key={m.label}
            title={m.label}
            value={m.value}
            change={m.change}
            trend="up"
            icon={[Users, TrendingUp, BarChart3, TrendingUp][i]}
            delay={i * 0.08}
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-brand-lavender" />
              <CardTitle>Hallazgos Inteligentes</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {reportInsights.map((insight, i) => (
              <motion.div
                key={insight}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-3 rounded-2xl border border-brand-lavender/10 bg-brand-champagne/30 px-4 py-4"
              >
                <span className="text-lg">📊</span>
                <p className="text-sm font-medium leading-relaxed">{insight}</p>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              <CardTitle>Recomendaciones</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {reportRecommendations.map((rec, i) => (
              <div
                key={rec}
                className="flex gap-3 rounded-2xl bg-brand-light-bg px-4 py-3 text-sm"
              >
                <span className="font-bold text-brand-cobalt">{i + 1}.</span>
                {rec}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Progreso por área (últimos 30 días)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            {[
              { area: "Devoluciones", pct: 53, color: "bg-amber-500" },
              { area: "Inventario", pct: 67, color: "bg-emerald-500" },
              { area: "Despacho", pct: 78, color: "bg-brand-cobalt" },
              { area: "Envíos", pct: 91, color: "bg-brand-lavender" },
            ].map((bar) => (
              <div key={bar.area}>
                <div className="mb-2 flex justify-between text-sm">
                  <span>{bar.area}</span>
                  <span className="font-semibold">{bar.pct}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-brand-light-bg">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${bar.pct}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className={`h-full rounded-full ${bar.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
