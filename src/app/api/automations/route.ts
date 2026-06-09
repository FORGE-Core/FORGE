import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { assertAdminSession } from "@/lib/auth/roles";
import { db } from "@/lib/db";
import type { AutomationTrigger } from "@prisma/client";

export async function GET() {
  try {
    const check = await assertAdminSession(await auth());
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const automations = await db.automation.findMany({
      where: { organizationId: check.session.user.organizationId! },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ automations });
  } catch (error) {
    console.error("[automations GET]", error);
    return NextResponse.json({ error: "Error al cargar" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const check = await assertAdminSession(await auth());
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const body = await req.json();
    const { name, trigger, config, isActive } = body;

    if (!name?.trim() || !trigger) {
      return NextResponse.json(
        { error: "Nombre y trigger requeridos" },
        { status: 400 }
      );
    }

    const automation = await db.automation.create({
      data: {
        organizationId: check.session.user.organizationId!,
        name: name.trim(),
        trigger: trigger as AutomationTrigger,
        config: config ?? {},
        isActive: isActive !== false,
      },
    });

    return NextResponse.json({ automation });
  } catch (error) {
    console.error("[automations POST]", error);
    return NextResponse.json({ error: "Error al crear" }, { status: 500 });
  }
}
