/** Lee variables de entorno sin espacios ni comillas accidentales */
export function getEnv(name: string): string | undefined {
  const raw = process.env[name];
  if (!raw) return undefined;
  return raw.trim().replace(/^["']|["']$/g, "");
}

export function requireEnv(name: string): string {
  const value = getEnv(name);
  if (!value) throw new Error(`${name} no configurada`);
  return value;
}
