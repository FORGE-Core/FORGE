import type { DeclaredNeeds } from "./types";

export function parseDeclaredNeeds(raw: unknown): DeclaredNeeds {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  return {
    summaries: o.summaries === true,
    examples: o.examples === true,
    simulations: o.simulations === true,
  };
}
