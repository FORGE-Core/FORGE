import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { assertAdminSession } from "@/lib/auth/roles";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    const organizationId = session?.user?.organizationId;

    if (!organizationId) {
      return NextResponse.json(
        { error: "Debes iniciar sesión" },
        { status: 401 }
      );
    }

    const [org, activeUsers, moduleCount, documentCount] = await Promise.all([
      db.organization.findUnique({
        where: { id: organizationId },
        select: {
          id: true,
          name: true,
          slug: true,
          industry: true,
          logoUrl: true,
          settings: true,
        },
      }),
      db.user.count({
        where: { organizationId, status: "ACTIVE" },
      }),
      db.trainingModule.count({
        where: { organizationId, status: "PUBLISHED" },
      }),
      db.document.count({ where: { organizationId } }),
    ]);

    if (!org) {
      return NextResponse.json(
        { error: "Organización no encontrada" },
        { status: 404 }
      );
    }

    const settings = (org.settings ?? {}) as Record<string, unknown>;
    const plan = (settings.plan as string) ?? "starter";

    return NextResponse.json({
      organization: {
        ...org,
        plan,
        stats: {
          activeUsers,
          moduleCount,
          documentCount,
        },
      },
      canManage: session?.user?.role === "ADMIN",
    });
  } catch (error) {
    console.error("[organization GET]", error);
    return NextResponse.json(
      { error: "No se pudo cargar la organización" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const check = await assertAdminSession(await auth());
    if (!check.ok) {
      return NextResponse.json(
        { error: check.error },
        { status: check.status }
      );
    }

    const organizationId = check.session.user.organizationId!;
    const body = await req.json();

    const org = await db.organization.findUnique({
      where: { id: organizationId },
    });

    if (!org) {
      return NextResponse.json(
        { error: "Organización no encontrada" },
        { status: 404 }
      );
    }

    const currentSettings = (org.settings ?? {}) as Record<string, unknown>;
    const nextSettings = { ...currentSettings };

    if (body.plan) nextSettings.plan = body.plan;
    if (body.notifications) {
      nextSettings.notifications = {
        ...(currentSettings.notifications as object),
        ...body.notifications,
      };
    }
    if (body.alae) {
      nextSettings.alae = {
        ...(currentSettings.alae as object),
        ...body.alae,
      };
    }

    const updated = await db.organization.update({
      where: { id: organizationId },
      data: {
        name: body.name?.trim() || org.name,
        industry: body.industry?.trim() || org.industry,
        settings: nextSettings as Prisma.InputJsonValue,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        industry: true,
        settings: true,
      },
    });

    return NextResponse.json({ organization: updated });
  } catch (error) {
    console.error("[organization PATCH]", error);
    return NextResponse.json(
      { error: "No se pudo actualizar la organización" },
      { status: 500 }
    );
  }
}
