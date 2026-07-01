export type OrganizationBranding = {
  primary: string;
  secondary: string;
  accent: string;
};

export const DEFAULT_BRANDING: OrganizationBranding = {
  primary: "#4f46e5",
  secondary: "#a384ec",
  accent: "#fff9e6",
};

const HEX_COLOR = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function isValidHexColor(value: unknown): value is string {
  return typeof value === "string" && HEX_COLOR.test(value.trim());
}

function normalizeHex(value: string): string {
  const trimmed = value.trim();
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    const [, r, g, b] = trimmed;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return trimmed.toLowerCase();
}

export function parseOrganizationBranding(
  settings: Record<string, unknown>
): OrganizationBranding {
  const raw =
    settings.branding && typeof settings.branding === "object"
      ? (settings.branding as Record<string, unknown>)
      : {};

  const legacyPrimary =
    typeof settings.brandColor === "string" ? settings.brandColor : undefined;

  return {
    primary: isValidHexColor(raw.primary)
      ? normalizeHex(raw.primary)
      : isValidHexColor(legacyPrimary)
        ? normalizeHex(legacyPrimary)
        : DEFAULT_BRANDING.primary,
    secondary: isValidHexColor(raw.secondary)
      ? normalizeHex(raw.secondary)
      : DEFAULT_BRANDING.secondary,
    accent: isValidHexColor(raw.accent)
      ? normalizeHex(raw.accent)
      : DEFAULT_BRANDING.accent,
  };
}

/** Acepta branding parcial o indefinido (p. ej. caché antigua) y devuelve valores completos. */
export function resolveOrganizationBranding(
  branding?: Partial<OrganizationBranding> | null
): OrganizationBranding {
  return {
    primary: isValidHexColor(branding?.primary)
      ? normalizeHex(branding.primary)
      : DEFAULT_BRANDING.primary,
    secondary: isValidHexColor(branding?.secondary)
      ? normalizeHex(branding.secondary)
      : DEFAULT_BRANDING.secondary,
    accent: isValidHexColor(branding?.accent)
      ? normalizeHex(branding.accent)
      : DEFAULT_BRANDING.accent,
  };
}

export function applyBrandingToDocument(branding: OrganizationBranding): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.style.setProperty("--color-brand-cobalt", branding.primary);
  root.style.setProperty("--color-brand-lavender", branding.secondary);
  root.style.setProperty("--color-brand-champagne", branding.accent);
}

export function resetBrandingOnDocument(): void {
  applyBrandingToDocument(DEFAULT_BRANDING);
}
