"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { registerAction } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = String(formData.get("password"));
    const result = await registerAction(formData);

    if (!result.ok) {
      setLoading(false);
      setError(result.error);
      return;
    }

    const signInResult = await signIn("credentials", {
      email: result.email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (signInResult?.error) {
      setError("Cuenta creada. Inicia sesión con tu correo y contraseña.");
      return;
    }

    router.push("/dashboard/onboarding");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="font-heading text-2xl">
          Crea tu empresa en <span className="text-gradient">FORGE</span>
        </CardTitle>
        <CardDescription>
          Registra tu organización y comienza a capacitar a tu equipo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
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
            <label htmlFor="companyName" className="sr-only">
              Nombre de la empresa
            </label>
            <input
              id="companyName"
              name="companyName"
              required
              placeholder="Nombre de la empresa"
              aria-label="Nombre de la empresa"
              className="w-full rounded-2xl border border-black/10 bg-brand-light-bg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-cobalt/30"
            />
          </div>
          <div>
            <label htmlFor="register-email" className="sr-only">
              Correo electrónico
            </label>
            <input
              id="register-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="Tu correo corporativo"
              aria-label="Correo electrónico"
              className="w-full rounded-2xl border border-black/10 bg-brand-light-bg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-cobalt/30"
            />
          </div>
          <div>
            <label htmlFor="register-password" className="sr-only">
              Contraseña
            </label>
            <input
              id="register-password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="Contraseña (mín. 6 caracteres)"
              aria-label="Contraseña"
              className="w-full rounded-2xl border border-black/10 bg-brand-light-bg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-cobalt/30"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creando cuenta…" : "Crear cuenta"}
          </Button>
        </form>
        <p className="text-center text-sm text-brand-muted-gray">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-brand-cobalt hover:underline">
            Inicia sesión
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
