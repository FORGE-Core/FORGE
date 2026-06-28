"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit3, Loader2, Save, Trash2, Settings, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { trainingClient } from "@/services/client";
import type { ModuleDetailData } from "@/services/server/training/module-detail.service";

type ModuleAdminDetailsProps = {
  slug: string;
  module: ModuleDetailData;
};

export function ModuleAdminDetails({ slug, module }: ModuleAdminDetailsProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState(module.title);
  const [description, setDescription] = useState(module.description ?? "");
  const [audience, setAudience] = useState(module.audience ?? "");
  const [estimatedMins, setEstimatedMins] = useState(module.estimatedMins ?? 20);
  const [status, setStatus] = useState(module.moduleStatus);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError(null);

    try {
      await trainingClient.updateModule(slug, {
        title: title.trim(),
        description: description.trim() || undefined,
        audience: audience.trim() || undefined,
        estimatedMins: Number(estimatedMins),
        status,
      });
      setIsEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar el módulo");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (deleting) return;
    const confirmMessage = `¿Estás completamente seguro de que deseas eliminar el módulo "${module.title}"?\n\nEsta acción eliminará el módulo permanentemente junto con todas sus actividades y no se podrá deshacer.`;
    if (!window.confirm(confirmMessage)) return;

    setDeleting(true);
    setError(null);

    try {
      await trainingClient.deleteModule(slug);
      router.push("/modules");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar el módulo");
      setDeleting(false);
    }
  }

  return (
    <Card className="border-brand-lavender/30 bg-gradient-to-br from-brand-champagne/10 to-white shadow-sm transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-brand-cobalt" />
          <CardTitle className="text-base font-bold">Configuración del Módulo</CardTitle>
        </div>
        {!isEditing && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="h-8 gap-1.5"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Editar
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-brand-muted-gray">
                  Título del Módulo
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="rounded-xl border border-black/10 bg-brand-light-bg px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-cobalt/30"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-brand-muted-gray">
                  Audiencia / Rol Destinatario
                </label>
                <input
                  type="text"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="Ej. Meseros, Cocineros"
                  className="rounded-xl border border-black/10 bg-brand-light-bg px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-cobalt/30"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-brand-muted-gray">
                  Duración Estimada (Minutos)
                </label>
                <input
                  type="number"
                  min="1"
                  value={estimatedMins}
                  onChange={(e) => setEstimatedMins(Number(e.target.value))}
                  className="rounded-xl border border-black/10 bg-brand-light-bg px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-cobalt/30"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-brand-muted-gray">
                  Estado de Publicación
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "DRAFT" | "PUBLISHED" | "ARCHIVED")}
                  className="rounded-xl border border-black/10 bg-brand-light-bg px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-cobalt/30"
                >
                  <option value="DRAFT">Borrador (Oculto para empleados)</option>
                  <option value="PUBLISHED">Publicado (Visible)</option>
                  <option value="ARCHIVED">Archivado</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-brand-muted-gray">
                  Descripción / Resumen
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="rounded-xl border border-black/10 bg-brand-light-bg px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-cobalt/30 resize-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={deleting || loading}
                className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                {deleting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                Eliminar Módulo
              </Button>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    setTitle(module.title);
                    setDescription(module.description ?? "");
                    setAudience(module.audience ?? "");
                    setEstimatedMins(module.estimatedMins ?? 20);
                    setStatus(module.moduleStatus);
                    setError(null);
                  }}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button type="submit" size="sm" disabled={loading} className="gap-1.5">
                  {loading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  Guardar Cambios
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <div className="flex items-center gap-2 text-brand-muted-gray">
                <span className="font-semibold text-black/80">Estado:</span>
                {module.moduleStatus === "PUBLISHED" ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-xs font-medium">
                    <Eye className="h-3 w-3" /> Publicado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full text-xs font-medium">
                    <EyeOff className="h-3 w-3" /> Borrador
                  </span>
                )}
              </div>
              <div className="text-brand-muted-gray">
                <span className="font-semibold text-black/80">Destinatarios:</span>{" "}
                {module.audience || "General / Todo el equipo"}
              </div>
              <div className="text-brand-muted-gray">
                <span className="font-semibold text-black/80">Duración estimada:</span>{" "}
                {module.estimatedMins ? `${module.estimatedMins} minutos` : "20 minutos"}
              </div>
            </div>

            <div className="border-t border-black/5 pt-3">
              <p className="text-xs font-semibold text-brand-muted-gray mb-1">Descripción</p>
              <p className="text-sm text-brand-muted-gray leading-relaxed">
                {module.description || "Sin descripción proporcionada."}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
