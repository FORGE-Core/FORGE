import { db } from "@/lib/db"
import { readFileSync } from "fs"
import { join } from "path"
import { tenantSchemaName } from "./tenant-client"

export async function provisionTenantSchema(orgId: string) {
  const schema = tenantSchemaName(orgId)

  // Verificar si ya existe
  const exists = await db.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*)::bigint as count
    FROM information_schema.schemata
    WHERE schema_name = ${schema}
  `
  if (Number(exists[0]?.count) > 0) return { schema, created: false }

  const sql = readFileSync(join(process.cwd(), "prisma/tenant-schema.sql"), "utf-8")
  const rendered = sql.replace(/\{SCHEMA\}/g, schema)

  // Ejecutar statement por statement (split en ";")
  const statements = rendered
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

  for (const stmt of statements) {
    await db.$executeRawUnsafe(stmt)
  }

  return { schema, created: true }
}
