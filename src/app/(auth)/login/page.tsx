import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { AssistedReadingAutoEnable } from "@/components/alae/assisted-reading-auto-enable";

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
