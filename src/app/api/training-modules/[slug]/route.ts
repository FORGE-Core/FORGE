import { NextResponse } from "next/server";
import { requireAdminApi, requireTenantApi } from "@/lib/api/tenant-route";
import { db } from "@/lib/db";
import { getModuleDetailForPage } from "@/services/server/training/module-detail.service";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const tenant = await requireTenantApi();
    if (!tenant.ok) return tenant.response;

    const { organizationId, userId, role } = tenant.ctx;
    const { slug } = await params;

    const moduleData = await getModuleDetailForPage(
      organizationId,
      userId,
      role,
      slug
    );

    if (!moduleData) {
      return NextResponse.json(
        { error: "Módulo no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ module: moduleData });
  } catch (error) {
    console.error("[training-modules slug GET]", error);
    return NextResponse.json(
      { error: "No se pudo cargar el m?dulo" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const tenant = await requireAdminApi();
    if (!tenant.ok) return tenant.response;

    const organizationId = tenant.ctx.organizationId;
    const { slug } = await params;
    const body = await req.json();

    const existing = await db.trainingModule.findFirst({
      where: { organizationId, slug },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "M?dulo no encontrado" },
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
      { error: "No se pudo actualizar el m?dulo" },
      { status: 500 }
    );
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

    const existing = await db.trainingModule.findFirst({
      where: { organizationId, slug },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "M?dulo no encontrado" },
        { status: 404 }
      );
    }

    await db.trainingModule.delete({ where: { id: existing.id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[training-modules slug DELETE]", error);
    return NextResponse.json(
      { error: "No se pudo eliminar el m?dulo" },
      { status: 500 }
    );
  }
}
