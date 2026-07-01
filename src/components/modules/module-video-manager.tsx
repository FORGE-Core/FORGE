"use client";

import { useCallback, useRef, useState } from "react";
import { Loader2, Trash2, Upload, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ModuleVideoItem } from "@/services/server/training/module-detail.service";
import { trainingClient } from "@/services/client";

type ModuleVideoManagerProps = {
  slug: string;
  moduleTitle: string;
  videos: ModuleVideoItem[];
  onUpdated: () => void;
};

const VIDEO_ACCEPT = "video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov";

export function ModuleVideoManager({
  slug,
  moduleTitle,
  videos,
  onUpdated,
}: ModuleVideoManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadVideo = useCallback(
    async (file: File) => {
      setError(null);
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        await trainingClient.uploadModuleVideo(slug, formData);
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

  async function handleDelete(videoId: string, title: string) {
    if (deletingId) return;
    if (!confirm(`¿Eliminar el video «${title}»?`)) return;

    setDeletingId(videoId);
    setError(null);
    try {
      await trainingClient.deleteModuleVideo(slug, videoId);
      onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Card className="border-brand-lavender/30 bg-gradient-to-br from-brand-champagne/20 to-white">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Video className="h-5 w-5 text-brand-cobalt" />
          <CardTitle className="text-base">Gestionar videos</CardTitle>
        </div>
        <p className="text-sm text-brand-muted-gray">
          Sube uno o más videos para «{moduleTitle}». Cada archivo se añade a la
          lista del módulo.
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

        {videos.length > 0 && (
          <ul className="space-y-2">
            {videos.map((video, index) => (
              <li
                key={video.id}
                className="flex items-center gap-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
              >
                <Video className="h-4 w-4 shrink-0" />
                <span className="min-w-0 flex-1 truncate font-medium">
                  {index + 1}. {video.title}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={deletingId === video.id || uploading}
                  className="shrink-0 text-red-600 hover:bg-red-50"
                  onClick={() => handleDelete(video.id, video.title)}
                >
                  {deletingId === video.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Quitar
                </Button>
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-brand-lavender/40 px-6 py-8 text-center transition-colors hover:border-brand-cobalt hover:bg-brand-champagne/30",
            uploading && "pointer-events-none opacity-70"
          )}
        >
          {uploading ? (
            <Loader2 className="mb-3 h-8 w-8 animate-spin text-brand-cobalt" />
          ) : (
            <Upload className="mb-3 h-8 w-8 text-brand-cobalt" />
          )}
          <p className="font-medium">
            {uploading
              ? "Subiendo video…"
              : videos.length > 0
                ? "Añadir otro video"
                : "Subir primer video"}
          </p>
          <p className="mt-1 text-xs text-brand-muted-gray">
            MP4, WebM o MOV · máx. 100 MB
          </p>
        </button>

        {error && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
