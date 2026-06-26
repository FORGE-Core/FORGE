export type VoiceCommandAction =
  | { type: "NAVIGATE"; href: string }
  | { type: "TOGGLE"; key: "darkMode" | "stepByStepMode" | "simplifiedLanguage" | "autoReadAloud" }
  | { type: "ADJUST_FONT"; delta: number }
  | { type: "STOP_SPEECH" }
  | { type: "CUSTOM"; id: string };

type CommandRule = {
  patterns: RegExp[];
  action: VoiceCommandAction;
  feedback: string;
};

const RULES: CommandRule[] = [
  {
    patterns: [/abrir (?:nova|mentor|chat)/i, /ir al mentor/i],
    action: { type: "NAVIGATE", href: "/chat" },
    feedback: "Abriendo mentor NOVA",
  },
  {
    patterns: [/ir a módulos/i, /abrir módulos/i],
    action: { type: "NAVIGATE", href: "/modules" },
    feedback: "Abriendo módulos",
  },
  {
    patterns: [/ir a actividades/i],
    action: { type: "NAVIGATE", href: "/activities" },
    feedback: "Abriendo actividades",
  },
  {
    patterns: [/modo oscuro/i, /activar oscuro/i],
    action: { type: "TOGGLE", key: "darkMode" },
    feedback: "Alternando modo oscuro",
  },
  {
    patterns: [/paso a paso/i, /modo paso/i],
    action: { type: "TOGGLE", key: "stepByStepMode" },
    feedback: "Alternando modo paso a paso",
  },
  {
    patterns: [/lenguaje fácil/i, /explicar fácil/i, /modo fácil/i],
    action: { type: "TOGGLE", key: "simplifiedLanguage" },
    feedback: "Alternando lenguaje simplificado",
  },
  {
    patterns: [/leer en voz alta/i, /lectura automática/i],
    action: { type: "TOGGLE", key: "autoReadAloud" },
    feedback: "Alternando lectura automática",
  },
  {
    patterns: [/aumentar texto/i, /texto más grande/i],
    action: { type: "ADJUST_FONT", delta: 0.125 },
    feedback: "Aumentando tamaño de texto",
  },
  {
    patterns: [/reducir texto/i, /texto más pequeño/i],
    action: { type: "ADJUST_FONT", delta: -0.125 },
    feedback: "Reduciendo tamaño de texto",
  },
  {
    patterns: [/detener|parar|callar/i],
    action: { type: "STOP_SPEECH" },
    feedback: "Deteniendo lectura",
  },
];

export function matchVoiceCommand(transcript: string): {
  action: VoiceCommandAction;
  feedback: string;
} | null {
  const text = transcript.trim().toLowerCase();
  for (const rule of RULES) {
    if (rule.patterns.some((p) => p.test(text))) {
      return { action: rule.action, feedback: rule.feedback };
    }
  }
  return null;
}

export const VOICE_COMMAND_HINTS = [
  "Abrir mentor",
  "Modo oscuro",
  "Paso a paso",
  "Aumentar texto",
  "Detener",
];
