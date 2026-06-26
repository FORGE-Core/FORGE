export function stripMarkdownForSpeech(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]+`/g, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/^#+\s+/gm, "")
    .replace(/\n{2,}/g, ". ")
    .trim();
}

function pickSpanishVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  return (
    voices.find((v) => v.lang.startsWith("es-MX")) ??
    voices.find((v) => v.lang.startsWith("es")) ??
    voices.find((v) => v.default) ??
    voices[0]
  );
}

function getVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  return window.speechSynthesis.getVoices();
}

let resumeInterval: number | null = null;
let speechGeneration = 0;
let speechUnlocked = false;
let pendingEnd: (() => void) | undefined;

function startResumeHack() {
  if (resumeInterval) return;
  resumeInterval = window.setInterval(() => {
    const synth = window.speechSynthesis;
    if (synth.speaking || synth.pending) synth.resume();
  }, 200);
}

function stopResumeHack() {
  if (resumeInterval) {
    window.clearInterval(resumeInterval);
    resumeInterval = null;
  }
}

/** Desbloquea TTS tras clic o tecla (requerido en Chrome). */
export function unlockSpeechFromGesture(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  const synth = window.speechSynthesis;
  void getVoices();
  synth.resume();
  if (!speechUnlocked) {
    speechUnlocked = true;
    window.dispatchEvent(new Event("alae-speech-unlocked"));
  }
}

export function isSpeechUnlocked(): boolean {
  return speechUnlocked;
}

export function installSpeechUnlockListeners(): () => void {
  const unlock = () => unlockSpeechFromGesture();
  document.addEventListener("pointerdown", unlock, true);
  document.addEventListener("keydown", unlock, true);
  return () => {
    document.removeEventListener("pointerdown", unlock, true);
    document.removeEventListener("keydown", unlock, true);
  };
}

function applyVoice(utterance: SpeechSynthesisUtterance, lang: string) {
  utterance.lang = lang;
  utterance.rate = 0.95;
  utterance.pitch = 1;
  utterance.volume = 1;
  const voice = pickSpanishVoice(getVoices());
  if (voice) utterance.voice = voice;
}

/**
 * Lectura corta y fiable (etiquetas Tab, avisos).
 * Preferir esto para mensajes breves.
 */
export function speakNow(
  text: string,
  lang = "es-MX",
  hooks?: { onStart?: () => void; onEnd?: () => void }
): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  const clean = stripMarkdownForSpeech(text);
  if (!clean) return;

  unlockSpeechFromGesture();

  const gen = ++speechGeneration;
  pendingEnd = hooks?.onEnd;

  const synth = window.speechSynthesis;
  synth.cancel();
  stopResumeHack();

  window.setTimeout(() => {
    if (gen !== speechGeneration) return;

    const utterance = new SpeechSynthesisUtterance(clean);
    applyVoice(utterance, lang);

    utterance.onstart = () => {
      if (gen !== speechGeneration) return;
      startResumeHack();
      hooks?.onStart?.();
    };

    utterance.onend = () => {
      if (gen !== speechGeneration) return;
      stopResumeHack();
      const cb = pendingEnd;
      pendingEnd = undefined;
      cb?.();
    };

    utterance.onerror = (event) => {
      if (gen !== speechGeneration) return;
      stopResumeHack();
      if (event.error === "canceled" || event.error === "interrupted") return;
      pendingEnd = undefined;
    };

    synth.speak(utterance);
    synth.resume();
  }, 80);
}

function splitForSpeech(text: string, maxLen = 220): string[] {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [];
  if (normalized.length <= maxLen) return [normalized];

  const chunks: string[] = [];
  let remaining = normalized;

  while (remaining.length > maxLen) {
    let breakAt = remaining.lastIndexOf(". ", maxLen);
    if (breakAt < maxLen * 0.35) breakAt = remaining.lastIndexOf(" ", maxLen);
    if (breakAt < maxLen * 0.35) breakAt = maxLen;
    const piece = remaining.slice(0, breakAt).trim();
    if (piece) chunks.push(piece);
    remaining = remaining.slice(breakAt).trim();
  }

  if (remaining) chunks.push(remaining);
  return chunks.length ? chunks : [normalized.slice(0, maxLen)];
}

/** Lectura larga (página completa). */
export function speakText(
  text: string,
  lang = "es-MX",
  hooks?: { onStart?: () => void; onEnd?: () => void }
): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  const clean = stripMarkdownForSpeech(text);
  if (!clean) return;

  if (clean.length <= 240) {
    speakNow(clean, lang, hooks);
    return;
  }

  unlockSpeechFromGesture();
  const gen = ++speechGeneration;
  const chunks = splitForSpeech(clean);
  let index = 0;
  let started = false;

  const synth = window.speechSynthesis;
  synth.cancel();
  stopResumeHack();

  const speakNext = () => {
    if (gen !== speechGeneration) return;
    if (index >= chunks.length) {
      stopResumeHack();
      hooks?.onEnd?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(chunks[index]);
    index += 1;
    applyVoice(utterance, lang);

    utterance.onstart = () => {
      if (gen !== speechGeneration) return;
      if (!started) {
        started = true;
        hooks?.onStart?.();
      }
      startResumeHack();
    };

    utterance.onend = () => window.setTimeout(speakNext, 30);
    utterance.onerror = (event) => {
      if (gen !== speechGeneration) return;
      if (event.error === "canceled" || event.error === "interrupted") return;
      window.setTimeout(speakNext, 30);
    };

    synth.speak(utterance);
    synth.resume();
  };

  window.setTimeout(speakNext, 80);
}

export function stopSpeaking(hooks?: { onEnd?: () => void }) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  speechGeneration += 1;
  pendingEnd = undefined;
  window.speechSynthesis.cancel();
  stopResumeHack();
  hooks?.onEnd?.();
}

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}
