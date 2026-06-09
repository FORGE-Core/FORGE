"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2, Settings } from "lucide-react";
import { AutomationsManager } from "@/components/settings/automations-manager";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type OrgData = {
  name: string;
  plan: string;
  industry: string | null;
  stats: {
    activeUsers: number;
    moduleCount: number;
    documentCount: number;
  };
};

export default function SettingsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const [org, setOrg] = useState<OrgData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [notifications, setNotifications] = useState({
    moduleReminders: true,
    weeklySummary: true,
    simulationAlerts: true,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/organization");
      const data = await res.json();
      if (res.ok && data.organization) {
        setOrg({
          name: data.organization.name,
          plan: data.organization.plan ?? "starter",
          industry: data.organization.industry,
          stats: data.organization.stats,
        });
        setName(data.organization.name);
        const n = data.organization.settings?.notifications;
        if (n) {
          setNotifications({
            moduleReminders: n.moduleReminders ?? true,
            weeklySummary: n.weeklySummary ?? true,
            simulationAlerts: n.simulationAlerts ?? true,
          });
        }
      }
    } catch {
      setOrg(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!isAdmin) return;
    setSaving(true);
    try {
      const res = await fetch("/api/organization", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, notifications }),
      });
      if (res.ok) await load();
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <p className="flex items-center gap-2 text-sm text-brand-muted-gray">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando ajustes…
      </p>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="font-heading text-3xl font-bold">Ajustes</h1>
        <p className="mt-1 text-brand-muted-gray">
          Configuración de tu organización y preferencias
        </p>
      </div>

      <form onSubmit={handleSave} className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Organización</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {isAdmin ? (
              <label className="block space-y-1">
                <span className="text-brand-muted-gray">Nombre de la empresa</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl border border-black/10 bg-brand-light-bg px-4 py-3 outline-none focus:ring-2 focus:ring-brand-cobalt/30"
                />
              </label>
            ) : (
              <div className="flex justify-between rounded-2xl bg-brand-light-bg px-4 py-3">
                <span className="text-brand-muted-gray">Empresa</span>
                <span className="font-medium">{org?.name ?? "—"}</span>
              </div>
            )}
            <div className="flex justify-between rounded-2xl bg-brand-light-bg px-4 py-3">
              <span className="text-brand-muted-gray">Plan</span>
              <span className="font-medium capitalize">{org?.plan ?? "starter"}</span>
            </div>
            <div className="flex justify-between rounded-2xl bg-brand-light-bg px-4 py-3">
              <span className="text-brand-muted-gray">Usuarios activos</span>
              <span className="font-medium">{org?.stats.activeUsers ?? 0}</span>
            </div>
            <div className="flex justify-between rounded-2xl bg-brand-light-bg px-4 py-3">
              <span className="text-brand-muted-gray">Módulos publicados</span>
              <span className="font-medium">{org?.stats.moduleCount ?? 0}</span>
            </div>
            <div className="flex justify-between rounded-2xl bg-brand-light-bg px-4 py-3">
              <span className="text-brand-muted-gray">Documentos</span>
              <span className="font-medium">{org?.stats.documentCount ?? 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notificaciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[
              {
                key: "moduleReminders" as const,
                label: "Recordatorios de módulos pendientes",
              },
              {
                key: "weeklySummary" as const,
                label: "Resumen semanal de progreso",
              },
              {
                key: "simulationAlerts" as const,
                label: "Alertas de simulaciones",
              },
            ].map((n) => (
              <label
                key={n.key}
                className="flex cursor-pointer items-center justify-between rounded-2xl bg-brand-light-bg px-4 py-3"
              >
                <span>{n.label}</span>
                <input
                  type="checkbox"
                  checked={notifications[n.key]}
                  disabled={!isAdmin}
                  onChange={(e) =>
                    setNotifications((prev) => ({
                      ...prev,
                      [n.key]: e.target.checked,
                    }))
                  }
                  className="accent-brand-cobalt"
                />
              </label>
            ))}
          </CardContent>
        </Card>

        {isAdmin && (
          <div className="lg:col-span-2">
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Guardar cambios
            </Button>
          </div>
        )}
      </form>

      {isAdmin && <AutomationsManager />}

      <EmptyState
        icon={Settings}
        title="Integraciones"
        description="Configura N8N_WEBHOOK_URL en tu entorno para automatizar eventos de aprendizaje (módulos completados, actividades fallidas, documentos procesados)."
        actionLabel="Configurar onboarding"
        actionHref="/dashboard/onboarding"
      />
    </div>
  );
}
