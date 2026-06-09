"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, FileText, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentUploadZone } from "@/components/documents/document-upload-zone";

const steps = [
  {
    id: 1,
    title: "Sube tu primer manual",
    desc: "PDF operativo de tu empresa. La IA lo indexará y generará contenido.",
    icon: FileText,
  },
  {
    id: 2,
    title: "Invita a tu equipo",
    desc: "Crea cuentas para empleados y supervisores.",
    icon: Users,
  },
  {
    id: 3,
    title: "Activa el mentor IA",
    desc: "Prueba preguntas sobre procesos con fuentes oficiales.",
    icon: Sparkles,
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [done, setDone] = useState<number[]>([]);

  async function completeOnboarding() {
    await fetch("/api/organization", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        notifications: { onboardingCompleted: true },
      }),
    });
    router.push("/dashboard");
  }

  function markDone(id: number) {
    setDone((d) => (d.includes(id) ? d : [...d, id]));
    if (id < 3) setStep(id + 1);
  }

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

      <div className="flex justify-center gap-2">
        {steps.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStep(s.id)}
            className={`h-2 w-12 rounded-full transition-colors ${
              step === s.id
                ? "gradient-brand"
                : done.includes(s.id)
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
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-brand-muted-gray">
            {steps[step - 1].desc}
          </p>

          {step === 1 && (
            <>
              <DocumentUploadZone
                onUploaded={() => markDone(1)}
              />
              <Button variant="outline" onClick={() => markDone(1)}>
                Omitir por ahora
              </Button>
            </>
          )}

          {step === 2 && (
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => router.push("/dashboard/team")}>
                Ir a equipo
              </Button>
              <Button variant="outline" onClick={() => markDone(2)}>
                Continuar
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => router.push("/dashboard/chat")}>
                Probar mentor IA
              </Button>
              <Button onClick={completeOnboarding}>
                <CheckCircle2 className="h-4 w-4" />
                Finalizar onboarding
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
