import type { Prisma } from "@prisma/client";
import { getAIProvider } from "@/ai/providers";
import { db } from "@/lib/db";

const GENERATION_PROMPT = `Eres un diseñador instruccional para capacitación operativa empresarial.
A partir del contenido del documento, genera material de aprendizaje en JSON válido (sin markdown, sin comentarios).

Estructura exacta:
{
  "moduleTitle": "título corto del módulo",
  "moduleDescription": "2-3 oraciones",
  "process": {
    "title": "nombre del procedimiento",
    "description": "resumen",
    "steps": [{"title": "paso", "description": "qué hacer"}]
  },
  "quiz": {
    "question": "pregunta de opción múltiple",
    "options": [
      {"id": "a", "text": "...", "correct": false},
      {"id": "b", "text": "...", "correct": true},
      {"id": "c", "text": "...", "correct": false},
      {"id": "d", "text": "...", "correct": false}
    ],
    "explanation": "por qué la respuesta correcta"
  },
  "trueFalse": {
    "question": "afirmación verdadera o falsa",
    "correct": true,
    "explanation": "..."
  },
  "simulation": {
    "title": "título del caso",
    "scenario": "situación realista de 2-3 oraciones",
    "options": [
      {"id": "a", "label": "A", "text": "...", "score": 20},
      {"id": "b", "label": "B", "text": "...", "score": 100},
      {"id": "c", "label": "C", "text": "...", "score": 10},
      {"id": "d", "label": "D", "text": "...", "score": 0}
    ],
    "aiAnalysis": "retroalimentación breve"
  },
  "orderSteps": {
    "question": "Ordena los pasos del procedimiento",
    "steps": [{"id": "1", "text": "..."}],
    "correctOrder": ["1", "2", "3"],
    "explanation": "..."
  },
  "errorDetection": {
    "question": "¿Qué paso es incorrecto?",
    "steps": [
      {"id": "a", "text": "...", "hasError": false},
      {"id": "b", "text": "...", "hasError": true}
    ],
    "explanation": "..."
  }
}

REGLAS:
- Usa SOLO información del documento proporcionado.
- steps: entre 3 y 6 pasos.
- Una sola opción correcta en quiz.
- simulation: exactamente 4 opciones, una claramente mejor (score 100).
- Responde ÚNICAMENTE con el JSON.`;

type GeneratedPayload = {
  moduleTitle?: string;
  moduleDescription?: string;
  process?: {
    title: string;
    description?: string;
    steps?: { title: string; description?: string }[];
  };
  quiz?: {
    question: string;
    options: { id: string; text: string; correct: boolean }[];
    explanation: string;
  };
  trueFalse?: {
    question: string;
    correct: boolean;
    explanation: string;
  };
  simulation?: {
    title: string;
    scenario: string;
    options: { id: string; label: string; text: string; score: number }[];
    aiAnalysis: string;
  };
  orderSteps?: {
    question: string;
    steps: { id: string; text: string }[];
    correctOrder: string[];
    explanation: string;
  };
  errorDetection?: {
    question: string;
    steps: { id: string; text: string; hasError?: boolean }[];
    explanation: string;
  };
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function parseGeneratedJson(raw: string): GeneratedPayload | null {
  const trimmed = raw.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    return JSON.parse(jsonMatch[0]) as GeneratedPayload;
  } catch {
    return null;
  }
}

export async function generateLearningContentFromDocument({
  organizationId,
  documentId,
  moduleId,
}: {
  organizationId: string;
  documentId: string;
  moduleId?: string | null;
}) {
  const document = await db.document.findFirst({
    where: { id: documentId, organizationId },
    include: {
      chunks: { orderBy: { chunkIndex: "asc" }, take: 12 },
    },
  });

  if (!document) throw new Error("Documento no encontrado");
  if (document.status !== "READY") {
    throw new Error("El documento debe estar procesado antes de generar contenido");
  }
  if (document.chunks.length === 0) {
    throw new Error("El documento no tiene fragmentos indexados");
  }

  const context = document.chunks.map((c) => c.content).join("\n\n").slice(0, 12000);

  const provider = getAIProvider();
  const raw = await provider.chat({
    messages: [
      { role: "system", content: GENERATION_PROMPT },
      {
        role: "user",
        content: `Documento: "${document.title}"\n\nContenido:\n${context}`,
      },
    ],
    temperature: 0.3,
    maxTokens: 4096,
  });

  const generated = parseGeneratedJson(raw);
  if (!generated?.quiz) {
    throw new Error("La IA no devolvió contenido válido. Intenta de nuevo.");
  }

  let targetModuleId = moduleId ?? document.moduleId;

  if (!targetModuleId) {
    const title = generated.moduleTitle ?? document.title;
    const slug = slugify(title) || `modulo-${documentId.slice(-6)}`;
    const existing = await db.trainingModule.findFirst({
      where: { organizationId, slug },
    });

    if (existing) {
      targetModuleId = existing.id;
    } else {
      const count = await db.trainingModule.count({ where: { organizationId } });
      const mod = await db.trainingModule.create({
        data: {
          organizationId,
          slug,
          title,
          description: generated.moduleDescription ?? document.title,
          status: "PUBLISHED",
          orderIndex: count,
          estimatedMins: 20,
        },
      });
      targetModuleId = mod.id;
    }

    await db.document.update({
      where: { id: documentId },
      data: { moduleId: targetModuleId },
    });
  }

  const created: { type: string; id: string; title: string }[] = [];

  if (generated.process?.title) {
    const steps = (generated.process.steps ?? []).map((s) => ({
      title: s.title,
      description: s.description ?? "",
    }));

    const proc = await db.process.create({
      data: {
        organizationId,
        moduleId: targetModuleId,
        title: generated.process.title,
        description: generated.process.description,
        steps: steps as Prisma.InputJsonValue,
        orderIndex: 0,
      },
    });

    await db.document.update({
      where: { id: documentId },
      data: { processId: proc.id },
    });

    created.push({ type: "process", id: proc.id, title: proc.title });
  }

  const quizContent = {
    question: generated.quiz.question,
    options: generated.quiz.options,
    explanation: generated.quiz.explanation,
  };

  const quiz = await db.activity.create({
    data: {
      organizationId,
      moduleId: targetModuleId,
      type: "MULTIPLE_CHOICE",
      title: `Quiz: ${document.title}`,
      content: quizContent as unknown as Prisma.InputJsonValue,
      difficulty: 2,
      points: 15,
      aiGenerated: true,
    },
  });
  created.push({ type: "quiz", id: quiz.id, title: quiz.title });

  if (generated.trueFalse?.question) {
    const tf = await db.activity.create({
      data: {
        organizationId,
        moduleId: targetModuleId,
        type: "TRUE_FALSE",
        title: `V/F: ${document.title}`,
        content: {
          question: generated.trueFalse.question,
          options: [
            { id: "true", text: "Verdadero", correct: generated.trueFalse.correct },
            { id: "false", text: "Falso", correct: !generated.trueFalse.correct },
          ],
          explanation: generated.trueFalse.explanation,
        } as unknown as Prisma.InputJsonValue,
        difficulty: 1,
        points: 10,
        aiGenerated: true,
      },
    });
    created.push({ type: "true_false", id: tf.id, title: tf.title });
  }

  if (generated.simulation?.scenario) {
    const sim = await db.activity.create({
      data: {
        organizationId,
        moduleId: targetModuleId,
        type: "CASE_STUDY",
        title: generated.simulation.title ?? `Simulación: ${document.title}`,
        content: {
          scenario: generated.simulation.scenario,
          options: generated.simulation.options,
          aiAnalysis: generated.simulation.aiAnalysis,
        } as unknown as Prisma.InputJsonValue,
        difficulty: 3,
        points: 25,
        aiGenerated: true,
      },
    });
    created.push({ type: "simulation", id: sim.id, title: sim.title });
  }

  if (generated.orderSteps?.steps?.length) {
    const order = await db.activity.create({
      data: {
        organizationId,
        moduleId: targetModuleId,
        type: "ORDER_STEPS",
        title: `Ordenar pasos: ${document.title}`,
        content: generated.orderSteps as unknown as Prisma.InputJsonValue,
        difficulty: 2,
        points: 15,
        aiGenerated: true,
      },
    });
    created.push({ type: "order_steps", id: order.id, title: order.title });
  }

  if (generated.errorDetection?.steps?.length) {
    const err = await db.activity.create({
      data: {
        organizationId,
        moduleId: targetModuleId,
        type: "ERROR_DETECTION",
        title: `Detectar error: ${document.title}`,
        content: generated.errorDetection as unknown as Prisma.InputJsonValue,
        difficulty: 2,
        points: 15,
        aiGenerated: true,
      },
    });
    created.push({ type: "error_detection", id: err.id, title: err.title });
  }

  await db.document.update({
    where: { id: documentId },
    data: {
      metadata: {
        ...(typeof document.metadata === "object" && document.metadata
          ? (document.metadata as object)
          : {}),
        learningContentGeneratedAt: new Date().toISOString(),
        generatedItems: created.map((c) => c.type),
      },
    },
  });

  try {
    const mod = await db.trainingModule.findUnique({
      where: { id: targetModuleId },
      select: { id: true, title: true, description: true },
    });
    if (mod?.description) {
      const { auditContentInclusion, saveInclusionAudit } = await import(
        "@/lib/alae/inclusion-scorer"
      );
      const result = await auditContentInclusion(
        `${mod.title}\n\n${mod.description}`,
        true
      );
      await saveInclusionAudit({
        organizationId,
        targetType: "MODULE",
        targetId: mod.id,
        result,
      });
    }
  } catch (err) {
    console.warn("[ALAE] auditoría de módulo omitida:", err);
  }

  return {
    moduleId: targetModuleId,
    created,
  };
}
