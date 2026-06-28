export type StorageProvider = "local" | "s3" | "cloudinary";

export type CloudinaryResourceType = "image" | "video" | "raw";

export const CLOUDINARY_FILE_PREFIX = "cloudinary://";

export type CloudinaryFileReference = {
  publicId: string;
  resourceType: CloudinaryResourceType;
};

export function encodeCloudinaryReference(
  publicId: string,
  resourceType: CloudinaryResourceType
): string {
  return `${CLOUDINARY_FILE_PREFIX}${resourceType}/${publicId}`;
}

export function parseCloudinaryReference(
  fileUrl: string
): CloudinaryFileReference | null {
  if (!fileUrl.startsWith(CLOUDINARY_FILE_PREFIX)) return null;
  const rest = fileUrl.slice(CLOUDINARY_FILE_PREFIX.length);
  const slash = rest.indexOf("/");
  if (slash <= 0) return null;
  const resourceType = rest.slice(0, slash) as CloudinaryResourceType;
  if (!["image", "video", "raw"].includes(resourceType)) return null;
  const publicId = rest.slice(slash + 1);
  if (!publicId) return null;
  return { publicId, resourceType };
}

export function isCloudinaryReference(fileUrl: string): boolean {
  return fileUrl.startsWith(CLOUDINARY_FILE_PREFIX);
}

export function resolveCloudinaryResourceType(
  mimeType: string | undefined,
  extension: string
): CloudinaryResourceType {
  const ext = extension.toLowerCase().replace(/^\./, "");
  const mime = (mimeType ?? "").toLowerCase();

  if (mime.startsWith("video/") || ["mp4", "webm", "mov", "avi"].includes(ext)) {
    return "video";
  }
  if (
    mime.startsWith("image/") ||
    ["jpg", "jpeg", "png", "webp", "gif", "avif"].includes(ext)
  ) {
    return "image";
  }
  return "raw";
}
