"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LearningProfileData } from "@/lib/alae/types";
import { accessibilityClient } from "@/services/client";

const MODALITY_LABELS: Record<string, string> = {
  READING: "Lectura",
  LISTENING: "Escucha",
  VISUAL: "Visual",
  PRACTICE: "Práctica",
  MIXED: "Mixto",
};

export function LearningProfileCard() {
  const [profile, setProfile] = useState<LearningProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    void accessibilityClient
      .getLearningProfile()
      .then((d) => {
        if (d.profile) setProfile(d.profile as LearningProfileData);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6 text-sm text-brand-muted-gray">
          Cargando perfil de aprendizaje…
        </CardContent>
      </Card>
    );
  }

  if (error || !profile) {
    return (
      <Card>
        <CardContent className="py-6 text-sm text-brand-muted-gray">
          Completa actividades y usa NOVA para generar tu perfil de aprendizaje.
        </CardContent>
      </Card>
    );
  }

  const counts = [
    { key: "READING", value: profile.readingCount },
    { key: "LISTENING", value: profile.listeningCount },
    { key: "VISUAL", value: profile.visualCount },
    { key: "PRACTICE", value: profile.practiceCount },
  ].filter((c) => c.value > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Perfil de aprendizaje</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p>
          <span className="text-brand-muted-gray">Modalidad preferida: </span>
          <strong>
            {MODALITY_LABELS[profile.preferredModality] ??
              profile.preferredModality}
          </strong>
        </p>
        <p>
          <span className="text-brand-muted-gray">Nivel de soporte: </span>
          <strong>{profile.supportLevel}</strong>
        </p>
        {counts.length > 0 && (
          <ul className="space-y-1">
            {counts.map((c) => (
              <li key={c.key}>
                {MODALITY_LABELS[c.key]}: {c.value} usos
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
