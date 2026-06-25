import { db } from "@/lib/db";
import { ServiceError } from "@/services/server/errors";

export async function assertModuleInOrganization(
  moduleId: string,
  organizationId: string
) {
  const mod = await db.trainingModule.findFirst({
    where: { id: moduleId, organizationId },
    select: { id: true },
  });
  if (!mod) {
    throw new ServiceError(
      "NOT_FOUND",
      "El módulo no pertenece a esta organización"
    );
  }
  return mod;
}

export async function assertDocumentInOrganization(
  documentId: string,
  organizationId: string
) {
  const doc = await db.document.findFirst({
    where: { id: documentId, organizationId },
  });
  if (!doc) {
    throw new ServiceError("NOT_FOUND", "Documento no encontrado");
  }
  return doc;
}

export async function assertConversationOwnedByUser(
  conversationId: string,
  organizationId: string,
  userId: string
) {
  const conversation = await db.conversation.findFirst({
    where: { id: conversationId, organizationId, userId },
    select: { id: true },
  });
  if (!conversation) {
    throw new ServiceError("NOT_FOUND", "Conversación no encontrada");
  }
  return conversation;
}

export async function resolveOrCreateConversation(
  organizationId: string,
  userId: string,
  conversationId: string | undefined,
  title: string
) {
  if (conversationId) {
    await assertConversationOwnedByUser(
      conversationId,
      organizationId,
      userId
    );
    return conversationId;
  }

  const conv = await db.conversation.create({
    data: {
      organizationId,
      userId,
      title: title.slice(0, 80),
    },
  });
  return conv.id;
}
