/** Convierte dictado hablado a formato de correo. */
export function normalizeSpokenEmail(spoken: string): string {
  return spoken
    .trim()
    .toLowerCase()
    .replace(/\s*arroba\s*/gi, "@")
    .replace(/\s*punto\s*/gi, ".")
    .replace(/\s*guion\s*/gi, "-")
    .replace(/\s*underscore\s*/gi, "_")
    .replace(/\s+/g, "");
}

export function normalizeSpokenText(spoken: string): string {
  return spoken.trim();
}
