import { NextResponse } from "next/server";
import {
  getOrCreateAccessibilityProfile,
  serializeAccessibilityProfile,
  updateAccessibilityProfile,
} from "@/lib/alae/accessibility-profile";
import { db } from "@/lib/db";
import {
  requireAdminApi,
  requireTenantApi,
} from "@/lib/api/tenant-route";
import type { LearningModality, LearningPace } from "@prisma/client";

async function getMemberInOrg(userId: string, organizationId: string) {
  return db.user.findFirst({
    where: { id: userId, organizationId },
    select: { id: true, name: true, email: true },
  });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenant = await requireTenantApi();
    if (!tenant.ok) return tenant.response;

    const { id } = await params;
    const { organizationId, userId, role } = tenant.ctx;

    if (id !== userId && role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const member = await getMemberInOrg(id, organizationId);
    if (!member) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const profile = await getOrCreateAccessibilityProfile(id, organizationId, tenant.ctx.db);
    return NextResponse.json({
      user: member,
      profile: serializeAccessibilityProfile(profile),
    });
  } catch (error) {
    console.error("[users accessibility GET]", error);
    return NextResponse.json({ error: "Error al cargar accesibilidad" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenant = await requireAdminApi();
    if (!tenant.ok) return tenant.response;

    const { id } = await params;
    const organizationId = tenant.ctx.organizationId;

    const member = await getMemberInOrg(id, organizationId);
    if (!member) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
    }

    const profile = await updateAccessibilityProfile(id, organizationId, {
      fontScale: typeof body.fontScale === "number" ? body.fontScale : undefined,
      highContrast:
        typeof body.highContrast === "boolean" ? body.highContrast : undefined,
      darkMode: typeof body.darkMode === "boolean" ? body.darkMode : undefined,
      reduceMotion:
        typeof body.reduceMotion === "boolean" ? body.reduceMotion : undefined,
      preferredModality: body.preferredModality as LearningModality | undefined,
      simplifiedLanguage:
        typeof body.simplifiedLanguage === "boolean"
          ? body.simplifiedLanguage
          : undefined,
      stepByStepMode:
        typeof body.stepByStepMode === "boolean" ? body.stepByStepMode : undefined,
      autoReadAloud:
        typeof body.autoReadAloud === "boolean" ? body.autoReadAloud : undefined,
      captionsEnabled:
        typeof body.captionsEnabled === "boolean" ? body.captionsEnabled : undefined,
      learningPace: body.learningPace as LearningPace | undefined,
      wizardCompleted:
        typeof body.wizardCompleted === "boolean" ? body.wizardCompleted : undefined,
      assistedReadingMode:
        typeof body.assistedReadingMode === "boolean"
          ? body.assistedReadingMode
          : undefined,
    }, tenant.ctx.db);

    return NextResponse.json({
      user: member,
      profile: serializeAccessibilityProfile(profile),
    });
  } catch (error) {
    console.error("[users accessibility PATCH]", error);
    return NextResponse.json(
      { error: "No se pudo actualizar la accesibilidad" },
      { status: 500 }
    );
  }
}
