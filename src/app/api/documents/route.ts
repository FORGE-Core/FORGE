import { NextResponse } from "next/server";
import { serviceErrorResponse } from "@/lib/api/service-response";
import {
  buildOrganizationContext,
  requireAdminApi,
  requireTenantApi,
} from "@/lib/api/tenant-route";
import { listDocuments, uploadDocument } from "@/services/server/documents";

export const runtime = "nodejs";

export async function GET() {
  try {
    const tenant = await requireTenantApi();
    if (!tenant.ok) return tenant.response;

    const { canManage, documents } = await listDocuments(
      buildOrganizationContext(tenant.session)
    );

    return NextResponse.json({
      canUpload: canManage,
      canManage,
      documents,
    });
  } catch (error) {
    return serviceErrorResponse(error);
  }
}

export async function POST(req: Request) {
  try {
    const tenant = await requireAdminApi();
    if (!tenant.ok) return tenant.response;

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Selecciona un archivo PDF o video" },
        { status: 400 }
      );
    }

    const moduleId = (formData.get("moduleId") as string)?.trim() || undefined;
    const title = (formData.get("title") as string)?.trim() || undefined;
    const autoGenerate = formData.get("autoGenerate") !== "false";

    const result = await uploadDocument(tenant.admin, {
      file,
      title,
      moduleId,
      autoGenerate,
    });

    return NextResponse.json(result);
  } catch (error) {
    return serviceErrorResponse(error);
  }
}
