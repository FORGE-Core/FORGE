import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth/roles";
import { db } from "@/lib/db";
import { requireTenantApi } from "@/lib/api/tenant-route";

export async function GET() {
  try {
    const tenant = await requireTenantApi();
    if (!tenant.ok) return tenant.response;

    const { organizationId } = tenant.ctx;
    const admin = isAdmin(tenant.ctx.role);

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

    if (completed || !admin) {
      return NextResponse.json({
        completed,
        steps: {
          documents: true,
          team: true,
          chat: true,
        },
        counts: { documents: 0, users: 0, chatQuestions: 0 },
        isAdmin: admin,
      });
    }

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
      counts: {
        documents: documentCount,
        users: userCount,
        chatQuestions: chatCount,
      },
      isAdmin: admin,
    });
  } catch (error) {
    console.error("[onboarding/status GET]", error);
    return NextResponse.json(
      { error: "No se pudo cargar el estado de onboarding" },
      { status: 500 }
    );
  }
}
