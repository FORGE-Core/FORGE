import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { assertAdminSession, canViewReports } from "@/lib/auth/roles";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const session = await auth();
    const organizationId = session?.user?.organizationId;
    const role = session?.user?.role;

    if (!organizationId) {
      return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });
    }

    if (!canViewReports(role)) {
      return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
    }

    const users = await db.user.findMany({
      where: { organizationId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            progress: true,
            activityAttempts: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("[users GET]", error);
    return NextResponse.json(
      { error: "No se pudieron cargar los usuarios" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const check = await assertAdminSession(await auth());
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const body = await req.json();
    const email = (body.email as string)?.trim().toLowerCase();
    const name = (body.name as string)?.trim();
    const password = body.password as string;
    const role = (body.role as string) ?? "EMPLOYEE";

    if (!email || !password || password.length < 6) {
      return NextResponse.json(
        { error: "Email y contraseña (mín. 6) son obligatorios" },
        { status: 400 }
      );
    }

    const exists = await db.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: "El email ya está registrado" }, { status: 409 });
    }

    const user = await db.user.create({
      data: {
        email,
        name: name || null,
        passwordHash: await bcrypt.hash(password, 10),
        role: role as "ADMIN" | "SUPERVISOR" | "EMPLOYEE",
        status: "ACTIVE",
        organizationId: check.session.user.organizationId!,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("[users POST]", error);
    return NextResponse.json(
      { error: "No se pudo crear el usuario" },
      { status: 500 }
    );
  }
}
