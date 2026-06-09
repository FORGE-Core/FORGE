import { auth } from "@/auth";
import { checkApiRateLimit } from "@/lib/api-guard";
import { enrichRAGSources } from "@/lib/chat/enrich-sources";
import { db } from "@/lib/db";
import { logLearningEvent } from "@/lib/learning/events";
import { prepareRAGContext, streamRAGAnswer } from "@/ai/rag/stream-pipeline";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  const organizationId = session?.user?.organizationId;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? null;

  const guard = checkApiRateLimit(userId, ip, 40);
  if (guard.blocked) return guard.response;

  let body: { message?: string; conversationId?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Cuerpo JSON inválido" }, { status: 400 });
  }

  const message = body.message?.trim();
  if (!message) {
    return Response.json({ error: "Mensaje requerido" }, { status: 400 });
  }

  if (!organizationId || !userId) {
    return Response.json(
      { error: "Debes iniciar sesión para usar el mentor IA" },
      { status: 401 }
    );
  }

  let conversationId = body.conversationId;
  if (!conversationId) {
    const conv = await db.conversation.create({
      data: {
        organizationId,
        userId,
        title: message.slice(0, 80),
      },
    });
    conversationId = conv.id;
  }

  const { sources } = await prepareRAGContext(organizationId, message);
  const enriched = await enrichRAGSources(sources);

  const encoder = new TextEncoder();
  let fullAnswer = "";

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };

      send("meta", {
        conversationId,
        sources: enriched,
        officialDocs: enriched.length > 0,
        confidence: enriched.length > 0 ? "high" : "low",
      });

      try {
        for await (const chunk of streamRAGAnswer({
          organizationId,
          question: message,
        })) {
          fullAnswer += chunk;
          send("token", { text: chunk });
        }

        await db.message.createMany({
          data: [
            { conversationId, role: "user", content: message },
            {
              conversationId,
              role: "assistant",
              content: fullAnswer,
              sources: enriched as object[],
            },
          ],
        });

        await logLearningEvent({
          organizationId,
          userId,
          eventType: "CHAT_QUESTION",
          payload: { conversationId, sourceCount: enriched.length, stream: true },
        });

        send("done", { answer: fullAnswer });
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Error al generar respuesta";
        send("error", { error: msg });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
