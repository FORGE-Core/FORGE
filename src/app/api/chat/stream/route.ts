import { checkApiRateLimit } from "@/lib/api-guard";
import { serviceErrorJsonResponse } from "@/lib/api/service-response";
import { requireTenantSession } from "@/lib/tenant";
import { tenantAuthJsonError } from "@/lib/api/tenant-route";
import {
  persistMentorStreamResult,
  prepareMentorStream,
  streamRAGAnswer,
} from "@/services/server/chat";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const tenant = await requireTenantSession();
  if (!tenant.ok) return tenantAuthJsonError(tenant);

  const { userId, organizationId, role, db } = tenant.ctx;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? null;

  const guard = checkApiRateLimit(userId, ip, 40);
  if (guard.blocked) return guard.response;

  let body: { message?: string; conversationId?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Cuerpo JSON inválido" }, { status: 400 });
  }

  const ctx = { organizationId, userId, role, db };

  let setup: Awaited<ReturnType<typeof prepareMentorStream>>;
  try {
    setup = await prepareMentorStream(ctx, {
      message: body.message ?? "",
      conversationId: body.conversationId,
    });
  } catch (error) {
    return serviceErrorJsonResponse(error);
  }

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
        conversationId: setup.conversationId,
        sources: setup.enriched,
        officialDocs: setup.enriched.length > 0,
        confidence: setup.enriched.length > 0 ? "high" : "low",
      });

      try {
        for await (const chunk of streamRAGAnswer({
          organizationId,
          question: setup.message,
          alaeContext: setup.alaeContext,
          db,
        })) {
          fullAnswer += chunk;
          send("token", { text: chunk });
        }

        await persistMentorStreamResult(ctx, {
          conversationId: setup.conversationId,
          message: setup.message,
          fullAnswer,
          enriched: setup.enriched,
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
