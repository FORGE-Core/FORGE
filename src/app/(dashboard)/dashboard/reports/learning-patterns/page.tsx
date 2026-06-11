import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AccessDenied } from "@/components/shared/access-denied";
import { getLearningPatternReport } from "@/lib/alae/learning-analytics";
import { canViewReports } from "@/lib/auth/roles";
import { LearningPatternsView } from "./learning-patterns-view";

export default async function LearningPatternsPage() {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) redirect("/login");

  if (!canViewReports(session.user.role)) {
    return (
      <AccessDenied
        title="Patrones de aprendizaje"
        description="Esta vista está disponible para administradores y supervisores."
        backHref="/dashboard/reports"
        backLabel="Volver a reportes"
      />
    );
  }

  const report = await getLearningPatternReport(organizationId);
  return <LearningPatternsView report={report} />;
}
