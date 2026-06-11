import { auth } from "@/auth";
import { checkApiRateLimit } from "@/lib/api-guard";
import {
  auditContentInclusion,
  saveInclusionAudit,
} from "@/lib/alae/inclusion-scorer";
import { canViewReports } from "@/lib/auth/roles";

export async function POST(req: Request) {
  const session = await auth();
  const organizationId = session?.user?.organizationId;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? null;

  const guard = checkApiRateLimit(session?.user?.id, ip, 20);
  if (guard.blocked) return guard.response;

  if (!organizationId) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

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
  const session = await auth();
  const organizationId = session?.user?.organizationId;
  const role = session?.user?.role;

  if (!organizationId || !canViewReports(role)) {
    return Response.json({ error: "No autorizado" }, { status: 403 });
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
