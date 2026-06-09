import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { assertAdminSession } from "@/lib/auth/roles";
import { db } from "@/lib/db";
import { getOrganizationModules } from "@/lib/training/modules";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export async function GET() {
  try {
    const session = await auth();
    const organizationId = session?.user?.organizationId;
    const userId = session?.user?.id;

    if (!organizationId) {
      return NextResponse.json(
        { error: "Debes iniciar sesión" },
        { status: 401 }
      );
    }

    const modules = await getOrganizationModules(organizationId, userId);

    return NextResponse.json({ modules });
  } catch (error) {
    console.error("[training-modules GET]", error);
    return NextResponse.json(
      { error: "No se pudieron cargar los módulos" },
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
    const title = body.title?.trim();

    if (!title) {
      return NextResponse.json({ error: "Título requerido" }, { status: 400 });
    }

    const baseSlug = slugify(title) || `modulo-${Date.now()}`;
    let slug = baseSlug;
    let suffix = 1;
    while (
      await db.trainingModule.findFirst({
        where: { organizationId, slug },
      })
    ) {
      slug = `${baseSlug}-${suffix++}`;
    }

    const count = await db.trainingModule.count({ where: { organizationId } });

    const trainingModule = await db.trainingModule.create({
      data: {
        organizationId,
        slug,
        title,
        description: body.description?.trim(),
        audience: body.audience?.trim(),
        estimatedMins: body.estimatedMins ? Number(body.estimatedMins) : 20,
        status: body.status === "DRAFT" ? "DRAFT" : "PUBLISHED",
        orderIndex: count,
      },
    });

    return NextResponse.json({ module: trainingModule });
  } catch (error) {
    console.error("[training-modules POST]", error);
    return NextResponse.json(
      { error: "No se pudo crear el módulo" },
      { status: 500 }
    );
  }
}
