export type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

export type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((ev: { error: string }) => void) | null;
  onend: (() => void) | null;
};

export type SpeechRecognitionResultList = {
  length: number;
  [index: number]: { [index: number]: { transcript: string }; isFinal?: boolean };
};

export type SpeechRecognitionEvent = {
  results: SpeechRecognitionResultList;
  resultIndex: number;
};

export function getSpeechRecognition(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isVoiceSupported() {
  return getSpeechRecognition() !== null && typeof window !== "undefined";
}

const SPEECH_ERROR_MESSAGES: Record<string, string> = {
  "not-allowed":
    "Permiso de micrófono denegado. Permite el micrófono en la configuración del navegador.",
  "no-speech": "No escuché nada. Presiona espacio en el micrófono e intenta de nuevo.",
  network: "Error de red al usar el micrófono. Revisa tu conexión.",
  "audio-capture": "No se encontró micrófono. Conecta uno e intenta de nuevo.",
  aborted: "",
};

export function getSpeechErrorMessage(error: string): string {
  return SPEECH_ERROR_MESSAGES[error] ?? "No se pudo usar el micrófono. Intenta de nuevo.";
}
