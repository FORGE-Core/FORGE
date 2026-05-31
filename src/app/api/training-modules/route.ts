import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrganizationModules } from "@/lib/training/modules";

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
