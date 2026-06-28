import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/register-form";
import { AssistedReadingAutoEnable } from "@/components/alae/assisted-reading-auto-enable";

export default function RegisterPage() {
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
        <h1 className="sr-only">Crear cuenta en FORGE</h1>
        <RegisterForm />
      </div>
    </main>
  );
}
