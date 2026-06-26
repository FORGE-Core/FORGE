"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Circle,
  FileText,
  Loader2,
  Sparkles,
  Users,
} from "lucide-react";
import { FeedbackBanner } from "@/components/shared/feedback-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentUploadZone } from "@/components/documents/document-upload-zone";
import { onboardingClient, organizationClient } from "@/services/client";
import { ApiClientError } from "@/services/client/http";
import { writeOnboardingCache } from "@/lib/onboarding/client-cache";

const steps = [
  {
    id: 1,
    key: "documents" as const,
    title: "Sube tu primer manual",
    desc: "PDF operativo de tu empresa. La IA lo indexará y generará contenido.",
    icon: FileText,
  },
  {
    id: 2,
    key: "team" as const,
    title: "Invita a tu equipo",
    desc: "Crea cuentas para empleados y supervisores.",
    icon: Users,
  },
  {
    id: 3,
    key: "chat" as const,
    title: "Activa el mentor IA",
    desc: "Prueba preguntas sobre procesos con fuentes oficiales.",
    icon: Sparkles,
  },
];

type OnboardingStatus = {
  completed: boolean;
  steps: { documents: boolean; team: boolean; chat: boolean };
  isAdmin: boolean;
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const data = await onboardingClient.getStatus();
      setStatus(data);
      if (data.completed) {
        router.replace("/home");
        return;
      }
      if (!data.steps.documents) setStep(1);
      else if (!data.steps.team) setStep(2);
      else if (!data.steps.chat) setStep(3);
    } catch (err) {
      setError(
        err instanceof ApiClientError ? err.message : "Error de conexión"
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  async function completeOnboarding() {
    setSaving(true);
    setError(null);
    try {
      await organizationClient.update({
        notifications: { onboardingCompleted: true },
      });
      writeOnboardingCache("complete");
      router.push("/home");
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "No se pudo finalizar el onboarding"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <p className="flex items-center gap-2 text-sm text-brand-muted-gray">
        <Loader2 className="h-4 w-4 animate-spin" />
        Preparando configuración…
      </p>
    );
  }

  if (!status?.isAdmin) {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-12 text-center">
        <h1 className="font-heading text-2xl font-bold">Onboarding</h1>
        <p className="text-brand-muted-gray">
          La configuración inicial la realiza el administrador de tu empresa.
        </p>
        <Button onClick={() => router.push("/home")}>Ir al dashboard</Button>
      </div>
    );
  }

  const stepDone = (key: keyof OnboardingStatus["steps"]) =>
    status?.steps[key] ?? false;

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-8">
      <div className="text-center">
        <h1 className="font-heading text-3xl font-bold">
          Configura tu empresa en FORGE
        </h1>
        <p className="mt-2 text-brand-muted-gray">
          Tres pasos para tener capacitación con IA funcionando hoy.
        </p>
      </div>

      {error && <FeedbackBanner variant="error" message={error} />}

      <div className="flex justify-center gap-2">
        {steps.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStep(s.id)}
            className={`h-2 w-12 rounded-full transition-colors ${
              step === s.id
                ? "gradient-brand"
                : stepDone(s.key)
                  ? "bg-emerald-400"
                  : "bg-black/10"
            }`}
            aria-label={`Paso ${s.id}`}
          />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {(() => {
              const Icon = steps[step - 1].icon;
              return <Icon className="h-5 w-5 text-brand-cobalt" />;
            })()}
            Paso {step}: {steps[step - 1].title}
            {stepDone(steps[step - 1].key) && (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-brand-muted-gray">
            {steps[step - 1].desc}
          </p>

          <ul className="space-y-2 text-sm">
            {steps.map((s) => (
              <li key={s.key} className="flex items-center gap-2">
                {stepDone(s.key) ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Circle className="h-4 w-4 text-brand-muted-gray/40" />
                )}
                <span
                  className={
                    stepDone(s.key) ? "text-emerald-800" : "text-brand-muted-gray"
                  }
                >
                  {s.title}
                </span>
              </li>
            ))}
          </ul>

          {step === 1 && (
            <>
              <DocumentUploadZone
                onUploaded={() => {
                  void loadStatus();
                  setStep(2);
                }}
              />
              <Button variant="outline" onClick={() => setStep(2)}>
                Continuar sin subir ahora
              </Button>
            </>
          )}

          {step === 2 && (
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => router.push("/team")}>
                Ir a equipo
              </Button>
              <Button variant="outline" onClick={() => setStep(3)}>
                Continuar
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => router.push("/chat")}>
                Probar mentor IA
              </Button>
              <Button onClick={completeOnboarding} disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Finalizar onboarding
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
