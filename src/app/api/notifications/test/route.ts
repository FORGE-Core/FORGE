import { auth } from "@/auth";
import { sendPushToUser } from "@/lib/notifications/push";

export async function POST() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const result = await sendPushToUser(userId, {
    title: "FORGE — Prueba",
    body: "Las notificaciones push funcionan correctamente.",
    url: "/dashboard",
    tag: "test",
  });

  return Response.json(result);
}
