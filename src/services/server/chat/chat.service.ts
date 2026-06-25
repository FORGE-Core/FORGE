import { queryRAG } from "@/ai/rag/pipeline";
import {
  prepareRAGContext,
  streamRAGAnswer,
} from "@/ai/rag/stream-pipeline";
import { getAlaeContextForUser } from "@/lib/alae/accessibility-profile";
import {
  recordModalityUse,
  syncSupportLevelFromActivity,
} from "@/lib/alae/learning-profile";
import { db } from "@/lib/db";
import { logLearningEvent } from "@/lib/learning/events";
import { ServiceError } from "@/services/server/errors";
import type { ServiceContext } from "@/services/server/types";
import { enrichRAGSources } from "./enrich-sources";
import {
  assertConversationOwnedByUser,
  resolveOrCreateConversation,
} from "@/services/server/shared/tenant-guards";

export async function listConversations(ctx: ServiceContext) {
  const conversations = await db.conversation.findMany({
    where: { organizationId: ctx.organizationId, userId: ctx.userId },
    orderBy: { updatedAt: "desc" },
    take: 30,
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { content: true, role: true, createdAt: true },
      },
      _count: { select: { messages: true } },
    },
  });

  return conversations.map((c) => ({
    id: c.id,
    title: c.title ?? "Conversación",
    updatedAt: c.updatedAt,
    messageCount: c._count.messages,
    preview: c.messages[0]?.content?.slice(0, 80) ?? "",
  }));
}

export async function getConversation(
  ctx: ServiceContext,
  conversationId: string
) {
  const conversation = await db.conversation.findFirst({
    where: {
      id: conversationId,
      organizationId: ctx.organizationId,
      userId: ctx.userId,
    },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!conversation) {
    throw new ServiceError("NOT_FOUND", "Conversación no encontrada");
  }

  return conversation;
}

export async function sendMentorMessage(
  ctx: ServiceContext,
  input: { message: string; conversationId?: string }
) {
  const message = input.message.trim();
  if (!message) {
    throw new ServiceError("VALIDATION", "Mensaje requerido");
  }

  const conversationId = await resolveOrCreateConversation(
    ctx.organizationId,
    ctx.userId,
    input.conversationId,
    message
  );

  const alaeContext = await getAlaeContextForUser(
    ctx.userId,
    ctx.organizationId
  );

  const result = await queryRAG({
    organizationId: ctx.organizationId,
    question: message,
    alaeContext,
  });

  const sources = await enrichRAGSources(ctx.organizationId, result.sources);
  const hasOfficialDocs = sources.length > 0;

  await db.message.createMany({
    data: [
      { conversationId, role: "user", content: message },
      {
        conversationId,
        role: "assistant",
        content: result.answer,
        sources: sources as object[],
      },
    ],
  });

  await logLearningEvent({
    organizationId: ctx.organizationId,
    userId: ctx.userId,
    eventType: "CHAT_QUESTION",
    payload: { conversationId, sourceCount: sources.length },
  });

  const confidence = hasOfficialDocs
    ? sources.some((s) => s.confidence === "high")
      ? "high"
      : "medium"
    : "low";

  return {
    answer: result.answer,
    sources,
    conversationId,
    confidence,
    officialDocs: hasOfficialDocs,
  };
}

export type StreamMentorSetup = {
  conversationId: string;
  message: string;
  enriched: Awaited<ReturnType<typeof enrichRAGSources>>;
  alaeContext: Awaited<ReturnType<typeof getAlaeContextForUser>>;
};

export async function prepareMentorStream(
  ctx: ServiceContext,
  input: { message: string; conversationId?: string }
): Promise<StreamMentorSetup> {
  const message = input.message.trim();
  if (!message) {
    throw new ServiceError("VALIDATION", "Mensaje requerido");
  }

  const conversationId = await resolveOrCreateConversation(
    ctx.organizationId,
    ctx.userId,
    input.conversationId,
    message
  );

  const [{ sources }, alaeContext] = await Promise.all([
    prepareRAGContext(ctx.organizationId, message),
    getAlaeContextForUser(ctx.userId, ctx.organizationId),
  ]);

  const enriched = await enrichRAGSources(ctx.organizationId, sources);

  return { conversationId, message, enriched, alaeContext };
}

export async function persistMentorStreamResult(
  ctx: ServiceContext,
  input: {
    conversationId: string;
    message: string;
    fullAnswer: string;
    enriched: Awaited<ReturnType<typeof enrichRAGSources>>;
  }
) {
  await assertConversationOwnedByUser(
    input.conversationId,
    ctx.organizationId,
    ctx.userId
  );

  await db.message.createMany({
    data: [
      { conversationId: input.conversationId, role: "user", content: input.message },
      {
        conversationId: input.conversationId,
        role: "assistant",
        content: input.fullAnswer,
        sources: input.enriched as object[],
      },
    ],
  });

  await Promise.all([
    logLearningEvent({
      organizationId: ctx.organizationId,
      userId: ctx.userId,
      eventType: "CHAT_QUESTION",
      payload: {
        conversationId: input.conversationId,
        sourceCount: input.enriched.length,
        stream: true,
      },
    }),
    recordModalityUse(ctx.userId, ctx.organizationId, "READING"),
    syncSupportLevelFromActivity(ctx.userId, ctx.organizationId),
  ]);
}

export { streamRAGAnswer };
