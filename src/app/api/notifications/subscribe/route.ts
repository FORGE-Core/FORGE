import {
  removePushSubscription,
  savePushSubscription,
} from "@/lib/notifications/push";
import { requireTenantApi } from "@/lib/api/tenant-route";

export async function POST(req: Request) {
  const tenant = await requireTenantApi();
  if (!tenant.ok) return tenant.response;

  const { userId, organizationId } = tenant.ctx;

  let body: { subscription?: PushSubscriptionJSON; action?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (body.action === "unsubscribe" && body.subscription?.endpoint) {
    await removePushSubscription(userId, body.subscription.endpoint);
    return Response.json({ ok: true });
  }

  if (!body.subscription) {
    return Response.json({ error: "subscription requerida" }, { status: 400 });
  }

  await savePushSubscription({
    userId,
    organizationId,
    subscription: body.subscription,
    userAgent: req.headers.get("user-agent") ?? undefined,
  });

  return Response.json({ ok: true });
}
