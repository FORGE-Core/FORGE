import { PrismaClient } from "@prisma/client";
import { seedAllOrganizations } from "../src/lib/seed/seed-organization";
import { organizationSeeds } from "../seed-data/manifest";

const db = new PrismaClient();

async function main() {
  try {
    console.log(
      `🌱 Seed — ${organizationSeeds.length} organización(es) demo\n`
    );

    const results = await seedAllOrganizations(db, organizationSeeds);

    for (const { org, seed } of results) {
      console.log(`\n✅ ${org.name} listo`);
      console.log(`   Slug: ${org.slug} · ID: ${org.id}`);
      console.log(`   Admin: ${seed.admin.email} / ${seed.admin.password}`);
      if (seed.staff.length > 0) {
        console.log("   Empleados demo:");
        for (const s of seed.staff) {
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
