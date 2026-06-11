"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const AUTH_ERRORS: Record<string, string> = {
  GoogleAccountNotLinked:
    "Tu cuenta de Google no está vinculada. Regístrate primero o pide a tu administrador que te invite.",
  AccountPending:
    "Tu cuenta está pendiente de activación. Contacta a tu administrador.",
  OAuthAccountNotLinked:
    "Este correo ya está registrado con otro método. Usa email y contraseña.",
};

type LoginFormProps = {
  googleEnabled?: boolean;
};

export function LoginForm({ googleEnabled = false }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const authError = searchParams.get("error");
  const [error, setError] = useState<string | null>(
    authError ? AUTH_ERRORS[authError] ?? "No se pudo iniciar sesión" : null
  );
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Correo o contraseña incorrectos");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="font-heading text-2xl">
          Bienvenido a <span className="text-gradient">FORGE</span>
        </CardTitle>
        <CardDescription>Inicia sesión en tu cuenta empresarial</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {googleEnabled && (
          <>
            <Button
              type="button"
              className="w-full"
              variant="outline"
              disabled={loading}
              onClick={() => signIn("google", { callbackUrl })}
            >
              Continuar con Google
            </Button>
            <p className="text-center text-xs text-brand-muted-gray">
              Google solo funciona si tu administrador ya te invitó con el mismo
              correo.
            </p>
            <div className="relative text-center text-xs text-brand-muted-gray">
              <span className="relative z-10 bg-white px-2">o con email</span>
              <div className="absolute inset-x-0 top-1/2 border-t border-black/10" />
            </div>
          </>
        )}

        <form className="space-y-3" onSubmit={onSubmit}>
          {error && (
            <p
              role="alert"
              className="rounded-2xl bg-red-50 px-4 py-2 text-sm text-red-700"
            >
              {error}
            </p>
          )}
          <div>
            <label htmlFor="login-email" className="sr-only">
              Correo electrónico
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="correo@empresa.com"
              aria-label="Correo electrónico"
              className="w-full rounded-2xl border border-black/10 bg-brand-light-bg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-cobalt/30"
            />
          </div>
          <div>
            <label htmlFor="login-password" className="sr-only">
              Contraseña
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="Contraseña"
              aria-label="Contraseña"
              className="w-full rounded-2xl border border-black/10 bg-brand-light-bg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-cobalt/30"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Entrando…" : "Iniciar sesión"}
          </Button>
        </form>
        <p className="text-center text-sm text-brand-muted-gray">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="text-brand-cobalt hover:underline">
            Regístrate
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
