/**
 * Cached wrappers for heavy page data fetchers.
 * unstable_cache stores results server-side between requests.
 * Cache key = explicit tag + serialized function args (per-user/org).
 */
import { unstable_cache } from "next/cache";
import type { UserRole } from "@prisma/client";
import { db } from "@/lib/db";

// ── Dashboard ────────────────────────────────────────────────────────────────
export const cachedDashboardData = unstable_cache(
  async (
    organizationId: string,
    userId: string,
    role: string,
    userName: string | null,
    orgName: string
  ) => {
    const { getDashboardData } = await import(
      "@/services/server/dashboard/dashboard.service"
    );
    return getDashboardData(
      { organizationId, userId, role: role as UserRole, db },
      userName,
      orgName
    );
  },
  ["page-dashboard"],
  { revalidate: 30 }
);

// ── Modules ──────────────────────────────────────────────────────────────────
export const cachedOrganizationModules = unstable_cache(
  async (organizationId: string, userId: string, role: string) => {
    const { getOrganizationModules } = await import(
      "@/services/server/training/modules.service"
    );
    const { getLatestInclusionScores } = await import(
      "@/lib/alae/inclusion-scorer"
    );
    const { isAdmin } = await import("@/lib/auth/roles");

    let modules = await getOrganizationModules(organizationId, userId, db);

    if (isAdmin(role as UserRole)) {
      const scores = await getLatestInclusionScores(
        organizationId,
        "MODULE",
        modules.map((m) => m.id)
      );
      modules = modules.map((m) => ({
        ...m,
        inclusionScore: scores.get(m.id)?.score ?? null,
      }));
    }

    return modules;
  },
  ["page-modules"],
  { revalidate: 30 }
);

// ── Profile ──────────────────────────────────────────────────────────────────
export const cachedProfileData = unstable_cache(
  async (
    organizationId: string,
    userId: string,
    role: string,
    userName: string | null,
    userEmail: string,
    orgName: string
  ) => {
    const { getProfileData } = await import(
      "@/services/server/profile/profile.service"
    );
    return getProfileData(
      { organizationId, userId, role: role as UserRole, db },
      { name: userName, email: userEmail, role: role as UserRole },
      orgName
    );
  },
  ["page-profile"],
  { revalidate: 30 }
);

// ── Documents ────────────────────────────────────────────────────────────────
export const cachedDocuments = unstable_cache(
  async (organizationId: string, role: string) => {
    const { listDocuments } = await import(
      "@/services/server/documents/document.service"
    );
    return listDocuments({ organizationId, role: role as UserRole, db });
  },
  ["page-documents"],
  { revalidate: 20 }
);

// ── Team ─────────────────────────────────────────────────────────────────────
export const cachedTeamMembers = unstable_cache(
  async (organizationId: string) => {
    const { getTeamMembers } = await import("@/lib/team/members");
    return getTeamMembers(organizationId);
  },
  ["page-team"],
  { revalidate: 30 }
);

// ── Settings ─────────────────────────────────────────────────────────────────
export const cachedOrganizationSettings = unstable_cache(
  async (organizationId: string) => {
    const { getOrganizationSettings } = await import(
      "@/lib/organization/settings"
    );
    return getOrganizationSettings(organizationId);
  },
  ["page-settings-v2"],
  { revalidate: 60 }
);

// ── Reports ──────────────────────────────────────────────────────────────────
export const cachedReportsData = unstable_cache(
  async (organizationId: string, role: string) => {
    const [
      { getReportsOverview },
      { getEnrichedInclusionReport },
      { getLearningPatternReport },
    ] = await Promise.all([
      import("@/services/server/reports"),
      import("@/services/server/reports/inclusion-report.service"),
      import("@/lib/alae/learning-analytics"),
    ]);

    const [overview, inclusion, patterns] = await Promise.all([
      getReportsOverview({ organizationId, role: role as UserRole, db }),
      getEnrichedInclusionReport(organizationId),
      getLearningPatternReport(organizationId),
    ]);

    return { overview, inclusion, patterns };
  },
  ["page-reports"],
  { revalidate: 60 }
);
