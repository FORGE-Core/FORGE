import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { assertAdminSession, canManageDocuments } from "@/lib/auth/roles";
import { db } from "@/lib/db";
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

    const [processes, moduleDocuments] = await Promise.all([
      db.process.findMany({
        where: { organizationId, moduleId: result.module.id },
        orderBy: { orderIndex: "asc" },
        select: { id: true, title: true, description: true, steps: true },
      }),
      db.document.findMany({
        where: {
          organizationId,
          moduleId: result.module.id,
          status: "READY",
        },
        select: { id: true, title: true, type: true },
      }),
    ]);

    const steps = processes.flatMap((p) => {
      const raw = p.steps;
      if (!Array.isArray(raw)) return [];
      return raw.map((s, i) => ({
        id: `${p.id}-${i}`,
        title: typeof s === "object" && s && "title" in s ? String((s as { title: string }).title) : `Paso ${i + 1}`,
        duration: "—",
        completed: false,
      }));
    });

    const lessons =
      steps.length > 0
        ? steps
        : [
            { id: "intro", title: "Introducción al módulo", duration: "10 min", completed: false },
            {
              id: "practice",
              title: "Práctica y evaluación",
              duration: result.module.estimatedMins
                ? `${result.module.estimatedMins} min`
                : "15 min",
              completed: false,
              current: true,
            },
          ];

    const resources = moduleDocuments.map((d) => ({
      id: d.id,
      name: d.title,
      type: d.type === "VIDEO" ? "video" : "pdf",
    }));

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
        lessons,
        resources,
        processes: processes.map((p) => p.title),
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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const check = await assertAdminSession(await auth());
    if (!check.ok) {
      return NextResponse.json(
        { error: check.error },
        { status: check.status }
      );
    }

    const organizationId = check.session.user.organizationId!;
    const { slug } = await params;
    const body = await req.json();

    const existing = await db.trainingModule.findFirst({
      where: { organizationId, slug },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Módulo no encontrado" },
        { status: 404 }
      );
    }

    const trainingModule = await db.trainingModule.update({
      where: { id: existing.id },
      data: {
        title: body.title?.trim() ?? existing.title,
        description: body.description?.trim() ?? existing.description,
        audience: body.audience?.trim() ?? existing.audience,
        estimatedMins: body.estimatedMins
          ? Number(body.estimatedMins)
          : existing.estimatedMins,
        status: body.status ?? existing.status,
      },
    });

    return NextResponse.json({ module: trainingModule });
  } catch (error) {
    console.error("[training-modules slug PATCH]", error);
    return NextResponse.json(
      { error: "No se pudo actualizar el módulo" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const check = await assertAdminSession(await auth());
    if (!check.ok) {
      return NextResponse.json(
        { error: check.error },
        { status: check.status }
      );
    }

    const organizationId = check.session.user.organizationId!;
    const { slug } = await params;

    const existing = await db.trainingModule.findFirst({
      where: { organizationId, slug },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Módulo no encontrado" },
        { status: 404 }
      );
    }

    await db.trainingModule.delete({ where: { id: existing.id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[training-modules slug DELETE]", error);
    return NextResponse.json(
      { error: "No se pudo eliminar el módulo" },
      { status: 500 }
    );
  }
}
