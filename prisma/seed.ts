import { PrismaClient } from "@prisma/client";
import { seedAllTenants } from "../src/lib/tenants/seed-tenant";
import { tenants } from "../tenants";

const db = new PrismaClient();

async function main() {
  try {
    console.log(`🌱 Seed multi-tenant — ${tenants.length} organización(es)\n`);

    const results = await seedAllTenants(db, tenants);

    for (const { org, tenant } of results) {
      console.log(`\n✅ ${org.name} listo`);
      console.log(`   Slug: ${org.slug} · ID: ${org.id}`);
      console.log(`   Admin: ${tenant.admin.email} / ${tenant.admin.password}`);
      if (tenant.staff.length > 0) {
        console.log("   Empleados demo:");
        for (const s of tenant.staff) {
          console.log(`     ${s.email} (${s.roleTitle}) / ${s.password}`);
        }
      }
    }
  } catch (error) {
    console.error("❌ Error en seed:", error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

main();
