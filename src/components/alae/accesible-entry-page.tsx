"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Volume2 } from "lucide-react";
import { clampFontScale } from "@/lib/alae/dom-effects";
import { speakText } from "@/lib/alae/speech";
import { Button } from "@/components/ui/button";
import { useAccessibility } from "./accessibility-provider";

const INTRO =
  "Bienvenido a FORGE. Esta página activa el modo lectura por voz. " +
  "Presiona Enter en el botón grande. Podrás dictar correo y contraseña con el micrófono en el login. " +
  "Atajo: Alt, Mayús y L.";

export function AccesibleEntryPage() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { assistedReadingMode, updatePreferences, fontScale, loading } =
    useAccessibility();

  useEffect(() => {
    buttonRef.current?.focus();
  }, []);

  async function activate() {
    await updatePreferences({
      assistedReadingMode: true,
      fontScale: clampFontScale(Math.max(fontScale, 1.25)),
      darkMode: true,
      highContrast: false,
      autoReadAloud: true,
      reduceMotion: true,
      wizardCompleted: true,
      voiceInputEnabled: true,
    });
    void speakText(
      "Modo activado. " + INTRO + " Ahora puedes ir a iniciar sesión."
    );
  }

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="main-content-area flex min-h-screen flex-col items-center justify-center px-4 py-12"
    >
      <div className="w-full max-w-lg space-y-8 text-center">
        <h1 className="font-heading text-3xl font-bold md:text-4xl">
          Acceso con lectura por voz
        </h1>
        <p className="text-lg text-brand-muted-gray">
          Para personas con baja visión o ceguera. No necesitas instalar
          programas: solo el navegador.
        </p>

        <button
          ref={buttonRef}
          type="button"
          disabled={loading}
          onClick={() => void activate()}
          aria-pressed={assistedReadingMode}
          className="flex w-full flex-col items-center gap-4 rounded-3xl border-4 border-brand-cobalt bg-brand-cobalt px-8 py-10 text-white shadow-lg transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-lavender focus-visible:ring-offset-4"
        >
          <Volume2 className="h-14 w-14" aria-hidden />
          <span className="font-heading text-2xl font-bold">
            {assistedReadingMode
              ? "Modo activo — pulsa para confirmar"
              : "Activar modo lectura por voz"}
          </span>
          <span className="text-sm text-white/90">
            Un clic activa voz y micrófono. Atajo: Alt + Mayús + L
          </span>
        </button>

        {assistedReadingMode && (
          <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
            Modo activo. Continúa a iniciar sesión.
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button size="lg" asChild>
            <Link href="/login?accesible=1">Ir a iniciar sesión</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/">Volver al inicio</Link>
          </Button>
        </div>

        <p className="text-xs text-brand-muted-gray">
          Un familiar, supervisor o administrador también puede activar este modo
          por ti desde Equipo → perfil del empleado, antes de que entres.
        </p>
      </div>
    </main>
  );
}
