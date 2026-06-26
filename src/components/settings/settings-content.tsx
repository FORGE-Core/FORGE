"use client";

import { useState } from "react";
import {
  Bell,
  BookOpen,
  Building2,
  FileText,
  Loader2,
  Save,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import { FeedbackBanner } from "@/components/shared/feedback-banner";
import { Button } from "@/components/ui/button";
import type { OrganizationSettingsData } from "@/lib/organization/settings";
import { organizationClient } from "@/services/client";
import { ApiClientError } from "@/services/client/http";
import { useTenantPermissions } from "@/providers/tenant-provider";

type SettingsContentProps = {
  initialOrg: OrganizationSettingsData;
};

const INDUSTRIES = [
  "Tecnología",
  "Retail",
  "Salud",
  "Educación",
  "Manufactura",
  "Logística",
  "Finanzas",
  "Alimentos",
  "Construcción",
  "Otro",
];

const PLAN_LABELS: Record<string, { label: string; color: string }> = {
  starter: { label: "Starter",     color: "bg-slate-100 text-slate-600" },
  pro:     { label: "Pro",         color: "bg-brand-cobalt/10 text-brand-cobalt" },
  enterprise: { label: "Enterprise", color: "bg-purple-100 text-purple-700" },
};

function SectionHeader({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description?: string }) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-cobalt/10 mt-0.5">
        <Icon className="h-4 w-4 text-brand-cobalt" />
      </div>
      <div>
        <h2 className="font-heading text-sm font-semibold">{title}</h2>
        {description && <p className="text-xs text-brand-muted-gray mt-0.5">{description}</p>}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, value, label, color }: { icon: React.ElementType; value: number; label: string; color: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="font-heading text-2xl font-bold leading-none">{value}</p>
        <p className="text-xs text-brand-muted-gray mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange, disabled = false }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cobalt disabled:opacity-40 ${
        checked ? "bg-brand-cobalt" : "bg-black/15"
      }`}
    >
      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition-transform ${checked ? "translate-x-4" : "translate-x-0"}`} />
    </button>
  );
}

export function SettingsContent({ initialOrg }: SettingsContentProps) {
  const { isAdmin } = useTenantPermissions();
  const [org, setOrg] = useState(initialOrg);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [name, setName] = useState(initialOrg.name);
  const [industry, setIndustry] = useState(initialOrg.industry ?? "");
  const [notifications, setNotifications] = useState(initialOrg.notifications);
  const [inclusionMinScore, setInclusionMinScore] = useState(initialOrg.inclusionMinScore);

  const planCfg = PLAN_LABELS[org.plan] ?? PLAN_LABELS.starter!;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!isAdmin) return;
    setSaving(true);
    setSaveMessage(null);
    try {
      const data = await organizationClient.update({
        name,
        industry,
        notifications,
        alae: { minAcceptableScore: inclusionMinScore },
      });
      setSaveMessage({ type: "success", text: "Cambios guardados correctamente" });
      if (data.organization) {
        const o = data.organization as typeof org;
        setOrg((prev) => ({ ...prev, name: o.name ?? name, industry: o.industry ?? industry }));
      }
    } catch (err) {
      setSaveMessage({
        type: "error",
        text: err instanceof ApiClientError ? err.message : "Error de conexión al guardar",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-10">

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Ajustes</h1>
          <p className="text-sm text-brand-muted-gray mt-0.5">
            {isAdmin ? "Configura tu organización y preferencias" : "Tus preferencias de la plataforma"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-brand-muted-gray" />
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${planCfg.color}`}>
            {planCfg.label}
          </span>
        </div>
      </div>

      {saveMessage && (
        <FeedbackBanner
          variant={saveMessage.type === "success" ? "success" : "error"}
          message={saveMessage.text}
        />
      )}

      <form onSubmit={handleSave} className="space-y-4">

        {/* ── Stats — solo admin ───────────────────────────────── */}
        {isAdmin && (
          <div className="grid grid-cols-3 gap-3">
            <StatCard icon={Users}    value={org.stats.activeUsers}  label="Usuarios activos"    color="bg-brand-cobalt/10 text-brand-cobalt" />
            <StatCard icon={BookOpen} value={org.stats.moduleCount}  label="Módulos publicados"  color="bg-emerald-50 text-emerald-600" />
            <StatCard icon={FileText} value={org.stats.documentCount} label="Documentos"         color="bg-amber-50 text-amber-600" />
          </div>
        )}

        {/* ── Organización ─────────────────────────────────────── */}
        <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
          <SectionHeader
            icon={Building2}
            title="Organización"
            description={isAdmin ? "Información visible para todos los miembros" : undefined}
          />
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-brand-muted-gray mb-1.5">Nombre de la empresa</label>
              {isAdmin ? (
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-black/10 bg-brand-light-bg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-cobalt/30"
                />
              ) : (
                <p className="rounded-xl bg-brand-light-bg px-4 py-2.5 text-sm font-medium">{org.name}</p>
              )}
            </div>

            {isAdmin && (
              <div>
                <label className="block text-xs font-medium text-brand-muted-gray mb-1.5">Industria</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full rounded-xl border border-black/10 bg-brand-light-bg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-cobalt/30"
                >
                  <option value="">Sin especificar</option>
                  {INDUSTRIES.map((i) => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center justify-between rounded-xl bg-brand-light-bg px-4 py-2.5 text-sm">
              <span className="text-brand-muted-gray">Plan actual</span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${planCfg.color}`}>{planCfg.label}</span>
            </div>
          </div>
        </div>

        {/* ── Notificaciones ───────────────────────────────────── */}
        <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
          <SectionHeader
            icon={Bell}
            title="Notificaciones"
            description="Controla qué alertas recibes en la plataforma"
          />
          <div className="space-y-2">
            {[
              { key: "moduleReminders"  as const, label: "Recordatorios de módulos pendientes", desc: "Te avisa cuando tienes módulos sin completar" },
              { key: "weeklySummary"    as const, label: "Resumen semanal de progreso",          desc: "Un resumen push cada semana con tu avance" },
              { key: "simulationAlerts" as const, label: "Alertas de simulaciones",              desc: "Notificaciones cuando hay nuevas simulaciones" },
            ].map((n) => (
              <div key={n.key} className="flex items-center justify-between rounded-xl border border-black/5 bg-brand-light-bg px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{n.label}</p>
                  <p className="text-xs text-brand-muted-gray">{n.desc}</p>
                </div>
                <Toggle
                  checked={notifications[n.key]}
                  disabled={!isAdmin}
                  onChange={(v) => setNotifications((prev) => ({ ...prev, [n.key]: v }))}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── Política de inclusión — solo admin ───────────────── */}
        {isAdmin && (
          <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
            <SectionHeader
              icon={Shield}
              title="Política de inclusión (ALAE)"
              description="Define el umbral mínimo de Inclusion Score para los documentos"
            />
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-brand-muted-gray">Umbral mínimo</span>
                <span className="font-bold text-brand-cobalt text-lg">{inclusionMinScore}%</span>
              </div>
              <input
                type="range"
                min={40}
                max={90}
                step={5}
                value={inclusionMinScore}
                onChange={(e) => setInclusionMinScore(Number(e.target.value))}
                className="w-full accent-brand-cobalt"
              />
              <div className="flex justify-between text-xs text-brand-muted-gray">
                <span>40% — permisivo</span>
                <span>90% — estricto</span>
              </div>
              <p className="rounded-xl bg-brand-light-bg px-3 py-2.5 text-xs text-brand-muted-gray">
                Los documentos con un score por debajo de este umbral aparecerán como alerta en el dashboard de inclusión.
              </p>
            </div>
          </div>
        )}

        {/* ── Guardar — solo admin ─────────────────────────────── */}
        {isAdmin && (
          <div className="flex justify-end pt-1">
            <Button type="submit" disabled={saving} className="gap-2 px-6">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Guardando…" : "Guardar cambios"}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
