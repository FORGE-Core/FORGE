import { sendPushToUser } from "@/lib/notifications/push";
import { requireTenantApi } from "@/lib/api/tenant-route";

export async function POST() {
  const tenant = await requireTenantApi();
  if (!tenant.ok) return tenant.response;

  const result = await sendPushToUser(tenant.ctx.userId, {
    title: "FORGE — Prueba",
    body: "Las notificaciones push funcionan correctamente.",
    url: "/home",
    tag: "test",
  });

  return Response.json(result);
}
