"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2, Trash2, Upload, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { documentsClient } from "@/services/client";

type ModuleAdminDocumentProps = {
  moduleId: string;
  resources: { id: string; name: string; type: string }[];
  onUpdated?: () => void;
};

const PDF_ACCEPT = "application/pdf,.pdf";

export function ModuleAdminDocument({
  moduleId,
  resources,
  onUpdated,
}: ModuleAdminDocumentProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [autoGenerate, setAutoGenerate] = useState(true);

  const pdfResources = resources.filter((r) => r.type === "pdf");

  const uploadDocument = useCallback(
    async (file: File) => {
      setError(null);
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("moduleId", moduleId);
        formData.append("autoGenerate", autoGenerate ? "true" : "false");
        await documentsClient.upload(formData);
        router.refresh();
        onUpdated?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al subir");
      } finally {
        setUploading(false);
      }
    },
    [moduleId, autoGenerate, onUpdated, router]
  );

  async function handleFileChange(files: FileList | null) {
    const file = files?.[0];
    if (!file || uploading) return;
    await uploadDocument(file);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleDelete(id: string, name: string) {
    if (deletingId) return;
    if (!confirm(`¿Eliminar el documento «${name}» de este módulo?`)) return;

    setDeletingId(id);
    setError(null);
    try {
      await documentsClient.delete(id);
      router.refresh();
      onUpdated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Card className="border-brand-lavender/30 bg-gradient-to-br from-brand-champagne/10 to-white">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-brand-cobalt" />
          <CardTitle className="text-base font-heading">Documentos y manuales (PDF)</CardTitle>
        </div>
        <p className="text-sm text-brand-muted-gray">
          Sube los manuales, guías o instructivos que los empleados deben leer para este módulo.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          ref={inputRef}
          type="file"
          accept={PDF_ACCEPT}
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files)}
        />

        {pdfResources.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-muted-gray">
              Documentos adjuntos
            </p>
            <div className="grid gap-2">
              {pdfResources.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 rounded-2xl border border-black/5 bg-brand-light-bg px-4 py-2.5 text-sm"
                >
                  <FileText className="h-4 w-4 shrink-0 text-red-500" />
                  <span className="truncate font-medium flex-1">{doc.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={deletingId !== null}
                    className="h-8 w-8 text-brand-muted-gray hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(doc.id, doc.name)}
                    aria-label={`Eliminar ${doc.name}`}
                  >
                    {deletingId === doc.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-brand-champagne/20 px-3 py-2 text-xs text-brand-muted-gray">
            <input
              type="checkbox"
              id="autoGenerate"
              checked={autoGenerate}
              onChange={(e) => setAutoGenerate(e.target.checked)}
              className="h-4 w-4 rounded border-brand-lavender/40 text-brand-cobalt focus:ring-brand-cobalt"
            />
            <label htmlFor="autoGenerate" className="flex items-center gap-1 cursor-pointer font-medium">
              <Sparkles className="h-3 w-3 text-brand-lavender" />
              Generar actividades (quizzes) y resúmenes con IA automáticamente
            </label>
          </div>

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
              <Loader2 className="mb-2 h-8 w-8 animate-spin text-brand-cobalt" />
            ) : (
              <Upload className="mb-2 h-8 w-8 text-brand-cobalt" />
            )}
            <p className="font-semibold text-sm">
              {uploading ? "Subiendo y analizando con IA..." : "Subir documento PDF"}
            </p>
            <p className="mt-1 text-xs text-brand-muted-gray">
              Solo formato PDF · Máximo 15 MB
            </p>
          </button>
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
