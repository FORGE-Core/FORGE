import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { ensureModuleQuiz } from "@/lib/activities/quiz";
import {
  parseErrorDetectionContent,
  parseOrderStepsContent,
  parseQuizContent,
} from "@/lib/activities/types";
import { db } from "@/lib/db";

const ACTIVITY_TYPES = [
  "MULTIPLE_CHOICE",
  "TRUE_FALSE",
  "ORDER_STEPS",
  "ERROR_DETECTION",
] as const;

function serializeActivity(
  activity: {
    id: string;
    title: string;
    type: string;
    content: unknown;
    module: { title: string; slug: string | null };
  },
  index: number,
  total: number
) {
  const base = {
    id: activity.id,
    title: activity.title,
    type: activity.type,
    moduleTitle: activity.module.title,
    moduleSlug: activity.module.slug,
    current: index + 1,
    total,
  };

  if (activity.type === "ORDER_STEPS") {
    const content = parseOrderStepsContent(activity.content);
    return {
      ...base,
      question: content?.question,
      steps: content?.steps,
      explanation: content?.explanation,
    };
  }

  if (activity.type === "ERROR_DETECTION") {
    const content = parseErrorDetectionContent(activity.content);
    return {
      ...base,
      question: content?.question,
      steps: content?.steps,
      explanation: content?.explanation,
    };
  }

  const quiz = parseQuizContent(activity.content);
  return {
    ...base,
    question: quiz?.question,
    options: quiz?.options,
    explanation: quiz?.explanation,
  };
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    const organizationId = session?.user?.organizationId;
    const userId = session?.user?.id;

    if (!organizationId || !userId) {
      return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const moduleId = searchParams.get("moduleId");
    const index = Math.max(0, Number(searchParams.get("index") ?? 0));

    if (moduleId) {
      const mod = await db.trainingModule.findFirst({
        where: { id: moduleId, organizationId, status: "PUBLISHED" },
      });
      if (!mod) {
        return NextResponse.json({ error: "Módulo no encontrado" }, { status: 404 });
      }
      await ensureModuleQuiz(organizationId, mod.id, mod.title);
    } else {
      const modules = await db.trainingModule.findMany({
        where: { organizationId, status: "PUBLISHED" },
        take: 1,
      });
      if (modules[0]) {
        await ensureModuleQuiz(organizationId, modules[0].id, modules[0].title);
      }
    }

    const activities = await db.activity.findMany({
      where: {
        organizationId,
        ...(moduleId ? { moduleId } : {}),
        type: { in: [...ACTIVITY_TYPES] },
      },
      include: {
        module: { select: { title: true, slug: true } },
        attempts: {
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const activity = activities[index];
    if (!activity) {
      return NextResponse.json({ activity: null, total: activities.length });
    }

    return NextResponse.json({
      activity: {
        ...serializeActivity(activity, index, activities.length),
        lastPassed: activity.attempts[0]?.passed ?? false,
      },
      total: activities.length,
    });
  } catch (error) {
    console.error("[activities GET]", error);
    return NextResponse.json(
      { error: "No se pudieron cargar las actividades" },
      { status: 500 }
    );
  }
}
