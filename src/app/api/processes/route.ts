import { NextResponse } from "next/server";
import { serviceErrorResponse } from "@/lib/api/service-response";
import {
  buildOrganizationContext,
  requireAdminApi,
  requireTenantApi,
} from "@/lib/api/tenant-route";
import { createProcess, listProcesses } from "@/services/server/processes";

export async function GET(req: Request) {
  try {
    const tenant = await requireTenantApi();
    if (!tenant.ok) return tenant.response;

    const { searchParams } = new URL(req.url);
    const moduleId = searchParams.get("moduleId");

    const processes = await listProcesses(
      buildOrganizationContext(tenant.session),
      moduleId
    );

    return NextResponse.json({ processes });
  } catch (error) {
    return serviceErrorResponse(error);
  }
}

export async function POST(req: Request) {
  try {
    const tenant = await requireAdminApi();
    if (!tenant.ok) return tenant.response;

    const body = await req.json();
    const process = await createProcess(tenant.admin, {
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
