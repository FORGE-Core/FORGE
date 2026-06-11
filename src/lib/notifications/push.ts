import { db } from "@/lib/db";
import { getEnv } from "@/lib/env";

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

export async function sendPushToUser(
  userId: string,
  payload: PushPayload
) {
  const publicKey = getEnv("NEXT_PUBLIC_VAPID_PUBLIC_KEY");
  const privateKey = getEnv("VAPID_PRIVATE_KEY");
  const subject = getEnv("VAPID_SUBJECT") ?? "mailto:admin@forge.app";

  if (!publicKey || !privateKey) {
    console.warn("[push] VAPID no configurado — notificación omitida");
    return { sent: 0, skipped: true };
  }

  const subs = await db.pushSubscription.findMany({ where: { userId } });
  if (subs.length === 0) return { sent: 0, skipped: false };

  let webpush: typeof import("web-push");
  try {
    webpush = await import("web-push");
    webpush.setVapidDetails(subject, publicKey, privateKey);
  } catch {
    console.warn("[push] web-push no disponible");
    return { sent: 0, skipped: true };
  }

  let sent = 0;
  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        JSON.stringify(payload)
      );
      sent++;
    } catch (err) {
      console.warn("[push] fallo envío:", err);
      if (
        err instanceof Object &&
        "statusCode" in err &&
        (err as { statusCode: number }).statusCode === 410
      ) {
        await db.pushSubscription.delete({ where: { id: sub.id } });
      }
    }
  }

  return { sent, skipped: false };
}

export async function notifyLearningEvent({
  userId,
  organizationId,
  eventType,
  title,
  body,
  url,
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

  await sendPushToUser(userId, {
    title,
    body,
    url: url ?? "/dashboard",
    tag: eventType,
  });
}
