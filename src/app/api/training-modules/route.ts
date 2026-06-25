import { NextResponse } from "next/server";
import { serviceErrorResponse } from "@/lib/api/service-response";
import {
  buildOrganizationContext,
  requireAdminApi,
  requireTenantApi,
} from "@/lib/api/tenant-route";
import { createModule, listModules } from "@/services/server/training";

export async function GET() {
  try {
    const tenant = await requireTenantApi();
    if (!tenant.ok) return tenant.response;

    const modules = await listModules({
      ...buildOrganizationContext(tenant.session),
      userId: tenant.ctx.userId,
    });

    return NextResponse.json({ modules });
  } catch (error) {
    return serviceErrorResponse(error);
  }
}

export async function POST(req: Request) {
  try {
    const tenant = await requireAdminApi();
    if (!tenant.ok) return tenant.response;

    const body = await req.json();
    const trainingModule = await createModule(tenant.admin, {
      title: body.title,
      description: body.description,
      audience: body.audience,
      estimatedMins: body.estimatedMins,
      status: body.status,
    });

    return NextResponse.json({ module: trainingModule });
  } catch (error) {
    return serviceErrorResponse(error);
  }
}
