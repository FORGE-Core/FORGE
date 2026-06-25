import { NextResponse } from "next/server";
import { checkApiRateLimit } from "@/lib/api-guard";
import { serviceErrorResponse } from "@/lib/api/service-response";
import { requireTenantApi } from "@/lib/api/tenant-route";
import { sendMentorMessage } from "@/services/server/chat";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const tenant = await requireTenantApi();
    if (!tenant.ok) return tenant.response;

    const guard = checkApiRateLimit(
      tenant.ctx.userId,
      req.headers.get("x-forwarded-for")?.split(",")[0] ?? null,
      40
    );
    if (guard.blocked) return guard.response;

    let body: { message?: string; conversationId?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Cuerpo JSON inválido" }, { status: 400 });
    }

    const result = await sendMentorMessage(tenant.ctx, {
      message: body.message ?? "",
      conversationId: body.conversationId,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message.includes("proveedor")) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }
    return serviceErrorResponse(error);
  }
}
