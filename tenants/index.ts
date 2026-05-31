import type { TenantDefinition } from "@/lib/tenants/types";
import { ilCafetoTenant } from "./il-cafeto";

/** Registro de tenants demo / piloto. Añade uno nuevo por carpeta en `tenants/`. */
export const tenants: TenantDefinition[] = [ilCafetoTenant];

export function getTenantBySlug(slug: string): TenantDefinition | undefined {
  return tenants.find((t) => t.organization.slug === slug);
}

export function getTenantById(id: string): TenantDefinition | undefined {
  return tenants.find((t) => t.id === id);
}
