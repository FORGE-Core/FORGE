import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { AssistedReadingAutoEnable } from "@/components/alae/assisted-reading-auto-enable";
import { Volume2 } from "lucide-react";

export default function LoginPage() {
  const googleEnabled = !!(
    process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
  );

  return (
    <main
      id="main-content"
      className="main-content-area flex min-h-screen flex-col items-center justify-center px-4 py-8"
      tabIndex={-1}
    >
      <Suspense fallback={null}>
        <AssistedReadingAutoEnable />
      </Suspense>

      <div className="mb-6 w-full max-w-md">
        <Link
          href="/accesible"
          className="flex items-center gap-3 rounded-2xl border-2 border-brand-cobalt bg-brand-cobalt/10 px-5 py-4 text-brand-cobalt transition-colors hover:bg-brand-cobalt hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cobalt focus-visible:ring-offset-2"
        >
          <Volume2 className="h-6 w-6 shrink-0" aria-hidden />
          <span>
            <span className="block font-semibold">
              ¿Necesitas lectura por voz?
            </span>
            <span className="block text-sm opacity-90">
              Entra aquí primero — o usa Alt + Mayús + L
            </span>
          </span>
        </Link>
      </div>

      <div className="w-full max-w-md space-y-6">
        <h1 className="sr-only">Iniciar sesión en FORGE</h1>
        <Suspense
          fallback={
            <div className="text-center text-sm text-brand-muted-gray">
              Cargando…
            </div>
          }
        >
          <LoginForm googleEnabled={googleEnabled} />
        </Suspense>
      </div>
    </main>
  );
}
