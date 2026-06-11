import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    const organizationId = session?.user?.organizationId;

    if (!organizationId) {
      return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });
    }

    const org = await db.organization.findUnique({
      where: { id: organizationId },
      select: { settings: true },
    });

    const settings = (org?.settings ?? {}) as Record<string, unknown>;
    const notifications = (settings.notifications ?? {}) as Record<
      string,
      unknown
    >;
    const completed = notifications.onboardingCompleted === true;

    const [documentCount, userCount, chatCount] = await Promise.all([
      db.document.count({
        where: { organizationId, status: "READY" },
      }),
      db.user.count({
        where: { organizationId, status: "ACTIVE" },
      }),
      db.message.count({
        where: {
          role: "user",
          conversation: { organizationId },
        },
      }),
    ]);

    return NextResponse.json({
      completed,
      steps: {
        documents: documentCount > 0,
        team: userCount > 1,
        chat: chatCount > 0,
      },
      counts: { documents: documentCount, users: userCount, chatQuestions: chatCount },
      isAdmin: session?.user?.role === "ADMIN",
    });
  } catch (error) {
    console.error("[onboarding/status GET]", error);
    return NextResponse.json(
      { error: "No se pudo cargar el estado de onboarding" },
      { status: 500 }
    );
  }
}
