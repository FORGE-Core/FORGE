import { NextResponse } from "next/server";
import { serviceErrorResponse } from "@/lib/api/service-response";
import { requireTenantApi } from "@/lib/api/tenant-route";
import { getActivityAtIndex } from "@/services/server/training";

export async function GET(req: Request) {
  try {
    const tenant = await requireTenantApi();
    if (!tenant.ok) return tenant.response;

    const { searchParams } = new URL(req.url);
    const moduleId = searchParams.get("moduleId");
    const index = Number(searchParams.get("index") ?? 0);

    const result = await getActivityAtIndex(tenant.ctx, { moduleId, index });
    return NextResponse.json(result);
  } catch (error) {
    return serviceErrorResponse(error);
  }
}
