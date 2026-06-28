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
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.set("companyName", companyName);
    formData.set("email", email);
    formData.set("password", password);

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

    router.push("/onboarding");
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
          <div className="flex flex-col gap-1.5">
            <label htmlFor="companyName" className="text-xs font-semibold text-brand-muted-gray">
              Nombre de la empresa
            </label>
            <input
              id="companyName"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Nombre de la empresa"
              className="rounded-xl border border-black/10 bg-brand-light-bg px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-cobalt/30"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="register-email" className="text-xs font-semibold text-brand-muted-gray">
              Correo electrónico
            </label>
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="Tu correo corporativo"
              className="rounded-xl border border-black/10 bg-brand-light-bg px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-cobalt/30"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="register-password" className="text-xs font-semibold text-brand-muted-gray">
              Contraseña
            </label>
            <input
              id="register-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="Contraseña (mín. 6 caracteres)"
              className="rounded-xl border border-black/10 bg-brand-light-bg px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-cobalt/30"
              required
              minLength={6}
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
