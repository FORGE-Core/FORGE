import { db } from "@/lib/db";
import {
  parseOrganizationBranding,
  type OrganizationBranding,
} from "@/lib/organization/branding";

export type OrganizationSettingsData = {
  name: string;
  plan: string;
  industry: string | null;
  branding: OrganizationBranding;
  stats: {
    activeUsers: number;
    moduleCount: number;
    documentCount: number;
  };
  notifications: {
    moduleReminders: boolean;
    weeklySummary: boolean;
    simulationAlerts: boolean;
  };
  inclusionMinScore: number;
};

export async function getOrganizationSettings(organizationId: string) {
  const [org, activeUsers, moduleCount, documentCount] = await Promise.all([
    db.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        name: true,
        slug: true,
        industry: true,
        logoUrl: true,
        settings: true,
      },
    }),
    db.user.count({ where: { organizationId, status: "ACTIVE" } }),
    db.trainingModule.count({
      where: { organizationId, status: "PUBLISHED" },
    }),
    db.document.count({ where: { organizationId } }),
  ]);

  if (!org) return null;

  const settings = (org.settings ?? {}) as Record<string, unknown>;
  const plan = (settings.plan as string) ?? "starter";
  const notifications = (settings.notifications ?? {}) as Record<
    string,
    boolean
  >;
  const alae = (settings.alae ?? {}) as Record<string, unknown>;

  return {
    name: org.name,
    plan,
    industry: org.industry,
    branding: parseOrganizationBranding(settings),
    stats: { activeUsers, moduleCount, documentCount },
    notifications: {
      moduleReminders: notifications.moduleReminders ?? true,
      weeklySummary: notifications.weeklySummary ?? true,
      simulationAlerts: notifications.simulationAlerts ?? true,
    },
    inclusionMinScore: Number(alae.minAcceptableScore ?? 60),
  } satisfies OrganizationSettingsData;
}
