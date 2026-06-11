import Link from "next/link";
import { Footprints, HeartHandshake, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MODALITY_LABELS: Record<string, string> = {
  READING: "Lectura",
  LISTENING: "Escucha",
  VISUAL: "Visual",
  PRACTICE: "Práctica",
  MIXED: "Mixto",
};

export function AlaeDashboardCard({
  alae,
}: {
  alae: {
    preferredModality: string;
    supportLevel: string;
    simplifiedLanguage: boolean;
    stepByStepMode: boolean;
    recommendations: { topic: string; reason: string; href: string }[];
  };
}) {
  return (
    <Card className="border-brand-lavender/25 bg-gradient-to-br from-white to-brand-champagne/30">
      <CardHeader>
        <div className="flex items-center gap-2">
          <HeartHandshake className="h-5 w-5 text-brand-cobalt" aria-hidden />
          <CardTitle className="text-base">Tu experiencia ALAE</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="muted">
            {MODALITY_LABELS[alae.preferredModality] ?? alae.preferredModality}
          </Badge>
          <Badge variant="muted">Soporte: {alae.supportLevel}</Badge>
          {alae.simplifiedLanguage && (
            <Badge className="gap-1">
              <Sparkles className="h-3 w-3" aria-hidden />
              Lenguaje fácil
            </Badge>
          )}
          {alae.stepByStepMode && (
            <Badge className="gap-1">
              <Footprints className="h-3 w-3" aria-hidden />
              Paso a paso
            </Badge>
          )}
        </div>

        {alae.recommendations.length > 0 && (
          <ul className="space-y-2">
            {alae.recommendations.map((rec) => (
              <li key={rec.href}>
                <Link
                  href={rec.href}
                  className="block rounded-xl border border-black/5 bg-white/80 px-3 py-2 text-sm transition-colors hover:border-brand-cobalt/30 hover:bg-brand-champagne/40"
                >
                  <p className="font-medium">{rec.topic}</p>
                  <p className="text-xs text-brand-muted-gray">{rec.reason}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link href="/dashboard/accessibility">Ajustar accesibilidad</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/dashboard/chat">Ir a NOVA</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
