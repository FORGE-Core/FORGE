"use client";

import { useCallback, useEffect, useState } from "react";
import { BookOpen, Filter } from "lucide-react";
import { ModuleCard, type ModuleCardData } from "@/components/modules/module-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";

const filters = ["Todos", "En progreso", "Pendientes", "Completados"];

export default function ModulesPage() {
  const [filter, setFilter] = useState("Todos");
  const [modules, setModules] = useState<ModuleCardData[]>([]);
  const [loading, setLoading] = useState(true);

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
