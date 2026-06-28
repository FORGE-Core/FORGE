import { checkApiRateLimit } from "@/lib/api-guard";
import { serviceErrorJsonResponse } from "@/lib/api/service-response";
import { requireTenantApi } from "@/lib/api/tenant-route";
import { adaptContentForUser } from "@/services/server/alae";
import type { AdaptRequest } from "@/lib/alae/types";

export async function POST(req: Request) {
  const tenant = await requireTenantApi();
  if (!tenant.ok) return tenant.response;

  const { userId, organizationId, role, db } = tenant.ctx;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? null;

  const guard = checkApiRateLimit(userId, ip, 30);
  if (guard.blocked) return guard.response;

  let body: AdaptRequest & { sourceId?: string; sourceType?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  try {
    const result = await adaptContentForUser(
      { organizationId, userId, role, db },
      body
    );
    return Response.json(result);
  } catch (error) {
    return serviceErrorJsonResponse(error);
  }
}
