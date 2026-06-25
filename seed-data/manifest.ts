import type { OrganizationSeedDefinition } from "@/lib/seed/types";
import { ilCafetoSeed } from "./demos/il-cafeto";

/**
 * Bundles de datos demo para `npx prisma db seed`.
 *
 * Las empresas en producción se crean con /register y viven en PostgreSQL.
 * No añadas una carpeta por cada cliente real: solo demos opcionales de desarrollo.
 */
export const organizationSeeds: OrganizationSeedDefinition[] = [ilCafetoSeed];
