import fs from "fs/promises";
import path from "path";

const UPLOAD_ROOT = path.join(process.cwd(), "storage", "uploads");

export function getOrganizationUploadDir(organizationId: string) {
  return path.join(UPLOAD_ROOT, organizationId);
}

export async function saveOrganizationFile(
  organizationId: string,
  documentId: string,
  buffer: Buffer,
  extension: string
) {
  const dir = getOrganizationUploadDir(organizationId);
  await fs.mkdir(dir, { recursive: true });
  const safeExt = extension.startsWith(".") ? extension : `.${extension}`;
  const absolutePath = path.join(dir, `${documentId}${safeExt}`);
  await fs.writeFile(absolutePath, buffer);
  return `uploads/${organizationId}/${documentId}${safeExt}`;
}

export function resolveStoredFilePath(relativePath: string) {
  return path.join(process.cwd(), "storage", relativePath);
}

export async function deleteStoredFile(relativePath: string) {
  try {
    const absolutePath = resolveStoredFilePath(relativePath);
    await fs.unlink(absolutePath);
  } catch {
    /* archivo ya eliminado o inexistente */
  }
}
