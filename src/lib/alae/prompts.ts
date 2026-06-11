import type { LearningPace } from "@prisma/client";
import type { AlaeContext } from "./types";

export function buildNovaSystemAugmentation(ctx: AlaeContext | null): string {
  if (!ctx) return "";

  const parts: string[] = [
    "\n\n--- ADAPTACIÓN ALAE (accesibilidad e inclusión) ---",
  ];

  const pace = ctx.accessibility.learningPace;
  if (pace === "SLOW") {
    parts.push(
      "- Ritmo lento: máximo 3 puntos por respuesta.",
      "- Una idea por párrafo. Pausa conceptual entre secciones."
    );
  } else if (pace === "FAST") {
    parts.push(
      "- Ritmo rápido: respuestas concisas en viñetas.",
      "- Ve directo a la acción sin introducciones largas."
    );
  }

  if (ctx.accessibility.simplifiedLanguage || ctx.declaredNeeds.summaries) {
    parts.push(
      "- Usa lenguaje sencillo, frases cortas (máx. 15 palabras).",
      "- Evita tecnicismos; si son necesarios, explícalos en paréntesis.",
      "- Incluye un resumen breve al final si la respuesta es larga."
    );
  }

  if (ctx.declaredNeeds.examples) {
    parts.push(
      "- Incluye al menos 2 ejemplos concretos del día a día en operaciones.",
      "- Relaciona cada concepto con una situación real del trabajo."
    );
  }

  if (ctx.declaredNeeds.simulations) {
    parts.push(
      "- Cuando el tema lo permita, sugiere practicar en Simulaciones (/dashboard/simulations).",
      "- Propón un mini-escenario de decisión al cerrar la respuesta."
    );
  }

  if (ctx.accessibility.stepByStepMode) {
    parts.push(
      "- Presenta procesos UN paso a la vez.",
      "- Usa formato: Paso 1, Paso 2, etc.",
      "- No mezcles varios pasos en un mismo párrafo."
    );
  }

  const modality =
    ctx.learning.preferredModality ?? ctx.accessibility.preferredModality;
  if (modality === "VISUAL") {
    parts.push(
      "- Estructura la respuesta con listas numeradas o viñetas.",
      "- Usa encabezados breves para cada sección.",
      "- Si describes un flujo, incluye un diagrama Mermaid simple (flowchart LR o TD) en bloque ```mermaid."
    );
  }

  if (modality === "LISTENING") {
    parts.push(
      "- Escribe como si fuera para leer en voz alta.",
      "- Evita tablas y símbolos complejos."
    );
  }

  if (modality === "PRACTICE" || ctx.declaredNeeds.simulations) {
    parts.push(
      "- Cierra con una mini-acción o pregunta de práctica.",
      "- Sugiere una simulación o ejercicio cuando aplique."
    );
  }

  if (
    ctx.learning.supportLevel === "SIMPLIFIED" ||
    ctx.learning.supportLevel === "INTENSIVE"
  ) {
    parts.push(
      "- El usuario necesita soporte adicional: sé extra paciente y claro.",
      "- Refuerza conceptos clave al final."
    );
  }

  return parts.join("\n");
}

export function buildSimplifyPrompt(pace: LearningPace = "NORMAL"): string {
  const maxSteps = pace === "SLOW" ? 3 : pace === "FAST" ? 5 : 5;
  return `Transforma el contenido en lenguaje sencillo para capacitación operativa.
REGLAS:
- Máximo ${maxSteps} pasos o puntos clave.
- Frases cortas, sin jerga.
- Incluye un ejemplo práctico.
- Responde en español.
- Formato markdown simple.`;
}

export function buildStepByStepPrompt(pace: LearningPace = "NORMAL"): string {
  const range =
    pace === "SLOW" ? "3 y 4" : pace === "FAST" ? "4 y 6" : "3 y 8";
  return `Divide el contenido en pasos secuenciales claros.
REGLAS:
- Entre ${range} pasos numerados.
- Cada paso: título breve + 1-2 oraciones de acción.
- Orden lógico para un empleado en operaciones.
- Responde SOLO con JSON: {"steps":[{"order":1,"title":"...","body":"..."}]}`;
}

export const SIMPLIFY_PROMPT = buildSimplifyPrompt();
export const STEP_BY_STEP_PROMPT = buildStepByStepPrompt();
