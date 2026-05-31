"use client";

import { useCallback, useRef, useState } from "react";
import { Loader2, Trash2, Upload, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ModuleVideoManagerProps = {
  slug: string;
  moduleTitle: string;
  videoId: string | null;
  onUpdated: () => void;
};

const VIDEO_ACCEPT = "video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov";

export function ModuleVideoManager({
  slug,
  moduleTitle,
  videoId,
  onUpdated,
}: ModuleVideoManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadVideo = useCallback(
    async (file: File) => {
      setError(null);
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(`/api/training-modules/${slug}/video`, {
          method: "POST",
          body: formData,
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error ?? "No se pudo subir el video");
        }
        onUpdated();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al subir");
      } finally {
        setUploading(false);
      }
    },
    [slug, onUpdated]
  );

  async function handleFileChange(files: FileList | null) {
    const file = files?.[0];
    if (!file || uploading) return;
    await uploadVideo(file);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleDelete() {
    if (!videoId || deleting) return;
    if (!confirm("¿Eliminar el video de capacitación de este módulo?")) return;

    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/training-modules/${slug}/video`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error ?? "No se pudo eliminar");
      }
      onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Card className="border-brand-lavender/30 bg-gradient-to-br from-brand-champagne/20 to-white">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Video className="h-5 w-5 text-brand-cobalt" />
          <CardTitle className="text-base">Video de capacitación</CardTitle>
        </div>
        <p className="text-sm text-brand-muted-gray">
          Sube el video que verán meseros, cajeros y el resto del equipo en «
          {moduleTitle}».
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          ref={inputRef}
          type="file"
          accept={VIDEO_ACCEPT}
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files)}
        />

        {videoId ? (
          <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            <Video className="h-4 w-4 shrink-0" />
            <span className="font-medium">Video publicado para el equipo</span>
            <div className="ml-auto flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => inputRef.current?.click()}
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Reemplazar
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={deleting}
                className="text-red-600 hover:bg-red-50"
                onClick={handleDelete}
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Quitar
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-brand-lavender/40 px-6 py-10 text-center transition-colors hover:border-brand-cobalt hover:bg-brand-champagne/30",
              uploading && "pointer-events-none opacity-70"
            )}
          >
            {uploading ? (
              <Loader2 className="mb-3 h-10 w-10 animate-spin text-brand-cobalt" />
            ) : (
              <Upload className="mb-3 h-10 w-10 text-brand-cobalt" />
            )}
            <p className="font-medium">
              {uploading ? "Subiendo video…" : "Subir video del módulo"}
            </p>
            <p className="mt-1 text-xs text-brand-muted-gray">
              MP4, WebM o MOV · máx. 100 MB
            </p>
          </button>
        )}

        {error && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
