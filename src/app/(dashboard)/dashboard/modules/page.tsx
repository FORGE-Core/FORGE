import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/auth/roles";
import { getLatestInclusionScores } from "@/lib/alae/inclusion-scorer";
import { getOrganizationModules } from "@/lib/training/modules";
import { ModulesContent } from "./modules-content";

export default async function ModulesPage() {
  const session = await auth();
  const organizationId = session?.user?.organizationId;
  const userId = session?.user?.id;

  if (!organizationId || !userId) redirect("/login");

  let modules = await getOrganizationModules(organizationId, userId);

  if (isAdmin(session.user.role)) {
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

  return <ModulesContent initialModules={modules} />;
}
