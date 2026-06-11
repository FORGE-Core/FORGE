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

export function speakText(
  text: string,
  lang = "es-MX",
  hooks?: { onStart?: () => void; onEnd?: () => void }
) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const clean = stripMarkdownForSpeech(text);
  if (!clean) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.lang = lang;
  utterance.rate = 0.95;
  utterance.onstart = () => hooks?.onStart?.();
  utterance.onend = () => hooks?.onEnd?.();
  utterance.onerror = () => hooks?.onEnd?.();
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(hooks?: { onEnd?: () => void }) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  hooks?.onEnd?.();
}
