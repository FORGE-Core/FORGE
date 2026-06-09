import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { assertAdminSession } from "@/lib/auth/roles";
import { db } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
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
    const { id } = await params;
    const body = await req.json();

    const existing = await db.process.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Proceso no encontrado" },
        { status: 404 }
      );
    }

    const process = await db.process.update({
      where: { id },
      data: {
        title: body.title?.trim() ?? existing.title,
        description: body.description?.trim() ?? existing.description,
        steps: body.steps ?? existing.steps,
        moduleId: body.moduleId ?? existing.moduleId,
      },
    });

    return NextResponse.json({ process });
  } catch (error) {
    console.error("[processes PATCH]", error);
    return NextResponse.json(
      { error: "No se pudo actualizar el proceso" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
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
    const { id } = await params;

    const existing = await db.process.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Proceso no encontrado" },
        { status: 404 }
      );
    }

    await db.process.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[processes DELETE]", error);
    return NextResponse.json(
      { error: "No se pudo eliminar el proceso" },
      { status: 500 }
    );
  }
}
