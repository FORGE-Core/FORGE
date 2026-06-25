"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  MoreVertical,
  Sparkles,
  Trash2,
  Video,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InclusionScoreCard } from "@/components/alae/inclusion-score-card";
import { InclusionIssuesList } from "@/components/alae/inclusion-issues-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DocumentItem } from "./document-list";
import { cn } from "@/lib/utils";
import { documentsClient } from "@/services/client";
import { ApiClientError } from "@/services/client/http";

function formatSize(bytes: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function statusLabel(status: string) {
  switch (status) {
    case "READY":
      return { text: "Disponible", variant: "success" as const };
    case "PROCESSING":
    case "UPLOADING":
      return { text: "Procesando…", variant: "warning" as const };
    case "FAILED":
      return { text: "Error", variant: "muted" as const };
    default:
      return { text: status, variant: "muted" as const };
  }
}

type DocumentCardProps = {
  doc: DocumentItem;
  index: number;
  canManage?: boolean;
  onDeleted: () => void;
  onRefresh?: () => void;
};

export function DocumentCard({
  doc,
  index,
  canManage = false,
  onDeleted,
  onRefresh,
}: DocumentCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [reprocessing, setReprocessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVideo, setShowVideo] = useState(false);

  const isVideo = doc.type === "VIDEO";
  const st = statusLabel(doc.status);
  const canDownload = !!doc.hasFile;
  const fileUrl = `/api/documents/${doc.id}/file`;

  async function handleDownload() {
    setMenuOpen(false);
    setDownloading(true);
    setError(null);
    try {
      const blob = await documentsClient.downloadFile(doc.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.title;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err instanceof ApiClientError || err instanceof Error
          ? err.message
          : "Error al descargar"
      );
    } finally {
      setDownloading(false);
    }
  }

  async function handleReprocess() {
    setReprocessing(true);
    setError(null);
    try {
      await documentsClient.reprocess(doc.id);
      onRefresh?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al reprocesar");
    } finally {
      setReprocessing(false);
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      await documentsClient.generate(doc.id);
      onRefresh?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al generar contenido");
    } finally {
      setGenerating(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      await documentsClient.delete(doc.id);
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <CardHeader className="flex flex-row items-start gap-4 pb-2">
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1",
              isVideo
                ? "bg-gradient-to-br from-violet-50 to-indigo-50 ring-violet-100"
                : "bg-gradient-to-br from-red-50 to-orange-50 ring-red-100"
            )}
          >
            {isVideo ? (
              <Video className="h-6 w-6 text-brand-cobalt" />
            ) : (
              <FileText className="h-6 w-6 text-red-500" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-base leading-snug">
              {doc.title}
            </CardTitle>
            <p className="mt-1 text-xs text-brand-muted-gray">
              {formatDate(doc.createdAt)} · {formatSize(doc.fileSize)}
              {isVideo ? " · Video" : " · PDF"}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Badge variant={st.variant}>{st.text}</Badge>
            {canManage && (
              <div className="relative">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-label="Opciones del documento"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
                {menuOpen && (
                  <>
                    <button
                      type="button"
                      className="fixed inset-0 z-10"
                      aria-label="Cerrar menú"
                      onClick={() => setMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full z-20 mt-1 min-w-[180px] overflow-hidden rounded-2xl border border-black/5 bg-white py-1 shadow-lg">
                      <button
                        type="button"
                        disabled={!canDownload || downloading}
                        onClick={handleDownload}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm hover:bg-brand-light-bg disabled:opacity-50"
                      >
                        {downloading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4 text-brand-cobalt" />
                        )}
                        Descargar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          setConfirmDelete(true);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Eliminar
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </CardHeader>

        {doc.status === "READY" && (
          <CardContent className="space-y-3">
            {isVideo ? (
              <>
                {showVideo ? (
                  <video
                    controls
                    className="w-full rounded-2xl bg-black"
                    src={fileUrl}
                    preload="metadata"
                  >
                    Tu navegador no soporta reproducción de video.
                  </video>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() => setShowVideo(true)}
                  >
                    <Video className="h-4 w-4" />
                    Ver video
                  </Button>
                )}
              </>
            ) : (
              <>
                {doc.inclusionScore != null && (
                  <div className="space-y-3 rounded-2xl border border-brand-lavender/20 bg-brand-champagne/20 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-medium">Inclusión ALAE</p>
                      <InclusionScoreCard
                        score={doc.inclusionScore}
                        size="sm"
                      />
                    </div>
                    {doc.inclusionIssues && doc.inclusionIssues.length > 0 && (
                      <InclusionIssuesList
                        issues={doc.inclusionIssues.map((message, i) => ({
                          code: `issue-${i}`,
                          severity: "medium",
                          message,
                        }))}
                        recommendations={
                          doc.inclusionRecommendations?.length
                            ? doc.inclusionRecommendations
                            : [
                                "Simplifica el lenguaje del documento",
                                "Agrega ejemplos prácticos del día a día",
                              ]
                        }
                      />
                    )}
                  </div>
                )}
                {canManage && (
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {[
                      { label: "Procesado", ok: doc.status === "READY" },
                      { label: "Chunks creados", ok: doc.chunkCount > 0 },
                      {
                        label: "Embeddings generados",
                        ok: (doc.embeddingCount ?? 0) > 0 || doc.chunkCount > 0,
                      },
                      { label: "Disponible para IA", ok: doc.chunkCount > 0 },
                      {
                        label: "Actividades generadas",
                        ok: !!doc.contentGenerated,
                      },
                    ].map((step) => (
                      <li
                        key={step.label}
                        className="flex items-center gap-2 rounded-xl bg-brand-light-bg px-3 py-2 text-sm"
                      >
                        <CheckCircle2
                          className={cn(
                            "h-4 w-4 shrink-0",
                            step.ok ? "text-emerald-500" : "text-brand-muted-gray/40"
                          )}
                        />
                        <span className="text-brand-muted-gray">{step.label}</span>
                        <span className="ml-auto text-xs font-medium">
                          {step.ok ? "✔" : "—"}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                {canManage && doc.chunkCount > 0 && !doc.contentGenerated && (
                  <Button
                    size="sm"
                    className="w-full sm:w-auto"
                    disabled={generating}
                    onClick={handleGenerate}
                  >
                    {generating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    Generar módulo y actividades con IA
                  </Button>
                )}
                {canDownload && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                    disabled={downloading}
                    onClick={handleDownload}
                  >
                    {downloading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    Descargar PDF
                  </Button>
                )}
              </>
            )}
          </CardContent>
        )}

        {doc.status === "FAILED" && canManage && (
          <CardContent className="space-y-3">
            <p className="text-sm text-red-600">
              No se pudo procesar el archivo. Revisa el formato e inténtalo de
              nuevo.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                disabled={reprocessing}
                onClick={handleReprocess}
              >
                {reprocessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Reprocesar
              </Button>
              {canDownload && (
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4" />
                  Descargar
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:bg-red-50"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="h-4 w-4" />
                Eliminar
              </Button>
            </div>
          </CardContent>
        )}

        {(doc.status === "PROCESSING" || doc.status === "UPLOADING") && (
          <CardContent>
            <div className="flex items-center gap-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
              {isVideo ? "Procesando video…" : "Indexando para el mentor IA…"}
            </div>
          </CardContent>
        )}

        {error && (
          <CardContent className="pt-0">
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          </CardContent>
        )}

        {canManage && (
          <AnimatePresence>
            {confirmDelete && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden border-t border-black/5 bg-red-50/50"
              >
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-900">
                      ¿Eliminar «{doc.title}»?
                    </p>
                    <p className="text-xs text-red-700/80">
                      Se borrará el archivo
                      {!isVideo && " y los fragmentos de IA"}. Esta acción no se
                      puede deshacer.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={deleting}
                      onClick={() => setConfirmDelete(false)}
                    >
                      <X className="h-4 w-4" />
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      disabled={deleting}
                      className={cn(
                        "bg-red-600 text-white hover:bg-red-700",
                        "shadow-none"
                      )}
                      onClick={handleDelete}
                    >
                      {deleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      Eliminar
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </Card>
    </motion.div>
  );
}
