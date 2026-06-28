import {
  buildCloudinaryDeliveryUrl,
  isCloudinaryConfigured,
} from "./cloudinary";
import { isCloudinaryReference, parseCloudinaryReference } from "./types";

export type DeliveryUrlOptions = {
  documentType?: string;
  mimeType?: string | null;
  /** true = ver en navegador; false = forzar descarga */
  inline?: boolean;
};

/**
 * URL optimizada en CDN (Cloudinary). Null si el archivo está en disco/S3
 * y debe servirse vía `/api/documents/[id]/file`.
 */
export function buildDocumentDeliveryUrl(
  fileUrl: string | null | undefined,
  options: DeliveryUrlOptions = {}
): string | null {
  if (!fileUrl || !isCloudinaryReference(fileUrl)) return null;
  if (!isCloudinaryConfigured()) return null;

  const ref = parseCloudinaryReference(fileUrl);
  if (!ref) return null;

  try {
    return buildCloudinaryDeliveryUrl(ref.publicId, ref.resourceType, {
      inline: options.inline ?? true,
      documentType: options.documentType,
    });
  } catch {
    return null;
  }
}

export function resolveDocumentFileUrl(
  documentId: string,
  deliveryUrl: string | null | undefined
): string {
  return deliveryUrl ?? `/api/documents/${documentId}/file`;
}
