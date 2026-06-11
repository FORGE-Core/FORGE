import type { LearningModality, SupportLevel } from "@prisma/client";
import type { DeclaredNeeds } from "./types";

export type AlaeRecommendation = {
  topic: string;
  reason: string;
  href: string;
  priority: number;
};

const MODALITY_LINKS: Record<
  LearningModality,
  { topic: string; reason: string; href: string }
> = {
  READING: {
    topic: "Refuerza con lectura guiada",
    reason: "Tu perfil indica que aprendes mejor leyendo — explora módulos con resúmenes",
    href: "/dashboard/modules",
  },
  LISTENING: {
    topic: "Pregunta a NOVA en voz alta",
    reason: "Activa lectura automática en tu perfil y escucha las respuestas",
    href: "/dashboard/profile",
  },
  VISUAL: {
    topic: "Practica ordenando pasos",
    reason: "Las actividades visuales refuerzan procesos operativos",
    href: "/dashboard/activities",
  },
  PRACTICE: {
    topic: "Haz una simulación práctica",
    reason: "Tu perfil favorece aprender haciendo — prueba un escenario real",
    href: "/dashboard/simulations",
  },
  MIXED: {
    topic: "Combina módulo + mentor IA",
    reason: "Alterna lectura y práctica para consolidar conocimientos",
    href: "/dashboard/chat",
  },
};

export function buildAlaeRecommendations({
  preferredModality,
  supportLevel,
  pendingModule,
  declaredNeeds,
}: {
  preferredModality: LearningModality;
  supportLevel: SupportLevel;
  pendingModule?: { title: string; slug: string } | null;
  declaredNeeds?: DeclaredNeeds;
}): AlaeRecommendation[] {
  const items: AlaeRecommendation[] = [];

  const base = MODALITY_LINKS[preferredModality] ?? MODALITY_LINKS.MIXED;
  items.push({ ...base, priority: 10 });

  if (declaredNeeds?.simulations) {
    items.push({
      topic: "Simulación práctica",
      reason: "Indicaste que aprendes mejor practicando — prueba un caso real",
      href: "/dashboard/simulations",
      priority: 8,
    });
  }

  if (declaredNeeds?.examples) {
    items.push({
      topic: "Pide ejemplos a NOVA",
      reason: "Prefieres ejemplos del día a día — el mentor puede generarlos",
      href: "/dashboard/chat?prompt=Dame%20un%20ejemplo%20práctico%20de%20mi%20trabajo",
      priority: 9,
    });
  }

  if (supportLevel === "SIMPLIFIED" || supportLevel === "INTENSIVE") {
    items.push({
      topic: "Pide una explicación fácil",
      reason:
        supportLevel === "INTENSIVE"
          ? "Necesitas soporte extra — usa ✨ Explicar fácil en cualquier módulo"
          : "NOVA puede simplificar procesos complejos para ti",
      href: "/dashboard/chat?prompt=Explícame%20de%20forma%20sencilla%20mi%20próximo%20proceso",
      priority: 20,
    });
  }

  if (pendingModule) {
    items.push({
      topic: pendingModule.title,
      reason: "Siguiente módulo recomendado según tu progreso",
      href: `/dashboard/modules/${pendingModule.slug}`,
      priority: 5,
    });
  }

  return items.sort((a, b) => a.priority - b.priority).slice(0, 3);
}
