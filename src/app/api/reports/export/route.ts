import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getReportsOverview } from "@/lib/analytics/reports";
import { canViewReports } from "@/lib/auth/roles";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    const organizationId = session?.user?.organizationId;
    const role = session?.user?.role;

    if (!organizationId) {
      return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });
    }

    if (!canViewReports(role)) {
      return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
    }

    const overview = await getReportsOverview(organizationId, role);
    if (!overview) {
      return NextResponse.json({ error: "Sin datos" }, { status: 404 });
    }

    const users = await db.user.findMany({
      where: { organizationId, status: "ACTIVE" },
      select: {
        name: true,
        email: true,
        role: true,
        progress: {
          include: { module: { select: { title: true } } },
        },
      },
    });

    const rows: string[][] = [
      ["FORGE — Reporte de capacitación"],
      ["Generado", new Date().toISOString()],
      [],
      ["Métrica", "Valor", "Detalle"],
      ...overview.metrics.map((m) => [m.label, m.value, m.change]),
      [],
      ["Hallazgos"],
      ...overview.insights.map((i) => [i]),
      [],
      ["Recomendaciones"],
      ...overview.recommendations.map((r) => [r]),
      [],
      ["Empleado", "Email", "Rol", "Módulo", "Progreso %"],
    ];

    for (const u of users) {
      if (u.progress.length === 0) {
        rows.push([u.name ?? "", u.email, u.role, "—", "0"]);
      } else {
        for (const p of u.progress) {
          rows.push([
            u.name ?? "",
            u.email,
            u.role,
            p.module.title,
            String(Math.round(p.percentComplete)),
          ]);
        }
      }
    }

    const csv = rows
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="forge-reporte-${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    console.error("[reports/export]", error);
    return NextResponse.json({ error: "Error al exportar" }, { status: 500 });
  }
}
