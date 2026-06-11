import { getAIProvider } from "@/ai/providers";
import { db } from "@/lib/db";
import type { LearningPace } from "@prisma/client";
import { buildSimplifyPrompt, buildStepByStepPrompt } from "./prompts";
import type { AdaptRequest, AdaptResult } from "./types";

export async function adaptContent(
  request: AdaptRequest,
  meta: {
    organizationId: string;
    userId: string;
    sourceId?: string;
    sourceType?: string;
    learningPace?: LearningPace;
  }
): Promise<AdaptResult> {
  const provider = getAIProvider();
  const pace = meta.learningPace ?? "NORMAL";

  if (request.type === "SIMPLIFY") {
    const answer = await provider.chat({
      messages: [
        { role: "system", content: buildSimplifyPrompt(pace) },
        {
          role: "user",
          content: request.title
            ? `Título: ${request.title}\n\n${request.content}`
            : request.content,
        },
      ],
      temperature: 0.3,
      maxTokens: 1500,
    });

    await db.contentAdaptation.create({
      data: {
        organizationId: meta.organizationId,
        userId: meta.userId,
        sourceType: meta.sourceType ?? "TEXT",
        sourceId: meta.sourceId ?? "inline",
        adaptationType: "SIMPLIFY",
        outputContent: { content: answer },
      },
    });

    return { type: "SIMPLIFY", content: answer };
  }

  const raw = await provider.chat({
    messages: [
      { role: "system", content: buildStepByStepPrompt(pace) },
      {
        role: "user",
        content: request.title
          ? `Título: ${request.title}\n\n${request.content}`
          : request.content,
      },
    ],
    temperature: 0.2,
    maxTokens: 2000,
  });

  let steps: AdaptResult["steps"] = [];
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]) as {
        steps?: { order: number; title: string; body: string }[];
      };
      steps = parsed.steps ?? [];
    }
  } catch {
    steps = raw
      .split("\n")
      .filter((l) => l.trim())
      .slice(0, 8)
      .map((line, i) => ({
        order: i + 1,
        title: `Paso ${i + 1}`,
        body: line.replace(/^\d+\.\s*/, ""),
      }));
  }

  await db.contentAdaptation.create({
    data: {
      organizationId: meta.organizationId,
      userId: meta.userId,
      sourceType: meta.sourceType ?? "TEXT",
      sourceId: meta.sourceId ?? "inline",
      adaptationType: "STEP_BY_STEP",
      outputContent: { steps },
    },
  });

  return {
    type: "STEP_BY_STEP",
    content: steps.map((s) => `**${s.title}**\n${s.body}`).join("\n\n"),
    steps,
  };
}
