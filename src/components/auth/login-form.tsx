"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { VoiceDictationInput } from "@/components/alae/voice-dictation-input";
import { useAuthVoiceEnabled } from "@/hooks/use-auth-voice-enabled";
import { useAccessibilityActions } from "@/components/alae/accessibility-provider";
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
  const { data: session, status } = useSession();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/inicio";
  const authError = searchParams.get("error");
  const [error, setError] = useState<string | null>(
    authError ? AUTH_ERRORS[authError] ?? "No se pudo iniciar sesión" : null
  );
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { enabled: voiceEnabled } = useAuthVoiceEnabled();
  const { speakForUser } = useAccessibilityActions();
  const [voiceHintSpoken, setVoiceHintSpoken] = useState(false);

  useEffect(() => {
    if (!voiceEnabled || voiceHintSpoken || status === "loading") return;
    if (session?.user) return;
    setVoiceHintSpoken(true);
    speakForUser(
      "Formulario de inicio de sesión. Usa el botón de micrófono junto a cada campo para dictar correo y contraseña."
    );
  }, [
    voiceEnabled,
    voiceHintSpoken,
    status,
    session?.user,
    speakForUser,
  ]);

  useEffect(() => {
    if (searchParams.get("signedOut") === "1") {
      setError(null);
    }
  }, [searchParams]);

  async function handleSignOut() {
    setLoading(true);
    await signOut({ redirect: false });
    setLoading(false);
    router.replace("/login?signedOut=1");
    router.refresh();
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

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

  if (status === "loading") {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="py-10 text-center text-sm text-brand-muted-gray">
          Comprobando sesión…
        </CardContent>
      </Card>
    );
  }

  if (session?.user) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="font-heading text-2xl">Sesión activa</CardTitle>
          <CardDescription>
            Ya iniciaste sesión como{" "}
            <strong>{session.user.email ?? session.user.name}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-center text-sm text-brand-muted-gray">
            Para entrar con otra cuenta, cierra sesión primero.
          </p>
          <Button className="w-full" asChild>
            <Link href={callbackUrl}>Ir al dashboard</Link>
          </Button>
          <Button
            type="button"
            className="w-full"
            variant="outline"
            disabled={loading}
            onClick={() => void handleSignOut()}
          >
            {loading ? "Cerrando…" : "Cerrar sesión"}
          </Button>
        </CardContent>
      </Card>
    );
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
              <span className="relative z-10 bg-white px-2 dark:bg-[#1c1c1f]">
                o con email
              </span>
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
          <VoiceDictationInput
            id="login-email"
            name="email"
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="email"
            placeholder="correo@empresa.com"
            required
            authForm
          />
          <VoiceDictationInput
            id="login-password"
            name="password"
            label="Contraseña"
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            placeholder="Contraseña"
            required
            authForm
          />
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
