import { auth } from "@/auth";
import {
  applyWizardToProfiles,
  getOrCreateLearningProfile,
  serializeLearningProfile,
} from "@/lib/alae/learning-profile";
import { db } from "@/lib/db";
import type { LearningModality, SupportLevel } from "@prisma/client";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const organizationId = session?.user?.organizationId;
    if (!userId || !organizationId) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }

    const profile = await getOrCreateLearningProfile(userId, organizationId);
    return Response.json({ profile: serializeLearningProfile(profile) });
  } catch (error) {
    console.error("[learning-profile GET]", error);
    return Response.json(
      { error: "No se pudo cargar el perfil de aprendizaje" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const organizationId = session?.user?.organizationId;
    if (!userId || !organizationId) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: "JSON inválido" }, { status: 400 });
    }

    if (body.wizard && typeof body.wizard === "object") {
      const w = body.wizard as {
        preferredModality?: LearningModality;
        stepByStep?: boolean;
        simplified?: boolean;
        summaries?: boolean;
        examples?: boolean;
        simulations?: boolean;
      };
      await applyWizardToProfiles(userId, organizationId, {
        preferredModality: w.preferredModality ?? "MIXED",
        stepByStep: w.stepByStep ?? false,
        simplified: w.simplified ?? false,
        summaries: w.summaries ?? false,
        examples: w.examples ?? false,
        simulations: w.simulations ?? false,
      });
      const profile = await getOrCreateLearningProfile(userId, organizationId);
      return Response.json({ profile: serializeLearningProfile(profile) });
    }

    await getOrCreateLearningProfile(userId, organizationId);
    const profile = await db.learningProfile.update({
      where: { userId },
      data: {
        supportLevel: body.supportLevel as SupportLevel | undefined,
        modalityScores:
          typeof body.modalityScores === "object"
            ? (body.modalityScores as object)
            : undefined,
      },
    });

    return Response.json({ profile: serializeLearningProfile(profile) });
  } catch (error) {
    console.error("[learning-profile PATCH]", error);
    return Response.json(
      { error: "No se pudo actualizar el perfil de aprendizaje" },
      { status: 500 }
    );
  }
}
