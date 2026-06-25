import { NextResponse } from "next/server";
import { serviceErrorResponse } from "@/lib/api/service-response";
import { requireAdminApi } from "@/lib/api/tenant-route";
import { deleteProcess, updateProcess } from "@/services/server/processes";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenant = await requireAdminApi();
    if (!tenant.ok) return tenant.response;

    const { id } = await params;
    const body = await req.json();

    const process = await updateProcess(tenant.admin, id, {
      title: body.title,
      description: body.description,
      moduleId: body.moduleId,
      steps: body.steps,
    });

    return NextResponse.json({ process });
  } catch (error) {
    return serviceErrorResponse(error);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenant = await requireAdminApi();
    if (!tenant.ok) return tenant.response;

    const { id } = await params;
    const result = await deleteProcess(tenant.admin, id);
    return NextResponse.json(result);
  } catch (error) {
    return serviceErrorResponse(error);
  }
}
