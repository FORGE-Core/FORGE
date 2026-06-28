import { NextResponse } from "next/server";
import { requireTenantApi } from "@/lib/api/tenant-route";
import { getSimulationForPage } from "@/services/server/simulations/simulation.service";

export async function GET(req: Request) {
  try {
    const tenant = await requireTenantApi();
    if (!tenant.ok) return tenant.response;

    const { searchParams } = new URL(req.url);
    const index = Math.max(0, Number(searchParams.get("index") ?? 0));

    const { simulation, total } = await getSimulationForPage(
      tenant.ctx.organizationId,
      index
    );

    return NextResponse.json({ simulation, total });
  } catch (error) {
    console.error("[simulations GET]", error);
    return NextResponse.json(
      { error: "No se pudo cargar la simulación" },
      { status: 500 }
    );
  }
}
