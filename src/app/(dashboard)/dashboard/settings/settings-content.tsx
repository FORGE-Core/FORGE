"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { AutomationsManager } from "@/components/settings/automations-manager";
import { FeedbackBanner } from "@/components/shared/feedback-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OrganizationSettingsData } from "@/lib/organization/settings";
import { organizationClient } from "@/services/client";
import { ApiClientError } from "@/services/client/http";
import { useTenantPermissions } from "@/providers/tenant-provider";

type SettingsContentProps = {
  initialOrg: OrganizationSettingsData;
};

export function SettingsContent({ initialOrg }: SettingsContentProps) {
  const { isAdmin } = useTenantPermissions();
  const [org, setOrg] = useState(initialOrg);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [name, setName] = useState(initialOrg.name);
  const [notifications, setNotifications] = useState(initialOrg.notifications);
  const [inclusionMinScore, setInclusionMinScore] = useState(
    initialOrg.inclusionMinScore
  );

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!isAdmin) return;
    setSaving(true);
    setSaveMessage(null);
    try {
      const data = await organizationClient.update({
        name,
        notifications,
        alae: { minAcceptableScore: inclusionMinScore },
      });
      setSaveMessage({
        type: "success",
        text: "Cambios guardados correctamente",
      });
      if (data.organization) {
        const orgData = data.organization as {
          name?: string;
          plan?: string;
          industry?: string;
          stats?: OrganizationSettingsData["stats"];
        };
        setOrg({
          name: orgData.name ?? name,
          plan: orgData.plan ?? org.plan,
          industry: orgData.industry ?? org.industry,
          stats: orgData.stats ?? org.stats,
          notifications,
          inclusionMinScore,
        });
      }
    } catch (err) {
      setSaveMessage({
        type: "error",
        text:
          err instanceof ApiClientError
            ? err.message
            : "Error de conexión al guardar",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="font-heading text-3xl font-bold">Ajustes</h1>
        <p className="mt-1 text-brand-muted-gray">
          Configuración de tu organización y preferencias
        </p>
      </div>

      {saveMessage && (
        <FeedbackBanner
          variant={saveMessage.type === "success" ? "success" : "error"}
          message={saveMessage.text}
        />
      )}

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
                <span className="font-medium">{org.name}</span>
              </div>
            )}
            <div className="flex justify-between rounded-2xl bg-brand-light-bg px-4 py-3">
              <span className="text-brand-muted-gray">Plan</span>
              <span className="font-medium capitalize">{org.plan}</span>
            </div>
            <div className="flex justify-between rounded-2xl bg-brand-light-bg px-4 py-3">
              <span className="text-brand-muted-gray">Usuarios activos</span>
              <span className="font-medium">{org.stats.activeUsers}</span>
            </div>
            <div className="flex justify-between rounded-2xl bg-brand-light-bg px-4 py-3">
              <span className="text-brand-muted-gray">Módulos publicados</span>
              <span className="font-medium">{org.stats.moduleCount}</span>
            </div>
            <div className="flex justify-between rounded-2xl bg-brand-light-bg px-4 py-3">
              <span className="text-brand-muted-gray">Documentos</span>
              <span className="font-medium">{org.stats.documentCount}</span>
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
            <p className="text-xs text-brand-muted-gray">
              Los recordatorios de módulos y alertas de actividades se envían
              vía notificaciones push cuando están activas en tu perfil. El
              resumen semanal se enviará por push cuando haya actividad
              significativa en la semana.
            </p>
          </CardContent>
        </Card>

        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Política de inclusión (ALAE)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <label htmlFor="inclusion-min" className="block">
                Umbral mínimo de Inclusion Score:{" "}
                <strong>{inclusionMinScore}%</strong>
              </label>
              <input
                id="inclusion-min"
                type="range"
                min={40}
                max={90}
                step={5}
                value={inclusionMinScore}
                onChange={(e) =>
                  setInclusionMinScore(Number(e.target.value))
                }
                className="w-full accent-brand-cobalt"
              />
              <p className="text-xs text-brand-muted-gray">
                Los documentos por debajo de este umbral aparecerán como alerta
                en el dashboard de inclusión.
              </p>
            </CardContent>
          </Card>
        )}

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
    </div>
  );
}
