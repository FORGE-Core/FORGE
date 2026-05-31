"use client";

import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CloudUpload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type DocumentUploadZoneProps = {
  onUploaded: () => void;
};

export function DocumentUploadZone({ onUploaded }: DocumentUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files).filter(
        (f) =>
          f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
      );

      if (list.length === 0) {
        setError("Solo archivos PDF (.pdf)");
        return;
      }

      setError(null);
      setUploading(true);

      try {
        for (const file of list) {
          const formData = new FormData();
          formData.append("file", file);

          const res = await fetch("/api/documents", {
            method: "POST",
            body: formData,
          });

          const raw = await res.text();
          let data: { error?: string };
          try {
            data = raw ? JSON.parse(raw) : {};
          } catch {
            throw new Error(
              raw.slice(0, 100) || `Error al subir (${res.status})`
            );
          }

          if (!res.ok) {
            throw new Error(data.error ?? "No se pudo subir el archivo");
          }
        }
        onUploaded();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al subir");
      } finally {
        setUploading(false);
      }
    },
    [onUploaded]
  );

  async function handleFiles(files: FileList | null) {
    if (!files?.length || uploading) return;
    await uploadFiles(files);
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-brand-text-dark">Subir PDF</p>
      <motion.div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        animate={{ scale: dragOver ? 1.01 : 1 }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-[28px] border-2 border-dashed px-8 py-12 text-center transition-colors",
          dragOver
            ? "border-brand-cobalt bg-brand-champagne/50"
            : "border-brand-muted-gray/30 bg-white",
          uploading && "pointer-events-none opacity-70"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />

        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-3xl gradient-brand">
          {uploading ? (
            <Loader2 className="h-7 w-7 animate-spin text-white" />
          ) : (
            <CloudUpload className="h-7 w-7 text-white" />
          )}
        </div>

        <p className="font-heading text-lg font-semibold">
          {uploading ? "Subiendo y procesando…" : "Arrastra PDFs aquí"}
        </p>
        <p className="mt-2 max-w-md text-sm text-brand-muted-gray">
          Manuales y procedimientos. Máximo 15 MB. Se indexan para el mentor IA.
        </p>
      </motion.div>

      {error && (
        <p className="rounded-2xl bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
