import { auth } from "@/auth";
import { getLearningPatternReport } from "@/lib/alae/learning-analytics";
import { canViewReports } from "@/lib/auth/roles";

export async function GET() {
  const session = await auth();
  const organizationId = session?.user?.organizationId;
  const role = session?.user?.role;

  if (!organizationId || !canViewReports(role)) {
    return Response.json({ error: "No autorizado" }, { status: 403 });
  }

  const report = await getLearningPatternReport(organizationId);
  return Response.json(report);
}
