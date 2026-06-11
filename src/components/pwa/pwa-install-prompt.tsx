"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};

export function PwaInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null
  );
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!deferred || dismissed) return null;

  return (
    <div
      className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border border-brand-cobalt/20 bg-white p-4 shadow-xl"
      role="dialog"
      aria-label="Instalar aplicación"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-heading font-semibold">Instala FORGE</p>
          <p className="mt-1 text-sm text-brand-muted-gray">
            Accede más rápido desde tu pantalla de inicio, como una app móvil.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Cerrar"
          className="rounded-lg p-1 hover:bg-brand-light-bg"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <Button
        className="mt-3 w-full"
        onClick={async () => {
          await deferred.prompt();
          setDeferred(null);
          setDismissed(true);
        }}
      >
        <Download className="h-4 w-4" />
        Instalar app
      </Button>
    </div>
  );
}
