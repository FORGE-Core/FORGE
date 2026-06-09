import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { assertAdminSession } from "@/lib/auth/roles";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const organizationId = session?.user?.organizationId;

    if (!organizationId) {
      return NextResponse.json(
        { error: "Debes iniciar sesión" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const moduleId = searchParams.get("moduleId");

    const processes = await db.process.findMany({
      where: {
        organizationId,
        ...(moduleId ? { moduleId } : {}),
      },
      orderBy: { orderIndex: "asc" },
      include: {
        module: { select: { title: true, slug: true } },
        _count: { select: { documents: true } },
      },
    });

    return NextResponse.json({ processes });
  } catch (error) {
    console.error("[processes GET]", error);
    return NextResponse.json(
      { error: "No se pudieron cargar los procesos" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
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
    const { title, description, moduleId, steps } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: "Título requerido" }, { status: 400 });
    }

    const count = await db.process.count({
      where: { organizationId, moduleId: moduleId ?? null },
    });

    const process = await db.process.create({
      data: {
        organizationId,
        moduleId: moduleId || null,
        title: title.trim(),
        description: description?.trim(),
        steps: Array.isArray(steps) ? steps : [],
        orderIndex: count,
      },
    });

    return NextResponse.json({ process });
  } catch (error) {
    console.error("[processes POST]", error);
    return NextResponse.json(
      { error: "No se pudo crear el proceso" },
      { status: 500 }
    );
  }
}
