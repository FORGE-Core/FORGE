import { NextResponse } from "next/server";
import { getOrganizationModuleBySlug } from "@/lib/training/modules";
import {
  deleteModuleVideo,
  uploadModuleVideo,
} from "@/services/server/documents/upload-module-video";
import { requireAdminApi } from "@/lib/api/tenant-route";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const tenant = await requireAdminApi();
    if (!tenant.ok) return tenant.response;

    const organizationId = tenant.ctx.organizationId;
    const { slug } = await params;

    const result = await getOrganizationModuleBySlug(organizationId, slug);
    if (!result) {
      return NextResponse.json(
        { error: "Módulo no encontrado" },
        { status: 404 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Selecciona un archivo de video" },
        { status: 400 }
      );
    }

    const videoId = await uploadModuleVideo({
      organizationId,
      moduleId: result.module.id,
      moduleTitle: result.module.title,
      file,
    });

    return NextResponse.json({ ok: true, videoId });
  } catch (error) {
    console.error("[training-modules video POST]", error);
    const msg =
      error instanceof Error ? error.message : "No se pudo subir el video";
    return NextResponse.json({ error: msg }, { status: 422 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const tenant = await requireAdminApi();
    if (!tenant.ok) return tenant.response;

    const organizationId = tenant.ctx.organizationId;
    const { slug } = await params;
    const videoId = new URL(req.url).searchParams.get("videoId");

    if (!videoId) {
      return NextResponse.json(
        { error: "Falta el identificador del video" },
        { status: 400 }
      );
    }

    const result = await getOrganizationModuleBySlug(organizationId, slug);
    if (!result) {
      return NextResponse.json(
        { error: "Módulo no encontrado" },
        { status: 404 }
      );
    }

    await deleteModuleVideo(organizationId, result.module.id, videoId);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[training-modules video DELETE]", error);
    const msg =
      error instanceof Error ? error.message : "No se pudo eliminar el video";
    const status = msg === "Video no encontrado" ? 404 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
