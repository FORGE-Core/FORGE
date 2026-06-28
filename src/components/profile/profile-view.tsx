"use client";

import {
  Award,
  BookOpen,
  Briefcase,
  Building2,
  CheckCircle2,
  Flame,
  Layers,
  TrendingUp,
  Zap,
} from "lucide-react";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { getProfileData } from "@/services/server/profile/profile.service";

type ProfileViewProps = {
  profile: Awaited<ReturnType<typeof getProfileData>>;
};

const STAT_CONFIG = [
  { icon: Layers,       color: "text-brand-cobalt", bg: "bg-brand-cobalt/10",  label_color: "text-brand-cobalt" },
  { icon: CheckCircle2, color: "text-emerald-500",  bg: "bg-emerald-50",       label_color: "text-emerald-600" },
  { icon: Zap,          color: "text-amber-500",    bg: "bg-amber-50",         label_color: "text-amber-600"  },
  { icon: BookOpen,     color: "text-purple-500",   bg: "bg-purple-50",        label_color: "text-purple-600" },
];

export function ProfileView({ profile }: ProfileViewProps) {
  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-10">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl gradient-brand px-8 py-8 text-white shadow-xl">
        <div className="pointer-events-none absolute -right-12 -top-12 h-52 w-52 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-8 right-28 h-32 w-32 rounded-full bg-white/5" />

        <div className="relative flex flex-wrap items-center gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-xl font-bold backdrop-blur-sm ring-2 ring-white/30">
            {profile.avatarInitials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-heading text-2xl font-bold truncate">{profile.fullName}</h1>
            <div className="mt-1 flex flex-wrap gap-4 text-sm text-white/80">
              <span className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" />{profile.role}</span>
              <span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" />{profile.company}</span>
            </div>
          </div>
          <div className="shrink-0 flex flex-col items-center rounded-2xl bg-white/10 px-5 py-3 backdrop-blur-sm text-center">
            <span className="font-heading text-3xl font-bold">{profile.overallProgress}%</span>
            <span className="text-xs text-white/70">progreso</span>
            <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold">
              <Flame className="h-3 w-3" /> Nivel {profile.level}
            </span>
          </div>
        </div>
      </div>

      {/* ── Stats ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {profile.summary.map((s, i) => {
          const cfg = STAT_CONFIG[i]!;
          const Icon = cfg.icon;
          return (
            <div key={s.label} className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white px-4 py-3.5 shadow-sm">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${cfg.bg}`}>
                <Icon className={`h-4 w-4 ${cfg.color}`} />
              </div>
              <div>
                <p className="font-heading text-xl font-bold leading-none">{s.value}</p>
                <p className="text-xs text-brand-muted-gray mt-0.5">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Progreso + Logros ────────────────────────────────── */}
      <div className="grid gap-5 sm:grid-cols-2">

        {/* Progreso por módulo */}
        <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-cobalt/10">
              <TrendingUp className="h-3.5 w-3.5 text-brand-cobalt" />
            </div>
            <h2 className="font-heading text-sm font-semibold">Progreso por módulo</h2>
          </div>
          {profile.skills.length === 0 ? (
            <p className="text-sm text-brand-muted-gray text-center py-4">Sin módulos asignados.</p>
          ) : (
            <div className="space-y-4">
              {profile.skills.map((skill) => (
                <div key={skill.name}>
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="font-medium">{skill.name}</span>
                    <span className="font-bold text-brand-cobalt">{skill.pct}%</span>
                  </div>
                  <ProgressBar value={skill.pct} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Logros */}
        <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50">
              <Award className="h-3.5 w-3.5 text-amber-500" />
            </div>
            <h2 className="font-heading text-sm font-semibold">Logros</h2>
          </div>
          {profile.achievements.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <Award className="h-9 w-9 text-black/10" />
              <p className="text-xs text-brand-muted-gray">Completa módulos para desbloquear logros.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {profile.achievements.map((a) => (
                <div key={a.title} className="flex items-center gap-3 rounded-xl bg-brand-champagne/50 px-3 py-2.5">
                  <span className="text-lg shrink-0">{a.icon}</span>
                  <p className="text-sm font-medium">{a.title}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
