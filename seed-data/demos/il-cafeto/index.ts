import type { OrganizationSeedDefinition } from "@/lib/seed/types";
import { admin, organization, staff } from "./organization";
import { modules } from "./modules";

export const ilCafetoSeed: OrganizationSeedDefinition = {
  id: "il-cafeto",
  organization,
  admin,
  staff,
  modules,
  contentDir: "capacitacion",
};
