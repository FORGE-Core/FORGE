const CACHE_KEY = "forge:onboarding-status";

export type OnboardingCacheValue = "complete" | "not-admin" | "pending";

export function readOnboardingCache(): OnboardingCacheValue | null {
  if (typeof window === "undefined") return null;
  const value = sessionStorage.getItem(CACHE_KEY);
  if (
    value === "complete" ||
    value === "not-admin" ||
    value === "pending"
  ) {
    return value;
  }
  return null;
}

export function writeOnboardingCache(value: OnboardingCacheValue) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(CACHE_KEY, value);
}

export function clearOnboardingCache() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(CACHE_KEY);
}
