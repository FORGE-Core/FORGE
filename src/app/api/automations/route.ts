import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/api/tenant-route";
import type { AutomationTrigger } from "@prisma/client";

export async function GET() {
  try {
    const tenant = await requireAdminApi();
    if (!tenant.ok) return tenant.response;

    const automations = await db.automation.findMany({
      where: { organizationId: tenant.ctx.organizationId },
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
    const tenant = await requireAdminApi();
    if (!tenant.ok) return tenant.response;

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
        organizationId: tenant.ctx.organizationId,
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
