/** Rutas de la app autenticada (sin prefijo /dashboard). */
export const APP_ROUTES = {
  home: "/home",
  modules: "/modules",
  module: (slug: string) => `/modules/${slug}`,
  activities: "/activities",
  chat: "/chat",
  documents: "/documents",
  reports: "/reports",
  team: "/team",
  teamMember: (id: string) => `/team/${id}`,
  accessibility: "/accessibility",
  accesible: "/accesible",
  profile: "/profile",
  settings: "/settings",
  onboarding: "/onboarding",
} as const;

/** Rutas protegidas que requieren sesión. */
export const PROTECTED_PREFIXES = [
  "/home",
  "/modules",
  "/activities",
  "/chat",
  "/documents",
  "/reports",
  "/team",
  "/accessibility",
  "/profile",
  "/settings",
  "/onboarding",
] as const;

export function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}
