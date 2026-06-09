import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDashboardData } from "@/lib/analytics/dashboard";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    const organizationId = session?.user?.organizationId;
    const userId = session?.user?.id;

    if (!organizationId || !userId) {
      return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });
    }

    const org = await db.organization.findUnique({
      where: { id: organizationId },
      select: { name: true },
    });

    const data = await getDashboardData(
      organizationId,
      userId,
      session.user.name,
      org?.name ?? "Tu empresa"
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error("[dashboard GET]", error);
    return NextResponse.json(
      { error: "No se pudo cargar el dashboard" },
      { status: 500 }
    );
  }
}
