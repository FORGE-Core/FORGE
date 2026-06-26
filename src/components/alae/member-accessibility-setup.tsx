"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Volume2 } from "lucide-react";
import { clampFontScale } from "@/lib/alae/dom-effects";
import type { AccessibilityProfileData } from "@/lib/alae/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usersClient } from "@/services/client";
import { ApiClientError } from "@/services/client/http";

type MemberAccessibilitySetupProps = {
  userId: string;
  userName: string;
};

export function MemberAccessibilitySetup({
  userId,
  userName,
}: MemberAccessibilitySetupProps) {
  const [profile, setProfile] = useState<AccessibilityProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await usersClient.getAccessibility(userId);
      setProfile(data.profile as AccessibilityProfileData);
      setMessage(null);
    } catch (err) {
      setMessage(
        err instanceof ApiClientError ? err.message : "Error al cargar"
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function setAssistedReading(enabled: boolean) {
    setSaving(true);
    setMessage(null);
    try {
      const patch = enabled
        ? {
            assistedReadingMode: true,
            darkMode: true,
            highContrast: false,
            autoReadAloud: true,
            reduceMotion: true,
            wizardCompleted: true,
            voiceInputEnabled: true,
            fontScale: clampFontScale(
              Math.max(profile?.fontScale ?? 1, 1.25)
            ),
          }
        : { assistedReadingMode: false };

      const data = await usersClient.updateAccessibility(userId, patch);
      setProfile(data.profile as AccessibilityProfileData);
      setMessage(
        enabled
          ? `Modo lectura activado para ${userName}. Al iniciar sesión lo tendrá listo.`
          : `Modo lectura desactivado para ${userName}.`
      );
    } catch (err) {
      setMessage(
        err instanceof ApiClientError ? err.message : "Error al guardar"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <p className="flex items-center gap-2 text-sm text-brand-muted-gray">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando accesibilidad…
      </p>
    );
  }

  const active = profile?.assistedReadingMode ?? false;

  return (
    <Card className="border-brand-cobalt/25">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Volume2 className="h-5 w-5 text-brand-cobalt" aria-hidden />
          Accesibilidad para {userName}
        </CardTitle>
        <p className="text-sm text-brand-muted-gray">
          Configura el modo lectura por voz para esta persona. No necesita ver
          la pantalla: al entrar, FORGE leerá los menús en voz alta.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm">
          Estado actual:{" "}
          <strong>{active ? "Modo lectura activo" : "Modo estándar"}</strong>
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            disabled={saving || active}
            onClick={() => void setAssistedReading(true)}
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Activar modo para baja visión
          </Button>
          <Button
            variant="outline"
            disabled={saving || !active}
            onClick={() => void setAssistedReading(false)}
          >
            Desactivar
          </Button>
        </div>
        {message && (
          <p
            className={`text-sm ${message.includes("Error") ? "text-red-600" : "text-emerald-700"}`}
          >
            {message}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
