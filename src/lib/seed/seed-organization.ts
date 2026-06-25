import { readFile } from "node:fs/promises";
import path from "node:path";
import bcrypt from "bcryptjs";
import { Prisma, PrismaClient, UserRole } from "@prisma/client";
import { chunkText } from "@/ai/rag/chunker";
import { embedDocumentChunks } from "@/lib/vector/store-chunk-embeddings";
import type { OrganizationSeedDefinition } from "./types";

const SEED_DEMOS_ROOT = path.join(process.cwd(), "seed-data", "demos");

function seedContentPath(seed: OrganizationSeedDefinition) {
  return path.join(SEED_DEMOS_ROOT, seed.id, seed.contentDir);
}

async function readSeedContentFile(
  seed: OrganizationSeedDefinition,
  filename: string
): Promise<string> {
  return readFile(path.join(seedContentPath(seed), filename), "utf-8");
}

export async function seedOrganization(
  db: PrismaClient,
  seed: OrganizationSeedDefinition
) {
  const { organization: orgData, admin, staff, modules } = seed;

  console.log(`\n🏢 Seed demo: ${orgData.name} (${seed.id})`);

  const org = await db.organization.upsert({
    where: { slug: orgData.slug },
    create: {
      name: orgData.name,
      slug: orgData.slug,
      industry: orgData.industry,
      logoUrl: orgData.logoUrl ?? undefined,
      settings: orgData.settings as Prisma.InputJsonValue,
    },
    update: {
      name: orgData.name,
      industry: orgData.industry,
      logoUrl: orgData.logoUrl ?? undefined,
      settings: orgData.settings as Prisma.InputJsonValue,
    },
  });

  const adminHash = await bcrypt.hash(admin.password, 12);
  await db.user.upsert({
    where: { email: admin.email },
    create: {
      email: admin.email,
      name: admin.name,
      passwordHash: adminHash,
      role: UserRole.ADMIN,
      status: "ACTIVE",
      organizationId: org.id,
    },
    update: {
      name: admin.name,
      passwordHash: adminHash,
      role: UserRole.ADMIN,
      status: "ACTIVE",
      organizationId: org.id,
    },
  });
  console.log(`   ✓ Admin: ${admin.email}`);

  for (const member of staff) {
    const hash = await bcrypt.hash(member.password, 12);
    await db.user.upsert({
      where: { email: member.email },
      create: {
        email: member.email,
        name: member.name,
        passwordHash: hash,
        role: member.role ?? UserRole.EMPLOYEE,
        status: "ACTIVE",
        organizationId: org.id,
      },
      update: {
        name: member.name,
        passwordHash: hash,
        role: member.role ?? UserRole.EMPLOYEE,
        status: "ACTIVE",
        organizationId: org.id,
      },
    });
    console.log(`   ✓ Empleado (${member.roleTitle}): ${member.email}`);
  }

  console.log("   📚 Módulos y documentos…");

  for (const mod of modules) {
    const markdown = await readSeedContentFile(seed, mod.file);
    const fileSize = Buffer.byteLength(markdown, "utf-8");

    const trainingModule = await db.trainingModule.upsert({
      where: {
        organizationId_slug: {
          organizationId: org.id,
          slug: mod.slug,
        },
      },
      create: {
        organizationId: org.id,
        slug: mod.slug,
        title: mod.title,
        description: mod.description,
        audience: mod.audience,
        status: "PUBLISHED",
        orderIndex: mod.orderIndex,
        estimatedMins: mod.estimatedMins,
      },
      update: {
        title: mod.title,
        description: mod.description,
        audience: mod.audience,
        status: "PUBLISHED",
        orderIndex: mod.orderIndex,
        estimatedMins: mod.estimatedMins,
      },
    });

    let document = await db.document.findFirst({
      where: { organizationId: org.id, moduleId: trainingModule.id },
    });

    if (!document) {
      document = await db.document.create({
        data: {
          organizationId: org.id,
          moduleId: trainingModule.id,
          title: mod.title,
          type: "MANUAL",
          status: "PROCESSING",
          mimeType: "text/markdown",
          fileSize,
          metadata: {
            sourceFile: mod.file,
            audience: mod.audience,
            category: mod.category,
            seedBundleId: seed.id,
          },
        },
      });
    }

    const chunks = chunkText(markdown);
    await db.$transaction(async (tx) => {
      await tx.documentChunk.deleteMany({ where: { documentId: document!.id } });
      if (chunks.length > 0) {
        await tx.documentChunk.createMany({
          data: chunks.map((chunk) => ({
            organizationId: org.id,
            documentId: document!.id,
            content: chunk.content,
            chunkIndex: chunk.index,
            tokenCount: chunk.tokenCount,
          })),
        });
      }
      await tx.document.update({
        where: { id: document!.id },
        data: {
          title: mod.title,
          moduleId: trainingModule.id,
          status: "READY",
          fileSize,
          metadata: {
            sourceFile: mod.file,
            audience: mod.audience,
            category: mod.category,
            seedBundleId: seed.id,
            chunkCount: chunks.length,
            processedAt: new Date().toISOString(),
          },
        },
      });
    });

    const { embedded } = await embedDocumentChunks(document!.id, org.id);
    console.log(
      `   ✓ ${mod.title} — ${chunks.length} fragmentos${embedded > 0 ? `, ${embedded} embeddings` : ""}`
    );
  }

  const readmeTitle = "Índice del programa de capacitación";
  const readme = await readSeedContentFile(seed, "README.md");
  const readmeChunks = chunkText(readme);

  let readmeDoc = await db.document.findFirst({
    where: { organizationId: org.id, title: readmeTitle },
  });

  if (!readmeDoc) {
    readmeDoc = await db.document.create({
      data: {
        organizationId: org.id,
        title: readmeTitle,
        type: "MANUAL",
        status: "PROCESSING",
        mimeType: "text/markdown",
        fileSize: Buffer.byteLength(readme, "utf-8"),
        metadata: {
          sourceFile: "README.md",
          category: "Índice",
          seedBundleId: seed.id,
        },
      },
    });
  }

  await db.$transaction(async (tx) => {
    await tx.documentChunk.deleteMany({ where: { documentId: readmeDoc!.id } });
    if (readmeChunks.length > 0) {
      await tx.documentChunk.createMany({
        data: readmeChunks.map((chunk) => ({
          organizationId: org.id,
          documentId: readmeDoc!.id,
          content: chunk.content,
          chunkIndex: chunk.index,
          tokenCount: chunk.tokenCount,
        })),
      });
    }
    await tx.document.update({
      where: { id: readmeDoc!.id },
      data: {
        status: "READY",
        fileSize: Buffer.byteLength(readme, "utf-8"),
        metadata: {
          sourceFile: "README.md",
          category: "Índice",
          seedBundleId: seed.id,
          chunkCount: readmeChunks.length,
          processedAt: new Date().toISOString(),
        },
      },
    });
  });

  console.log(`   ✓ Índice — ${readmeChunks.length} fragmentos`);

  const { seedAlaeForOrganization } = await import("@/lib/alae/seed-profiles");
  await seedAlaeForOrganization(db, org.id);
  console.log("   ✓ Perfiles ALAE e Inclusion Score inicial");

  return { org, seed };
}

export async function seedAllOrganizations(
  db: PrismaClient,
  seeds: OrganizationSeedDefinition[]
) {
  const results = [];
  for (const seed of seeds) {
    results.push(await seedOrganization(db, seed));
  }
  return results;
}
