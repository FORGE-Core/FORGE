"use client";

import { Loader2, FileText } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { DocumentCard } from "./document-card";

export type DocumentItem = {
  id: string;
  title: string;
  type: string;
  status: string;
  fileSize: number | null;
  chunkCount: number;
  createdAt: string;
  hasFile: boolean;
};

export function DocumentList({
  documents,
  loading,
  canManage = false,
  onRefresh,
  emptyTitle = "Aún no hay documentos",
  emptyDescription = "No hay archivos disponibles.",
}: {
  documents: DocumentItem[];
  loading?: boolean;
  canManage?: boolean;
  onRefresh: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <Loader2 className="h-8 w-8 animate-spin text-brand-cobalt" />
        <p className="text-sm text-brand-muted-gray">Cargando…</p>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <div className="space-y-4">
      {documents.map((doc, i) => (
        <DocumentCard
          key={doc.id}
          doc={doc}
          index={i}
          canManage={canManage}
          onDeleted={onRefresh}
        />
      ))}
    </div>
  );
}
