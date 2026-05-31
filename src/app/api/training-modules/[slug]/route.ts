import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { canManageDocuments } from "@/lib/auth/roles";
import { getOrganizationModuleBySlug } from "@/lib/training/modules";
import { getModuleVideo } from "@/services/documents/upload-module-video";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    const organizationId = session?.user?.organizationId;
    const userId = session?.user?.id;
    const { slug } = await params;

    if (!organizationId) {
      return NextResponse.json(
        { error: "Debes iniciar sesión" },
        { status: 401 }
      );
    }

    const result = await getOrganizationModuleBySlug(
      organizationId,
      slug,
      userId
    );

    if (!result) {
      return NextResponse.json(
        { error: "Módulo no encontrado" },
        { status: 404 }
      );
    }

    const video = await getModuleVideo(organizationId, result.module.id);
    const canManage = canManageDocuments(session?.user?.role);

    return NextResponse.json({
      module: {
        ...result.card,
        id: result.module.id,
        title: result.module.title,
        description: result.module.description,
        audience: result.module.audience,
        estimatedMins: result.module.estimatedMins,
        documentId: result.card.documentId,
        videoId: video?.id ?? null,
        hasVideo: !!video,
        canManage,
      },
    });
  } catch (error) {
    console.error("[training-modules slug GET]", error);
    return NextResponse.json(
      { error: "No se pudo cargar el módulo" },
      { status: 500 }
    );
  }
}
