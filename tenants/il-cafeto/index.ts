import type { TenantDefinition } from "@/lib/tenants/types";
import { admin, organization, staff } from "./organization";
import { modules } from "./modules";

export const ilCafetoTenant: TenantDefinition = {
  id: "il-cafeto",
  organization,
  admin,
  staff,
  modules,
  contentDir: "capacitacion",
};
