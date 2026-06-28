import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { getEnv, requireEnv } from "@/lib/env";
import type { CloudinaryResourceType } from "./types";

let configured = false;

export function isCloudinaryConfigured(): boolean {
  return !!(
    getEnv("CLOUDINARY_CLOUD_NAME") &&
    getEnv("CLOUDINARY_API_KEY") &&
    getEnv("CLOUDINARY_API_SECRET")
  );
}

export function getCloudinaryClient() {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      "Cloudinary no configurado. Añade CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET en .env"
    );
  }

  if (!configured) {
    cloudinary.config({
      cloud_name: requireEnv("CLOUDINARY_CLOUD_NAME"),
      api_key: requireEnv("CLOUDINARY_API_KEY"),
      api_secret: requireEnv("CLOUDINARY_API_SECRET"),
      secure: true,
    });
    configured = true;
  }

  return cloudinary;
}

export async function uploadBufferToCloudinary({
  buffer,
  organizationId,
  documentId,
  resourceType,
}: {
  buffer: Buffer;
  organizationId: string;
  documentId: string;
  resourceType: CloudinaryResourceType;
}): Promise<UploadApiResponse> {
  const client = getCloudinaryClient();
  const folder = `forge/${organizationId}`;

  return new Promise((resolve, reject) => {
    const stream = client.uploader.upload_stream(
      {
        folder,
        public_id: documentId,
        resource_type: resourceType,
        overwrite: true,
        unique_filename: false,
        use_filename: false,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

export async function deleteFromCloudinary(
  publicId: string,
  resourceType: CloudinaryResourceType
): Promise<void> {
  const client = getCloudinaryClient();
  await client.uploader.destroy(publicId, { resource_type: resourceType });
}

export async function fetchCloudinaryBuffer(
  publicId: string,
  resourceType: CloudinaryResourceType
): Promise<Buffer> {
  const client = getCloudinaryClient();
  const url = client.url(publicId, {
    resource_type: resourceType,
    secure: true,
    sign_url: true,
    type: "upload",
  });

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`No se pudo descargar el archivo desde Cloudinary (${response.status})`);
  }

  return Buffer.from(await response.arrayBuffer());
}

export function buildCloudinaryDeliveryUrl(
  publicId: string,
  resourceType: CloudinaryResourceType,
  options?: { inline?: boolean; documentType?: string }
): string {
  const client = getCloudinaryClient();
  const inline = options?.inline ?? true;

  if (resourceType === "image") {
    return client.url(publicId, {
      resource_type: "image",
      secure: true,
      transformation: [
        { fetch_format: "auto", quality: "auto", width: 1600, crop: "limit" },
      ],
    });
  }

  if (resourceType === "video") {
    return client.url(publicId, {
      resource_type: "video",
      secure: true,
      transformation: [{ fetch_format: "auto", quality: "auto" }],
    });
  }

  return client.url(publicId, {
    resource_type: "raw",
    secure: true,
    flags: inline ? undefined : "attachment",
  });
}
