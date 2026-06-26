/** Convierte dictado hablado a formato de correo. */
export function normalizeSpokenEmail(spoken: string): string {
  return spoken
    .trim()
    .toLowerCase()
    .replace(/\s+arroba\s+/gi, "@")
    .replace(/\barroba\b/gi, "@")
    .replace(/\s+at\s+/gi, "@")
    .replace(/\bat\b/gi, "@")
    .replace(/\s+punto\s+/gi, ".")
    .replace(/\bpunto\b/gi, ".")
    .replace(/\s+dot\s+/gi, ".")
    .replace(/\bdot\b/gi, ".")
    .replace(/\s+guion\b/gi, "-")
    .replace(/\bguion\b/gi, "-")
    .replace(/\s+guión\b/gi, "-")
    .replace(/\bguión\b/gi, "-")
    .replace(/\s+/g, "");
}

export function normalizeSpokenText(spoken: string): string {
  return spoken.trim();
}
