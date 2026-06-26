"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { VoiceDictationInput } from "@/components/alae/voice-dictation-input";
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
          <VoiceDictationInput
            id="companyName"
            name="companyName"
            label="Nombre de la empresa"
            value={companyName}
            onChange={setCompanyName}
            placeholder="Nombre de la empresa"
            required
            alwaysShowVoice
            autoStartOnFocus
          />
          <VoiceDictationInput
            id="register-email"
            name="email"
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="email"
            placeholder="Tu correo corporativo"
            required
            alwaysShowVoice
            autoStartOnFocus
          />
          <VoiceDictationInput
            id="register-password"
            name="password"
            label="Contraseña"
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            placeholder="Contraseña (mín. 6 caracteres)"
            required
            minLength={6}
            alwaysShowVoice
            autoStartOnFocus
          />
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
