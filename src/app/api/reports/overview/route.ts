import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getReportsOverview } from "@/lib/analytics/reports";
import { canViewReports } from "@/lib/auth/roles";

export async function GET() {
  try {
    const session = await auth();
    const organizationId = session?.user?.organizationId;
    const role = session?.user?.role;

    if (!organizationId) {
      return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });
    }

    if (!canViewReports(role)) {
      return NextResponse.json(
        { error: "No tienes permiso para ver reportes" },
        { status: 403 }
      );
    }

    const data = await getReportsOverview(organizationId, role);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[reports/overview GET]", error);
    return NextResponse.json(
      { error: "No se pudieron cargar los reportes" },
      { status: 500 }
    );
  }
}
