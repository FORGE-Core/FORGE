"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { FeedbackBanner } from "@/components/shared/feedback-banner";
import { Button } from "@/components/ui/button";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export function PushToggle() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [supported, setSupported] = useState(false);
  const [message, setMessage] = useState<{
    type: "error" | "success" | "info";
    text: string;
  } | null>(null);

  useEffect(() => {
    setSupported(
      typeof window !== "undefined" &&
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window
    );
  }, []);

  useEffect(() => {
    if (!supported) return;
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setEnabled(!!sub))
      .catch(() => {});
  }, [supported]);

  const subscribe = useCallback(async () => {
    const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapid) {
      setMessage({
        type: "info",
        text: "Push no configurado en el servidor (VAPID). Ejecuta npm run vapid:generate.",
      });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setMessage({ type: "info", text: "Permiso de notificaciones denegado." });
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapid),
      });

      const res = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub.toJSON() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "No se pudo activar");
      }
      setEnabled(true);
      setMessage({ type: "success", text: "Notificaciones activadas." });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Error al activar push",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/notifications/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "unsubscribe",
            subscription: sub.toJSON(),
          }),
        });
        await sub.unsubscribe();
      }
      setEnabled(false);
      setMessage({ type: "success", text: "Notificaciones desactivadas." });
    } catch {
      setMessage({ type: "error", text: "Error al desactivar notificaciones." });
    } finally {
      setLoading(false);
    }
  }, []);

  if (!supported) {
    return (
      <p className="text-xs text-brand-muted-gray">
        Notificaciones push no disponibles en este navegador.
      </p>
    );
  }

  const testPush = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/notifications/test", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? "Error al enviar prueba" });
      } else if (data.skipped) {
        setMessage({
          type: "info",
          text: "Configura VAPID en .env para enviar push.",
        });
      } else if (data.sent === 0) {
        setMessage({
          type: "info",
          text: "Suscripción guardada pero sin envío. Revisa permisos del navegador.",
        });
      } else {
        setMessage({ type: "success", text: "Notificación de prueba enviada." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={enabled ? "default" : "outline"}
          size="sm"
          disabled={loading}
          onClick={() => void (enabled ? unsubscribe() : subscribe())}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : enabled ? (
            <Bell className="h-4 w-4" />
          ) : (
            <BellOff className="h-4 w-4" />
          )}
          {enabled ? "Notificaciones activas" : "Activar notificaciones"}
        </Button>
        {enabled && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() => void testPush()}
          >
            Probar
          </Button>
        )}
      </div>
      {message && (
        <FeedbackBanner
          variant={
            message.type === "error"
              ? "error"
              : message.type === "success"
                ? "success"
                : "info"
          }
          message={message.text}
        />
      )}
    </div>
  );
}
