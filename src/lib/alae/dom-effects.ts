import type { AccessibilityProfileData } from "./types";
import { ALAE_PROFILE_STORAGE_KEY } from "./profile-cache";

export const FONT_SCALE_MIN = 0.875;
export const FONT_SCALE_MAX = 2;
export const FONT_SCALE_STEP = 0.125;

export function clampFontScale(scale: number): number {
  return Math.min(FONT_SCALE_MAX, Math.max(FONT_SCALE_MIN, scale));
}

/** Aplica preferencias ALAE al DOM (tamaño de texto, contraste, modo oscuro, etc.). */
export function applyAccessibilityDomEffects(
  profile: Partial<AccessibilityProfileData>
) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  if (profile.fontScale != null) {
    const scale = clampFontScale(profile.fontScale);
    root.style.setProperty("--alae-font-scale", String(scale));
    root.dataset.alaeFontScale = String(scale);
  }

  if (profile.highContrast != null) {
    root.dataset.alaeHighContrast = profile.highContrast ? "true" : "false";
  }

  if (profile.darkMode != null) {
    root.dataset.alaeDark = profile.darkMode ? "true" : "false";
    root.classList.toggle("dark", profile.darkMode);
  }

  if (profile.reduceMotion != null) {
    root.dataset.alaeReduceMotion = profile.reduceMotion ? "true" : "false";
  }

  if (profile.simplifiedLanguage != null) {
    root.dataset.alaeSimplified = profile.simplifiedLanguage ? "true" : "false";
  }

  if (profile.stepByStepMode != null) {
    root.dataset.alaeStepByStep = profile.stepByStepMode ? "true" : "false";
  }

  if (profile.assistedReadingMode != null) {
    root.dataset.alaeAssistedReading = profile.assistedReadingMode
      ? "true"
      : "false";
    if (profile.assistedReadingMode) {
      root.dataset.alaeDark = "true";
      root.classList.add("dark");
    }
  }
}

/** Script inline para aplicar caché local antes del primer render (evita parpadeo). */
export function getAlaeBootScript(): string {
  const key = JSON.stringify(ALAE_PROFILE_STORAGE_KEY);
  return `(function(){try{var raw=localStorage.getItem(${key});if(!raw)return;var p=JSON.parse(raw);var e=document.documentElement;if(typeof p.fontScale==="number"){var s=Math.min(${FONT_SCALE_MAX},Math.max(${FONT_SCALE_MIN},p.fontScale));e.style.setProperty("--alae-font-scale",String(s));e.dataset.alaeFontScale=String(s);}if(p.assistedReadingMode){e.dataset.alaeAssistedReading="true";e.dataset.alaeDark="true";e.classList.add("dark");}else{if(p.highContrast)e.dataset.alaeHighContrast="true";if(p.darkMode){e.dataset.alaeDark="true";e.classList.add("dark");}}if(p.reduceMotion)e.dataset.alaeReduceMotion="true";if(p.simplifiedLanguage)e.dataset.alaeSimplified="true";if(p.stepByStepMode)e.dataset.alaeStepByStep="true";}catch(_){}})();`;
}
