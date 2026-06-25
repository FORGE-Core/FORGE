import { checkApiRateLimit } from "@/lib/api-guard";
import {
  auditContentInclusion,
  saveInclusionAudit,
} from "@/lib/alae/inclusion-scorer";
import { canViewReports } from "@/lib/auth/roles";
import {
  requireTenantApi,
  tenantAuthJsonError,
} from "@/lib/api/tenant-route";

export async function POST(req: Request) {
  const tenant = await requireTenantApi();
  if (!tenant.ok) return tenant.response;

  const { organizationId, userId } = tenant.ctx;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? null;

  const guard = checkApiRateLimit(userId, ip, 20);
  if (guard.blocked) return guard.response;

  let body: {
    text?: string;
    targetType?: string;
    targetId?: string;
    useAi?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!body.text?.trim() || !body.targetType || !body.targetId) {
    return Response.json(
      { error: "text, targetType y targetId son requeridos" },
      { status: 400 }
    );
  }

  const result = await auditContentInclusion(body.text, body.useAi !== false);
  const audit = await saveInclusionAudit({
    organizationId,
    targetType: body.targetType,
    targetId: body.targetId,
    result,
  });

  return Response.json({ audit, result });
}

export async function GET(req: Request) {
  const tenant = await requireTenantApi();
  if (!tenant.ok) return tenant.response;

  const { organizationId, role } = tenant.ctx;
  if (!canViewReports(role)) {
    return tenantAuthJsonError({
      ok: false,
      status: 403,
      error: "No autorizado",
    });
  }

  const targetId = new URL(req.url).searchParams.get("targetId");
  const targetType = new URL(req.url).searchParams.get("targetType");

  const { db } = await import("@/lib/db");
  const audits = await db.inclusionAudit.findMany({
    where: {
      organizationId,
      ...(targetId ? { targetId } : {}),
      ...(targetType ? { targetType } : {}),
    },
    orderBy: { auditedAt: "desc" },
    take: 10,
  });

  return Response.json({ audits });
}
