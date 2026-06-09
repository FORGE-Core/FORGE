"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Award, Building2, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";

type ProfileData = {
  fullName: string;
  role: string;
  company: string;
  level: number;
  overallProgress: number;
  avatarInitials: string;
  skills: { name: string; pct: number }[];
  achievements: { title: string; icon: string }[];
  summary: { label: string; value: string }[];
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      if (res.ok) setProfile(data);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <p className="text-sm text-brand-muted-gray">Cargando perfil…</p>
    );
  }

  if (!profile) {
    return (
      <p className="text-sm text-red-600">No se pudo cargar el perfil.</p>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-8">
      <Card className="overflow-hidden">
        <div className="gradient-brand px-8 py-10 text-white">
          <div className="flex flex-wrap items-end gap-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white/20 text-3xl font-bold backdrop-blur">
              {profile.avatarInitials}
            </div>
            <div>
              <h1 className="font-heading text-3xl font-bold">
                {profile.fullName}
              </h1>
              <div className="mt-2 flex flex-wrap gap-4 text-sm text-white/90">
                <span className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  {profile.role}
                </span>
                <span className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {profile.company}
                </span>
              </div>
              <Badge className="mt-4 bg-white/20 text-white">
                Nivel {profile.level} · {profile.overallProgress}% completado
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Progreso por módulo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {profile.skills.length === 0 ? (
              <p className="text-sm text-brand-muted-gray">
                Aún no tienes módulos asignados.
              </p>
            ) : (
              profile.skills.map((skill, i) => (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium">{skill.name}</span>
                    <span className="text-brand-cobalt font-semibold">
                      {skill.pct}%
                    </span>
                  </div>
                  <ProgressBar value={skill.pct} />
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              <CardTitle>Logros</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {profile.achievements.length === 0 ? (
              <p className="text-sm text-brand-muted-gray col-span-2">
                Completa módulos y actividades para desbloquear logros.
              </p>
            ) : (
              profile.achievements.map((a) => (
                <div
                  key={a.title}
                  className="flex items-center gap-3 rounded-2xl border border-black/5 bg-brand-champagne/30 px-4 py-4"
                >
                  <span className="text-2xl">{a.icon}</span>
                  <p className="text-sm font-medium leading-snug">{a.title}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumen de aprendizaje</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-4 text-center">
            {profile.summary.map((s) => (
              <div key={s.label} className="rounded-2xl bg-brand-light-bg py-4">
                <p className="font-heading text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-brand-muted-gray">{s.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
