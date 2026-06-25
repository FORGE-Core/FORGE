import { NextResponse } from "next/server";
import { serviceErrorResponse } from "@/lib/api/service-response";
import { requireTenantApi } from "@/lib/api/tenant-route";
import { listConversations } from "@/services/server/chat";

export async function GET() {
  try {
    const tenant = await requireTenantApi();
    if (!tenant.ok) return tenant.response;

    const conversations = await listConversations(tenant.ctx);
    return NextResponse.json({ conversations });
  } catch (error) {
    return serviceErrorResponse(error);
  }
}
