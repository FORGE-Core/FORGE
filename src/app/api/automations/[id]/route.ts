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
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const organizationId = check.session.user.organizationId!;
    const { id } = await params;
    const body = await req.json();

    const existing = await db.automation.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    const automation = await db.automation.update({
      where: { id },
      data: {
        name: body.name?.trim() ?? existing.name,
        isActive: body.isActive ?? existing.isActive,
        config: body.config ?? existing.config,
      },
    });

    return NextResponse.json({ automation });
  } catch (error) {
    console.error("[automations PATCH]", error);
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const check = await assertAdminSession(await auth());
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const organizationId = check.session.user.organizationId!;
    const { id } = await params;

    const existing = await db.automation.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    await db.automation.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[automations DELETE]", error);
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}
