import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  const googleEnabled = !!(
    process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-light-bg px-4">
      <Suspense fallback={<div className="text-sm text-brand-muted-gray">Cargando…</div>}>
        <LoginForm googleEnabled={googleEnabled} />
      </Suspense>
    </div>
  );
}
