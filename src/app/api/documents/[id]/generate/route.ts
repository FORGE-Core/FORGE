import { NextResponse } from "next/server";
import { serviceErrorResponse } from "@/lib/api/service-response";
import { requireAdminApi } from "@/lib/api/tenant-route";
import { generateDocumentLearningContent } from "@/services/server/documents";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenant = await requireAdminApi();
    if (!tenant.ok) return tenant.response;

    const { id } = await params;

    let moduleId: string | undefined;
    try {
      const body = await req.json();
      moduleId = body.moduleId;
    } catch {
      /* sin body */
    }

    const result = await generateDocumentLearningContent(
      tenant.admin,
      id,
      moduleId
    );

    return NextResponse.json(result);
  } catch (error) {
    return serviceErrorResponse(error);
  }
}
