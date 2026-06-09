"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Brain,
  Download,
  Lightbulb,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ReportsData = {
  metrics: { label: string; value: string; change: string }[];
  insights: string[];
  aiInsights?: string[];
  recommendations: string[];
};

export default function ReportsPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<ReportsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reports/overview");
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Sin acceso a reportes");
        setData(null);
        return;
      }
      setData(json);
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const role = session?.user?.role;
  const canView = role === "ADMIN" || role === "SUPERVISOR";

  if (!canView && !loading) {
    return (
      <div className="space-y-4">
        <h1 className="font-heading text-3xl font-bold">Reportes</h1>
        <p className="text-brand-muted-gray">
          Los reportes están disponibles para administradores y supervisores.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <p className="text-sm text-brand-muted-gray">Cargando reportes…</p>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <h1 className="font-heading text-3xl font-bold">Reportes</h1>
        <p className="text-sm text-red-600">{error ?? "Sin datos"}</p>
      </div>
    );
  }

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
        <Button variant="outline" asChild>
          <a href="/api/reports/export" download>
            <Download className="h-4 w-4" />
            Exportar CSV
          </a>
        </Button>
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
            delay={i * 0.08}
          />
        ))}
      </div>

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
              <Lightbulb className="h-5 w-5 text-brand-cobalt" />
              <CardTitle>Recomendaciones</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recommendations.map((rec, i) => (
              <motion.p
                key={rec}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl bg-brand-light-bg px-4 py-3 text-sm leading-relaxed"
              >
                {rec}
              </motion.p>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
