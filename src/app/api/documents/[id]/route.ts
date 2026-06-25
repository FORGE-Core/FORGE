import { NextResponse } from "next/server";
import { serviceErrorResponse } from "@/lib/api/service-response";
import { requireAdminApi } from "@/lib/api/tenant-route";
import { deleteDocument } from "@/services/server/documents";

export const runtime = "nodejs";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenant = await requireAdminApi();
    if (!tenant.ok) return tenant.response;

    const { id } = await params;
    const result = await deleteDocument(tenant.admin, id);
    return NextResponse.json(result);
  } catch (error) {
    return serviceErrorResponse(error);
  }
}
