export type ModuleStatus = "pending" | "in_progress" | "completed";

/** Clases CSS fijas (definidas en globals.css) — siempre visibles en build. */
export function getModuleStatusClasses(status: ModuleStatus) {
  return {
    card: `module-card module-card--${status}`,
    header: `module-card__header module-card__header--${status}`,
    badge: `module-card__badge module-card__badge--${status}`,
    row: `module-row module-row--${status}`,
    icon: `module-card__icon module-card__icon--${status}`,
    progress: `module-card__progress module-card__progress--${status}`,
    progressText: `module-card__progress-text module-card__progress-text--${status}`,
  };
}

export function getActivityRowClass(type: string) {
  const map: Record<string, string> = {
    complete: "activity-row activity-row--complete",
    quiz: "activity-row activity-row--quiz",
    ai: "activity-row activity-row--ai",
    sim: "activity-row activity-row--sim",
  };
  return map[type] ?? "activity-row";
}
