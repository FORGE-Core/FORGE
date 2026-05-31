"use client";

import { motion } from "framer-motion";
import { Award, Building2, Briefcase } from "lucide-react";
import {
  currentUser,
  profileAchievements,
  profileSkills,
} from "@/data/mock-content";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-8">
      <Card className="overflow-hidden">
        <div className="gradient-brand px-8 py-10 text-white">
          <div className="flex flex-wrap items-end gap-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white/20 text-3xl font-bold backdrop-blur">
              {currentUser.avatarInitials}
            </div>
            <div>
              <h1 className="font-heading text-3xl font-bold">{currentUser.fullName}</h1>
              <div className="mt-2 flex flex-wrap gap-4 text-sm text-white/90">
                <span className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  {currentUser.role}
                </span>
                <span className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {currentUser.company}
                </span>
              </div>
              <Badge className="mt-4 bg-white/20 text-white">
                Nivel {currentUser.level} — Operador Avanzado
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Habilidades</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {profileSkills.map((skill, i) => (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-medium">{skill.name}</span>
                  <span className="text-brand-cobalt font-semibold">{skill.pct}%</span>
                </div>
                <ProgressBar value={skill.pct} />
              </motion.div>
            ))}
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
            {profileAchievements.map((a) => (
              <div
                key={a.title}
                className="flex items-center gap-3 rounded-2xl border border-black/5 bg-brand-champagne/30 px-4 py-4"
              >
                <span className="text-2xl">{a.icon}</span>
                <p className="text-sm font-medium leading-snug">{a.title}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumen de aprendizaje</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-4 text-center">
            {[
              { label: "Módulos", value: "12" },
              { label: "Horas", value: "18h" },
              { label: "Actividades", value: "48" },
              { label: "Simulaciones", value: "6" },
            ].map((s) => (
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
