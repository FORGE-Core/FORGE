"use client";

import { useCallback, useEffect, useState } from "react";
import { FileText, HardDrive, Sparkles } from "lucide-react";
import {
  DocumentList,
  type DocumentItem,
} from "@/components/documents/document-list";
import { DocumentUploadZone } from "@/components/documents/document-upload-zone";
import { VideoUploadZone } from "@/components/documents/video-upload-zone";
import { FeedbackBanner } from "@/components/shared/feedback-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { OrganizationDocumentItem } from "@/lib/documents/list";
import { documentsClient } from "@/services/client";
import { ApiClientError } from "@/services/client/http";
import { useTenantPermissions } from "@/providers/tenant-provider";

function toDocumentItem(d: OrganizationDocumentItem): DocumentItem {
  return {
    id: d.id,
    title: d.title,
    type: d.type,
    status: d.status,
    fileSize: d.fileSize,
    chunkCount: d.chunkCount,
    embeddingCount: d.embeddingCount,
    contentGenerated: d.contentGenerated,
    inclusionScore: d.inclusionScore,
    inclusionIssues: d.inclusionIssues,
    inclusionRecommendations: d.inclusionRecommendations,
    createdAt: d.createdAt,
    hasFile: d.hasFile,
  };
}

type DocumentsContentProps = {
  initialDocuments: OrganizationDocumentItem[];
};

export function DocumentsContent({
  initialDocuments,
}: DocumentsContentProps) {
  const { canManageDocuments } = useTenantPermissions();
  const [documents, setDocuments] = useState<DocumentItem[]>(() =>
    initialDocuments.map(toDocumentItem)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canManage, setCanManage] = useState(canManageDocuments);

  const loadDocuments = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await documentsClient.list();
      setCanManage(!!data.canManage);
      setDocuments(
        (data.documents as OrganizationDocumentItem[]).map(toDocumentItem)
      );
      setError(null);
    } catch (err) {
      setError(
        err instanceof ApiClientError ? err.message : "Error de conexión"
      );
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  const hasProcessing = documents.some(
    (d) => d.status === "PROCESSING" || d.status === "UPLOADING"
  );

  useEffect(() => {
    if (!hasProcessing) return;
    const id = setInterval(() => loadDocuments(true), 5000);
    return () => clearInterval(id);
  }, [hasProcessing, loadDocuments]);

  const pdfs = documents.filter((d) => d.type === "PDF");
  const videos = documents.filter((d) => d.type === "VIDEO");
  const totalChunks = documents.reduce((n, d) => n + d.chunkCount, 0);
  const readyCount = documents.filter((d) => d.status === "READY").length;
  const totalSize = documents.reduce((n, d) => n + (d.fileSize ?? 0), 0);

  const sizeLabel =
    totalSize < 1024 * 1024
      ? `${(totalSize / 1024).toFixed(0)} KB`
      : `${(totalSize / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">
            {canManage ? "Gestión documental" : "Biblioteca de capacitación"}
          </h1>
          <p className="mt-1 max-w-xl text-brand-muted-gray">
            {canManage
              ? "Como administrador puedes subir PDFs y videos para tu equipo."
              : "Consulta los manuales y videos que tu empresa ha publicado."}
          </p>
        </div>
        {documents.length > 0 && (
          <div className="flex gap-3 text-sm">
            <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2 shadow-sm ring-1 ring-black/5">
              <FileText className="h-4 w-4 text-brand-cobalt" />
              <span className="font-medium">{pdfs.length}</span>
              <span className="text-brand-muted-gray">PDFs</span>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2 shadow-sm ring-1 ring-black/5">
              <HardDrive className="h-4 w-4 text-brand-lavender" />
              <span className="font-medium">{videos.length}</span>
              <span className="text-brand-muted-gray">videos</span>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2 shadow-sm ring-1 ring-black/5">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <span className="font-medium">{readyCount}</span>
              <span className="text-brand-muted-gray">listos · {sizeLabel}</span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex flex-wrap items-center gap-3">
          <FeedbackBanner variant="error" message={error} className="flex-1" />
          <Button variant="outline" size="sm" onClick={() => loadDocuments()}>
            Reintentar
          </Button>
        </div>
      )}

      {canManage && (
        <div className="grid gap-6 lg:grid-cols-2">
          <DocumentUploadZone onUploaded={loadDocuments} />
          <VideoUploadZone onUploaded={loadDocuments} />
        </div>
      )}

      {videos.length > 0 && (
        <div>
          <h2 className="mb-4 font-heading text-lg font-semibold">Videos</h2>
          <DocumentList
            documents={videos}
            loading={loading && documents.length === 0}
            canManage={canManage}
            onRefresh={loadDocuments}
            emptyTitle="No hay videos"
            emptyDescription="Tu administrador publicará videos de capacitación aquí."
          />
        </div>
      )}

      <div>
        <h2 className="mb-4 font-heading text-lg font-semibold">
          {canManage ? "Documentos PDF" : "Manuales y documentos"}
        </h2>
        <DocumentList
          documents={pdfs}
          loading={loading && documents.length === 0}
          canManage={canManage}
          onRefresh={loadDocuments}
          emptyTitle={
            canManage ? "Aún no hay PDFs" : "No hay documentos publicados"
          }
          emptyDescription={
            canManage
              ? "Sube el primer manual o procedimiento de tu empresa."
              : "Cuando el administrador suba material, lo verás aquí."
          }
        />
      </div>

      {canManage && readyCount > 0 && totalChunks > 0 && (
        <Card className="border-brand-lavender/20 bg-gradient-to-r from-brand-champagne/30 to-white">
          <CardContent className="flex items-center gap-4 pt-6">
            <Sparkles className="h-8 w-8 shrink-0 text-brand-lavender" />
            <div>
              <p className="font-medium">
                {totalChunks} fragmentos indexados para el mentor IA
              </p>
              <p className="text-sm text-brand-muted-gray">
                Los PDFs procesados alimentan al mentor. Los videos quedan
                disponibles para visualización del equipo.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
