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

function pickSpanishVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang.startsWith("es-MX")) ??
    voices.find((v) => v.lang.startsWith("es")) ??
    voices.find((v) => v.default) ??
    voices[0]
  );
}

/** Chrome/Safari a veces devuelven voces vacías hasta el primer voiceschanged. */
function waitForVoices(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      resolve();
      return;
    }
    if (window.speechSynthesis.getVoices().length > 0) {
      resolve();
      return;
    }
    const done = () => {
      window.speechSynthesis.removeEventListener("voiceschanged", done);
      resolve();
    };
    window.speechSynthesis.addEventListener("voiceschanged", done);
    setTimeout(done, 800);
  });
}

export async function speakText(
  text: string,
  lang = "es-MX",
  hooks?: { onStart?: () => void; onEnd?: () => void }
) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  const clean = stripMarkdownForSpeech(text);
  if (!clean) return;

  await waitForVoices();

  const synth = window.speechSynthesis;
  synth.cancel();

  // Bug conocido en Chrome: queda en pausa hasta interacción
  if (synth.paused) synth.resume();

  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.lang = lang;
  utterance.rate = 0.92;
  utterance.pitch = 1;
  utterance.volume = 1;

  const voice = pickSpanishVoice();
  if (voice) utterance.voice = voice;

  utterance.onstart = () => hooks?.onStart?.();
  utterance.onend = () => hooks?.onEnd?.();
  utterance.onerror = () => hooks?.onEnd?.();

  synth.speak(utterance);
}

export function stopSpeaking(hooks?: { onEnd?: () => void }) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  hooks?.onEnd?.();
}

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}
