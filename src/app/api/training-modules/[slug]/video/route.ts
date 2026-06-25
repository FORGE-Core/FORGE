import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOrganizationModuleBySlug } from "@/lib/training/modules";
import { uploadModuleVideo } from "@/services/server/documents/upload-module-video";
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
  _req: Request,
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

    const video = await db.document.findFirst({
      where: {
        organizationId,
        moduleId: result.module.id,
        type: "VIDEO",
      },
    });

    if (!video) {
      return NextResponse.json({ error: "No hay video en este módulo" }, { status: 404 });
    }

    if (video.fileUrl) {
      const { deleteStoredFile } = await import("@/lib/document-storage");
      await deleteStoredFile(video.fileUrl);
    }

    await db.document.delete({ where: { id: video.id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[training-modules video DELETE]", error);
    return NextResponse.json(
      { error: "No se pudo eliminar el video" },
      { status: 500 }
    );
  }
}
