import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import fs from "fs/promises";
import path from "path";
import { getEnv } from "@/lib/env";

const UPLOAD_ROOT = path.join(process.cwd(), "storage", "uploads");

export type StorageProvider = "local" | "s3";

function getProvider(): StorageProvider {
  const p = getEnv("STORAGE_PROVIDER");
  if (p === "s3" && getEnv("AWS_S3_BUCKET")) return "s3";
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
  extension: string
) {
  const safeExt = extension.startsWith(".") ? extension : `.${extension}`;
  const relativePath = `uploads/${organizationId}/${documentId}${safeExt}`;

  if (getProvider() === "s3") {
    const bucket = getEnv("AWS_S3_BUCKET")!;
    await getS3Client().send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: s3Key(relativePath),
        Body: buffer,
        ContentLength: buffer.length,
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

export async function readStoredFile(relativePath: string): Promise<Buffer> {
  if (getProvider() === "s3") {
    const bucket = getEnv("AWS_S3_BUCKET")!;
    const res = await getS3Client().send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: s3Key(relativePath),
      })
    );
    const bytes = await res.Body?.transformToByteArray();
    if (!bytes) throw new Error("Archivo no encontrado en S3");
    return Buffer.from(bytes);
  }

  const absolutePath = resolveStoredFilePath(relativePath);
  return fs.readFile(absolutePath);
}

export async function storedFileExists(relativePath: string): Promise<boolean> {
  try {
    if (getProvider() === "s3") {
      await readStoredFile(relativePath);
      return true;
    }
    await fs.access(resolveStoredFilePath(relativePath));
    return true;
  } catch {
    return false;
  }
}

export async function deleteStoredFile(relativePath: string) {
  try {
    if (getProvider() === "s3") {
      const bucket = getEnv("AWS_S3_BUCKET")!;
      await getS3Client().send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: s3Key(relativePath),
        })
      );
      return;
    }
    await fs.unlink(resolveStoredFilePath(relativePath));
  } catch {
    /* archivo ya eliminado o inexistente */
  }
}
