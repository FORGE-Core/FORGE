import { NextResponse } from "next/server";
import { serviceErrorResponse } from "@/lib/api/service-response";
import { requireTenantApi } from "@/lib/api/tenant-route";
import { getConversation } from "@/services/server/chat";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenant = await requireTenantApi();
    if (!tenant.ok) return tenant.response;

    const { id } = await params;
    const conversation = await getConversation(tenant.ctx, id);

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        title: conversation.title,
        messages: conversation.messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          sources: m.sources,
          createdAt: m.createdAt,
        })),
      },
    });
  } catch (error) {
    return serviceErrorResponse(error);
  }
}
