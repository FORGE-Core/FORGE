"use client";

import { useCallback, useMemo, useState } from "react";
import { BookOpen, Filter, Loader2, Plus } from "lucide-react";
import {
  ModuleCard,
  type ModuleCardData,
} from "@/components/modules/module-card";
import { EmptyState } from "@/components/shared/empty-state";
import { FeedbackBanner } from "@/components/shared/feedback-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trainingClient } from "@/services/client";
import { ApiClientError } from "@/services/client/http";
import { useTenantPermissions } from "@/providers/tenant-provider";

const filters = ["Todos", "En progreso", "Pendientes", "Completados"];

type ModulesContentProps = {
  initialModules: ModuleCardData[];
};

export function ModulesContent({
  initialModules,
}: ModulesContentProps) {
  const { isAdmin } = useTenantPermissions();
  const [filter, setFilter] = useState("Todos");
  const [modules, setModules] = useState(initialModules);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);

  // Edit/Delete states
  const [editingModule, setEditingModule] = useState<ModuleCardData | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editAudience, setEditAudience] = useState("");
  const [editEstimatedMins, setEditEstimatedMins] = useState(20);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const loadModules = useCallback(async () => {
    try {
      const data = await trainingClient.listModules();
      if (data.modules) {
        setModules(data.modules as ModuleCardData[]);
      }
    } catch {
      setModules([]);
    }
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      await trainingClient.createModule({
        title: newTitle.trim(),
        description: newDescription.trim() || undefined,
      });
      setNewTitle("");
      setNewDescription("");
      setShowCreate(false);
      await loadModules();
    } catch (err) {
      setCreateError(
        err instanceof ApiClientError ? err.message : "Error de conexión"
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteClick(module: ModuleCardData) {
    const confirmDelete = confirm(
      `¿Estás seguro de que deseas eliminar el módulo "${module.title}"? Esta acción no se puede deshacer.`
    );
    if (!confirmDelete) return;

    try {
      await trainingClient.deleteModule(module.slug);
      await loadModules();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al eliminar el módulo");
    }
  }

  function handleEditClick(module: ModuleCardData) {
    setEditingModule(module);
    setEditTitle(module.title);
    setEditDescription(module.description ?? "");
    setEditAudience(module.audience ?? "");
    setEditEstimatedMins(module.estimatedMins ?? 20);
    setUpdateError(null);
  }

  async function handleUpdateSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingModule || !editTitle.trim()) return;

    setUpdating(true);
    setUpdateError(null);
    try {
      await trainingClient.updateModule(editingModule.slug, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        audience: editAudience.trim() || undefined,
        estimatedMins: Number(editEstimatedMins),
      });
      setEditingModule(null);
      await loadModules();
    } catch (err) {
      setUpdateError(
        err instanceof ApiClientError ? err.message : "Error de conexión"
      );
    } finally {
      setUpdating(false);
    }
  }

  const filtered = useMemo(() => {
    return modules.filter((m) => {
      if (filter === "En progreso") return m.status === "in_progress";
      if (filter === "Pendientes") return m.status === "pending";
      if (filter === "Completados") return m.status === "completed";
      return true;
    });
  }, [modules, filter]);

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
                <Button type="submit" disabled={creating} className="w-fit sm:col-span-2">
                  {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                  Crear módulo
                </Button>
                {createError && (
                  <FeedbackBanner
                    variant="error"
                    message={createError}
                    className="sm:col-span-2"
                  />
                )}
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
          {filtered.length} módulos
        </Badge>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No hay módulos en esta categoría"
          description="Tu administrador puede cargar el programa de capacitación de la empresa."
          actionLabel="Ver todos los módulos"
          actionHref="/modules"
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((m, i) => (
            <ModuleCard
              key={m.slug}
              module={m}
              index={i}
              isAdmin={isAdmin}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {editingModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-lg shadow-2xl animate-in scale-in duration-200 border-brand-lavender/20 bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Editar Módulo</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateSubmit} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-brand-muted-gray">Título</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="rounded-xl border border-black/10 bg-brand-light-bg px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-cobalt/30"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-brand-muted-gray">Audiencia / Rol</label>
                  <input
                    type="text"
                    value={editAudience}
                    onChange={(e) => setEditAudience(e.target.value)}
                    placeholder="Ej. Meseros, Cajeros"
                    className="rounded-xl border border-black/10 bg-brand-light-bg px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-cobalt/30"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-brand-muted-gray">Duración (minutos)</label>
                  <input
                    type="number"
                    min="1"
                    value={editEstimatedMins}
                    onChange={(e) => setEditEstimatedMins(Number(e.target.value))}
                    className="rounded-xl border border-black/10 bg-brand-light-bg px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-cobalt/30"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-brand-muted-gray">Descripción</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                    className="rounded-xl border border-black/10 bg-brand-light-bg px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-cobalt/30 resize-none"
                  />
                </div>
                {updateError && (
                  <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg">{updateError}</p>
                )}
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingModule(null)}
                    disabled={updating}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" size="sm" disabled={updating} className="gap-1.5">
                    {updating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Guardar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
