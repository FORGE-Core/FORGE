import { db } from "@/lib/db";

export type InclusionPolicy = {
  minAcceptableScore: number;
  requireExamples: boolean;
  autoAuditOnUpload: boolean;
};

const DEFAULT_POLICY: InclusionPolicy = {
  minAcceptableScore: 60,
  requireExamples: true,
  autoAuditOnUpload: true,
};

export async function getOrganizationInclusionPolicy(
  organizationId: string
): Promise<InclusionPolicy> {
  const org = await db.organization.findUnique({
    where: { id: organizationId },
    select: { settings: true },
  });

  if (
    org?.settings &&
    typeof org.settings === "object" &&
    "alae" in org.settings
  ) {
    const alae = (org.settings as { alae?: Partial<InclusionPolicy> }).alae;
    return { ...DEFAULT_POLICY, ...alae };
  }

  return DEFAULT_POLICY;
}
