import type { PrismaClient } from "@prisma/client";
import {
  auditContentInclusion,
  saveInclusionAudit,
} from "./inclusion-scorer";

export async function seedAlaeForOrganization(
  db: PrismaClient,
  organizationId: string
) {
  const users = await db.user.findMany({
    where: { organizationId, status: "ACTIVE" },
    select: { id: true, role: true },
  });

  for (const user of users) {
    const isAdmin = user.role === "ADMIN";
    await db.accessibilityProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        organizationId,
        wizardCompleted: true,
        preferredModality: isAdmin ? "MIXED" : "PRACTICE",
        stepByStepMode: !isAdmin,
        simplifiedLanguage: !isAdmin,
        voiceInputEnabled: !isAdmin,
        autoReadAloud: !isAdmin,
      },
      update: {
        wizardCompleted: true,
        voiceInputEnabled: !isAdmin,
        autoReadAloud: !isAdmin,
      },
    });

    await db.learningProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        organizationId,
        practiceCount: isAdmin ? 1 : 3,
        readingCount: 2,
        supportLevel: isAdmin ? "STANDARD" : "GUIDED",
      },
      update: {},
    });
  }

  const modules = await db.trainingModule.findMany({
    where: { organizationId },
    select: { id: true, title: true, description: true },
  });

  for (const mod of modules) {
    if (!mod.description) continue;
    const existing = await db.inclusionAudit.findFirst({
      where: {
        organizationId,
        targetType: "MODULE",
        targetId: mod.id,
      },
    });
    if (existing) continue;

    const result = await auditContentInclusion(
      `${mod.title}\n\n${mod.description}`,
      false
    );
    await saveInclusionAudit({
      organizationId,
      targetType: "MODULE",
      targetId: mod.id,
      result,
    });
  }

  const docs = await db.document.findMany({
    where: { organizationId, type: { in: ["PDF", "MANUAL"] } },
    select: { id: true, title: true },
  });

  for (const doc of docs) {
    const existing = await db.inclusionAudit.findFirst({
      where: {
        organizationId,
        targetType: "DOCUMENT",
        targetId: doc.id,
      },
    });
    if (existing) continue;

    const chunks = await db.documentChunk.findMany({
      where: { documentId: doc.id },
      take: 5,
      orderBy: { chunkIndex: "asc" },
    });
    if (chunks.length === 0) continue;

    const text = chunks.map((c) => c.content).join("\n\n");
    const result = await auditContentInclusion(text, false);
    await saveInclusionAudit({
      organizationId,
      targetType: "DOCUMENT",
      targetId: doc.id,
      result,
    });
  }
}
