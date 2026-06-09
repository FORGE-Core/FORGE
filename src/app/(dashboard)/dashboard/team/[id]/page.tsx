"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { ModuleCardData } from "@/components/modules/module-card";

type MemberDetail = {
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    status: string;
  };
  overallProgress: number;
  modules: ModuleCardData[];
  recentAttempts: {
    id: string;
    title: string;
    type: string;
    passed: boolean;
    score: number | null;
    at: string;
  }[];
  chatQuestions: number;
};

export default function TeamMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [data, setData] = useState<MemberDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${id}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Sin acceso");
        return;
      }
      setData(json);
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <p className="flex items-center gap-2 text-sm text-brand-muted-gray">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando empleado…
      </p>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <Link
          href="/dashboard/team"
          className="inline-flex items-center gap-2 text-sm text-brand-muted-gray"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al equipo
        </Link>
        <p className="text-red-600">{error ?? "No encontrado"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <Link
        href="/dashboard/team"
        className="inline-flex items-center gap-2 text-sm text-brand-muted-gray hover:text-brand-cobalt"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al equipo
      </Link>

      <div>
        <h1 className="font-heading text-3xl font-bold">
          {data.user.name ?? data.user.email}
        </h1>
        <p className="mt-1 text-brand-muted-gray">{data.user.email}</p>
        <div className="mt-3 flex gap-2">
          <Badge>{data.user.role}</Badge>
          <Badge variant="muted">{data.user.status}</Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Progreso general</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between text-sm mb-2">
            <span>Avance en módulos</span>
            <span className="font-semibold">{data.overallProgress}%</span>
          </div>
          <ProgressBar value={data.overallProgress} />
          <p className="mt-3 text-sm text-brand-muted-gray">
            {data.chatQuestions} consultas al mentor IA
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Módulos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.modules.map((m) => (
            <div
              key={m.slug}
              className="flex items-center justify-between rounded-2xl bg-brand-light-bg px-4 py-3 text-sm"
            >
              <span className="font-medium">{m.title}</span>
              <span>{m.progress}%</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Actividad reciente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.recentAttempts.length === 0 ? (
            <p className="text-sm text-brand-muted-gray">Sin intentos registrados.</p>
          ) : (
            data.recentAttempts.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-2xl border border-black/5 px-4 py-3 text-sm"
              >
                <span>{a.title}</span>
                <Badge variant={a.passed ? "default" : "muted"}>
                  {a.passed ? "Aprobado" : "Reprobado"}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
