"use client";

import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { documentsClient } from "@/services/client";

type ImageUploadZoneProps = {
  onUploaded: () => void;
};

const IMAGE_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif";

export function ImageUploadZone({ onUploaded }: ImageUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files).filter((f) => {
        const n = f.name.toLowerCase();
        return (
          f.type.startsWith("image/") ||
          n.endsWith(".jpg") ||
          n.endsWith(".jpeg") ||
          n.endsWith(".png") ||
          n.endsWith(".webp") ||
          n.endsWith(".gif")
        );
      });

      if (list.length === 0) {
        setError("Solo imágenes (.jpg, .png, .webp, .gif)");
        return;
      }

      setError(null);
      setUploading(true);

      try {
        for (const file of list) {
          const formData = new FormData();
          formData.append("file", file);
          await documentsClient.upload(formData);
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
      <p className="text-sm font-medium text-brand-text-dark">Subir imagen</p>
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
            ? "border-emerald-400 bg-emerald-50/50"
            : "border-emerald-200/60 bg-white",
          uploading && "pointer-events-none opacity-70"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={IMAGE_ACCEPT}
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />

        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-600">
          {uploading ? (
            <Loader2 className="h-7 w-7 animate-spin text-white" />
          ) : (
            <ImageIcon className="h-7 w-7 text-white" />
          )}
        </div>

        <p className="font-heading text-lg font-semibold">
          {uploading ? "Subiendo imagen…" : "Arrastra fotos o infografías"}
        </p>
        <p className="mt-2 max-w-md text-sm text-brand-muted-gray">
          Material visual para tu equipo. Máximo 12 MB por archivo. Se optimiza en
          CDN al publicar.
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
