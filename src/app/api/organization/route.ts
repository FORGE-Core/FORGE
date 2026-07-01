import { NextResponse } from "next/server";
import { serviceErrorResponse } from "@/lib/api/service-response";
import {
  buildOrganizationContext,
  requireAdminApi,
  requireTenantApi,
} from "@/lib/api/tenant-route";
import { getOrganization, updateOrganization } from "@/services/server/organization";

export async function GET() {
  try {
    const tenant = await requireTenantApi();
    if (!tenant.ok) return tenant.response;

    const data = await getOrganization(
      buildOrganizationContext(tenant.session)
    );
    return NextResponse.json(data);
  } catch (error) {
    return serviceErrorResponse(error);
  }
}

export async function PATCH(req: Request) {
  try {
    const tenant = await requireAdminApi();
    if (!tenant.ok) return tenant.response;

    const body = await req.json();
    const organization = await updateOrganization(tenant.admin, {
      name: body.name,
      industry: body.industry,
      plan: body.plan,
      notifications: body.notifications,
      alae: body.alae,
      branding: body.branding,
    });

    return NextResponse.json({ organization });
  } catch (error) {
    return serviceErrorResponse(error);
  }
}
