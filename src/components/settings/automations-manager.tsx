"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { automationsClient } from "@/services/client";
import { ApiClientError } from "@/services/client/http";

type Automation = {
  id: string;
  name: string;
  trigger: string;
  isActive: boolean;
};

const TRIGGERS = [
  "USER_COMPLETED_MODULE",
  "USER_FAILED_ACTIVITY",
  "DOCUMENT_PROCESSED",
  "LOW_SCORE_DETECTED",
] as const;

export function AutomationsManager() {
  const [items, setItems] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState<string>(TRIGGERS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await automationsClient.list();
      setItems((data.automations ?? []) as Automation[]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await automationsClient.create({
        name: name.trim(),
        trigger,
        config: { webhook: true },
      });
      setName("");
      load();
    } catch (err) {
      setError(
        err instanceof ApiClientError ? err.message : "Error de conexión"
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    await automationsClient.update(id, { isActive: !isActive });
    load();
  }

  async function remove(id: string) {
    await automationsClient.delete(id);
    load();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Automatizaciones
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-brand-muted-gray">
          Las reglas activas disparan webhooks N8N cuando ocurren eventos de
          aprendizaje (módulo completado, actividad fallida, documento procesado).
        </p>
        <form onSubmit={handleCreate} className="flex flex-wrap gap-2">
          <input
            placeholder="Nombre de la regla"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 min-w-[200px] rounded-2xl border border-black/10 bg-brand-light-bg px-4 py-2 text-sm"
          />
          <select
            value={trigger}
            onChange={(e) => setTrigger(e.target.value)}
            className="rounded-2xl border border-black/10 bg-brand-light-bg px-4 py-2 text-sm"
          >
            {TRIGGERS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <Button type="submit" size="sm" disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Agregar
          </Button>
        </form>
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin text-brand-muted-gray" />
        ) : items.length === 0 ? (
          <p className="text-sm text-brand-muted-gray">
            Sin reglas. Configura N8N_WEBHOOK_URL para recibir eventos.
          </p>
        ) : (
          <ul className="space-y-2">
            {items.map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-brand-light-bg px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium">{a.name}</p>
                  <p className="text-xs text-brand-muted-gray">{a.trigger}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleActive(a.id, a.isActive)}
                  >
                    {a.isActive ? "Activa" : "Inactiva"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => remove(a.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
