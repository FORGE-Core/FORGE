"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { BookOpen, Filter, Loader2, Plus } from "lucide-react";
import { ModuleCard, type ModuleCardData } from "@/components/modules/module-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const filters = ["Todos", "En progreso", "Pendientes", "Completados"];

export default function ModulesPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const [filter, setFilter] = useState("Todos");
  const [modules, setModules] = useState<ModuleCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const loadModules = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/training-modules");
      const data = await res.json();
      if (res.ok && data.modules) {
        setModules(data.modules);
      }
    } catch {
      setModules([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadModules();
  }, [loadModules]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/training-modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDescription.trim() || undefined,
        }),
      });
      if (res.ok) {
        setNewTitle("");
        setNewDescription("");
        setShowCreate(false);
        loadModules();
      }
    } finally {
      setCreating(false);
    }
  }

  const filtered = modules.filter((m) => {
    if (filter === "En progreso") return m.status === "in_progress";
    if (filter === "Pendientes") return m.status === "pending";
    if (filter === "Completados") return m.status === "completed";
    return true;
  });

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="font-heading text-3xl font-bold">Módulos de capacitación</h1>
        <p className="mt-1 text-brand-muted-gray">
          Contenido de tu empresa para que el equipo complete el programa
        </p>
      </div>

      {isAdmin && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Administración</CardTitle>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setShowCreate((v) => !v)}
            >
              <Plus className="h-4 w-4" />
              Nuevo módulo
            </Button>
          </CardHeader>
          {showCreate && (
            <CardContent>
              <form onSubmit={handleCreate} className="grid gap-3 sm:grid-cols-2">
                <input
                  placeholder="Título del módulo"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="rounded-2xl border border-black/10 bg-brand-light-bg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-cobalt/30"
                  required
                />
                <input
                  placeholder="Descripción (opcional)"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="rounded-2xl border border-black/10 bg-brand-light-bg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-cobalt/30"
                />
                <Button type="submit" disabled={creating} className="sm:col-span-2 w-fit">
                  {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                  Crear módulo
                </Button>
              </form>
            </CardContent>
          )}
        </Card>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-brand-muted-gray" />
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              filter === f
                ? "gradient-brand text-white"
                : "bg-white text-brand-muted-gray hover:bg-brand-champagne"
            }`}
          >
            {f}
          </button>
        ))}
        <Badge variant="muted" className="ml-auto">
          {loading ? "…" : `${filtered.length} módulos`}
        </Badge>
      </div>

      {loading ? (
        <p className="text-sm text-brand-muted-gray">Cargando módulos…</p>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No hay módulos en esta categoría"
          description="Tu administrador puede cargar el programa de capacitación de la empresa."
          actionLabel="Ver todos los módulos"
          actionHref="/dashboard/modules"
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((m, i) => (
            <ModuleCard key={m.slug} module={m} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
