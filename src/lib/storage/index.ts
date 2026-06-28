import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import fs from "fs/promises";
import path from "path";
import { getEnv } from "@/lib/env";
import {
  deleteFromCloudinary,
  fetchCloudinaryBuffer,
  isCloudinaryConfigured,
  uploadBufferToCloudinary,
} from "./cloudinary";
import {
  encodeCloudinaryReference,
  isCloudinaryReference,
  parseCloudinaryReference,
  resolveCloudinaryResourceType,
  type StorageProvider,
} from "./types";

const UPLOAD_ROOT = path.join(process.cwd(), "storage", "uploads");

export type { StorageProvider } from "./types";
export {
  encodeCloudinaryReference,
  isCloudinaryReference,
  parseCloudinaryReference,
} from "./types";

export function getStorageProvider(): StorageProvider {
  const configured = getEnv("STORAGE_PROVIDER");
  if (configured === "cloudinary" && isCloudinaryConfigured()) {
    return "cloudinary";
  }
  if (configured === "s3" && getEnv("AWS_S3_BUCKET")) {
    return "s3";
  }
  return "local";
}

function getS3Client() {
  return new S3Client({
    region: getEnv("AWS_REGION") ?? "us-east-1",
    credentials: {
      accessKeyId: getEnv("AWS_ACCESS_KEY_ID") ?? "",
      secretAccessKey: getEnv("AWS_SECRET_ACCESS_KEY") ?? "",
    },
  });
}

function s3Key(relativePath: string) {
  return relativePath.replace(/^uploads\//, "");
}

export function getOrganizationUploadDir(organizationId: string) {
  return path.join(UPLOAD_ROOT, organizationId);
}

export async function saveOrganizationFile(
  organizationId: string,
  documentId: string,
  buffer: Buffer,
  extension: string,
  mimeType?: string
): Promise<string> {
  const provider = getStorageProvider();

  if (provider === "cloudinary") {
    const resourceType = resolveCloudinaryResourceType(mimeType, extension);
    const result = await uploadBufferToCloudinary({
      buffer,
      organizationId,
      documentId,
      resourceType,
    });
    return encodeCloudinaryReference(result.public_id, resourceType);
  }

  const safeExt = extension.startsWith(".") ? extension : `.${extension}`;
  const relativePath = `uploads/${organizationId}/${documentId}${safeExt}`;

  if (provider === "s3") {
    const bucket = getEnv("AWS_S3_BUCKET")!;
    await getS3Client().send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: s3Key(relativePath),
        Body: buffer,
        ContentLength: buffer.length,
        ContentType: mimeType,
      })
    );
    return relativePath;
  }

  const dir = getOrganizationUploadDir(organizationId);
  await fs.mkdir(dir, { recursive: true });
  const absolutePath = path.join(dir, `${documentId}${safeExt}`);
  await fs.writeFile(absolutePath, buffer);
  return relativePath;
}

export function resolveStoredFilePath(relativePath: string) {
  return path.join(process.cwd(), "storage", relativePath);
}

export async function readStoredFile(fileUrl: string): Promise<Buffer> {
  if (isCloudinaryReference(fileUrl)) {
    const ref = parseCloudinaryReference(fileUrl);
    if (!ref) throw new Error("Referencia Cloudinary inválida");
    return fetchCloudinaryBuffer(ref.publicId, ref.resourceType);
  }

  if (getStorageProvider() === "s3" || fileUrl.startsWith("uploads/")) {
    const bucket = getEnv("AWS_S3_BUCKET");
    if (bucket && getStorageProvider() === "s3") {
      const res = await getS3Client().send(
        new GetObjectCommand({
          Bucket: bucket,
          Key: s3Key(fileUrl),
        })
      );
      const bytes = await res.Body?.transformToByteArray();
      if (!bytes) throw new Error("Archivo no encontrado en S3");
      return Buffer.from(bytes);
    }
  }

  const absolutePath = resolveStoredFilePath(fileUrl);
  return fs.readFile(absolutePath);
}

export async function storedFileExists(fileUrl: string): Promise<boolean> {
  if (isCloudinaryReference(fileUrl)) {
    return !!parseCloudinaryReference(fileUrl);
  }

  try {
    if (getStorageProvider() === "s3" && fileUrl.startsWith("uploads/")) {
      await readStoredFile(fileUrl);
      return true;
    }
    await fs.access(resolveStoredFilePath(fileUrl));
    return true;
  } catch {
    return false;
  }
}

export async function deleteStoredFile(fileUrl: string) {
  try {
    if (isCloudinaryReference(fileUrl)) {
      const ref = parseCloudinaryReference(fileUrl);
      if (ref) {
        await deleteFromCloudinary(ref.publicId, ref.resourceType);
      }
      return;
    }

    if (getStorageProvider() === "s3" && fileUrl.startsWith("uploads/")) {
      const bucket = getEnv("AWS_S3_BUCKET")!;
      await getS3Client().send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: s3Key(fileUrl),
        })
      );
      return;
    }

    await fs.unlink(resolveStoredFilePath(fileUrl));
  } catch {
    /* archivo ya eliminado o inexistente */
  }
}
