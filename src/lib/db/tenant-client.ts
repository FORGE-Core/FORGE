import { db } from "@/lib/db"

/** Schema name por org: "tenant_" + orgId con guiones → underscores */
export function tenantSchemaName(orgId: string) {
  return `tenant_${orgId.replace(/-/g, "_")}`
}

/**
 * Devuelve el cliente global (transaction pooler).
 * El aislamiento por schema se aplica a través de organizationId en cada query.
 * Los schemas tenant existen en la BD y se utilizarán cuando el plan lo permita
 * (más conexiones en session mode o hosting propio).
 */
export function getTenantDb(orgId: string) {
  // Supabase free tier tiene 15 conexiones en session mode — insuficiente para
  // un PrismaClient por tenant. Usamos el cliente global (transaction pooler)
  // que no tiene ese límite. El aislamiento lógico por organizationId garantiza
  // que cada empresa solo ve sus datos.
  void orgId
  return db
}
