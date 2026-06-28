import { db } from "@/lib/db";

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
};

export async function savePushSubscription({
  userId,
  organizationId,
  subscription,
  userAgent,
}: {
  userId: string;
  organizationId: string;
  subscription: PushSubscriptionJSON;
  userAgent?: string;
}) {
  const keys = subscription.keys;
  if (!subscription.endpoint || !keys?.p256dh || !keys?.auth) {
    throw new Error("Suscripción push inválida");
  }

  return db.pushSubscription.upsert({
    where: {
      userId_endpoint: {
        userId,
        endpoint: subscription.endpoint,
      },
    },
    create: {
      userId,
      organizationId,
      endpoint: subscription.endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      userAgent,
    },
    update: {
      p256dh: keys.p256dh,
      auth: keys.auth,
      userAgent,
    },
  });
}

export async function removePushSubscription(
  userId: string,
  endpoint: string
) {
  await db.pushSubscription.deleteMany({
    where: { userId, endpoint },
  });
}

/** Push deshabilitado en la app ligera — conserva la API sin enviar notificaciones. */
export async function sendPushToUser(_userId: string, _payload: PushPayload) {
  return { sent: 0, skipped: true };
}

export async function notifyLearningEvent({
  organizationId,
  eventType,
  title: _title,
  body: _body,
  url: _url,
}: {
  userId: string;
  organizationId: string;
  eventType: string;
  title: string;
  body: string;
  url?: string;
}) {
  const org = await db.organization.findUnique({
    where: { id: organizationId },
    select: { settings: true },
  });
  const settings = (org?.settings ?? {}) as {
    notifications?: { pushEnabled?: boolean };
  };
  if (settings.notifications?.pushEnabled === false) return;
  void eventType;
}
