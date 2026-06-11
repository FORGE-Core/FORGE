import type { AccessibilityProfileData } from "./types";

const STORAGE_KEY = "alae-accessibility-profile";

export function readCachedProfile(): AccessibilityProfileData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AccessibilityProfileData;
  } catch {
    return null;
  }
}

export function writeCachedProfile(profile: AccessibilityProfileData) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    /* ignore quota errors */
  }
}
