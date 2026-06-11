import { auth } from "@/auth";
import {
  getOrCreateAccessibilityProfile,
  serializeAccessibilityProfile,
  updateAccessibilityProfile,
} from "@/lib/alae/accessibility-profile";
import { logAccessibilityEvent } from "@/lib/alae/events";
import type { LearningModality, LearningPace } from "@prisma/client";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const organizationId = session?.user?.organizationId;
    if (!userId || !organizationId) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }

    const profile = await getOrCreateAccessibilityProfile(userId, organizationId);
    return Response.json({ profile: serializeAccessibilityProfile(profile) });
  } catch (error) {
    console.error("[accessibility/profile GET]", error);
    return Response.json(
      { error: "No se pudo cargar el perfil de accesibilidad" },
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

    const profile = await updateAccessibilityProfile(userId, organizationId, {
      fontScale: typeof body.fontScale === "number" ? body.fontScale : undefined,
      highContrast:
        typeof body.highContrast === "boolean" ? body.highContrast : undefined,
      darkMode: typeof body.darkMode === "boolean" ? body.darkMode : undefined,
      reduceMotion:
        typeof body.reduceMotion === "boolean" ? body.reduceMotion : undefined,
      preferredModality: body.preferredModality as LearningModality | undefined,
      simplifiedLanguage:
        typeof body.simplifiedLanguage === "boolean"
          ? body.simplifiedLanguage
          : undefined,
      stepByStepMode:
        typeof body.stepByStepMode === "boolean" ? body.stepByStepMode : undefined,
      autoReadAloud:
        typeof body.autoReadAloud === "boolean" ? body.autoReadAloud : undefined,
      captionsEnabled:
        typeof body.captionsEnabled === "boolean" ? body.captionsEnabled : undefined,
      learningPace: body.learningPace as LearningPace | undefined,
      wizardCompleted:
        typeof body.wizardCompleted === "boolean"
          ? body.wizardCompleted
          : undefined,
      voiceCommandsEnabled:
        typeof body.voiceCommandsEnabled === "boolean"
          ? body.voiceCommandsEnabled
          : undefined,
      voiceInputEnabled:
        typeof body.voiceInputEnabled === "boolean"
          ? body.voiceInputEnabled
          : undefined,
      declaredNeeds:
        typeof body.declaredNeeds === "object" && body.declaredNeeds
          ? (body.declaredNeeds as object)
          : undefined,
    });

    await logAccessibilityEvent({
      organizationId,
      userId,
      eventType: "PROFILE_UPDATED",
      payload: body,
    });

    return Response.json({ profile: serializeAccessibilityProfile(profile) });
  } catch (error) {
    console.error("[accessibility/profile PATCH]", error);
    return Response.json(
      { error: "No se pudo actualizar el perfil de accesibilidad" },
      { status: 500 }
    );
  }
}
