import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { assertAdminSession, canViewReports } from "@/lib/auth/roles";
import { db } from "@/lib/db";
import { getOrganizationModules } from "@/lib/training/modules";
import type { UserStatus } from "@prisma/client";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const organizationId = session?.user?.organizationId;
    const role = session?.user?.role;
    const { id } = await params;

    if (!organizationId) {
      return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });
    }

    if (!canViewReports(role)) {
      return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
    }

    const user = await db.user.findFirst({
      where: { id, organizationId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const [modules, attempts, messages] = await Promise.all([
      getOrganizationModules(organizationId, user.id),
      db.activityAttempt.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { activity: { select: { title: true, type: true } } },
      }),
      db.message.count({
        where: {
          role: "user",
          conversation: { userId: user.id, organizationId },
        },
      }),
    ]);

    const overallProgress = modules.length
      ? Math.round(modules.reduce((s, m) => s + m.progress, 0) / modules.length)
      : 0;

    return NextResponse.json({
      user,
      overallProgress,
      modules,
      recentAttempts: attempts.map((a) => ({
        id: a.id,
        title: a.activity.title,
        type: a.activity.type,
        passed: a.passed,
        score: a.score,
        at: a.createdAt,
      })),
      chatQuestions: messages,
    });
  } catch (error) {
    console.error("[users GET]", error);
    return NextResponse.json(
      { error: "No se pudo cargar el usuario" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const check = await assertAdminSession(await auth());
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const { id } = await params;
    const body = await req.json();
    const organizationId = check.session.user.organizationId!;

    const user = await db.user.findFirst({
      where: { id, organizationId },
    });
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const data: { status?: UserStatus; role?: "ADMIN" | "SUPERVISOR" | "EMPLOYEE" } =
      {};
    if (body.status) data.status = body.status as UserStatus;
    if (body.role) data.role = body.role;

    const updated = await db.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
      },
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error("[users PATCH]", error);
    return NextResponse.json(
      { error: "No se pudo actualizar el usuario" },
      { status: 500 }
    );
  }
}
