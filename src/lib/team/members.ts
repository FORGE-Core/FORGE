import { db } from "@/lib/db";

export type TeamMember = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  status: string;
  _count: { progress: number; activityAttempts: number };
};

export async function getTeamMembers(organizationId: string) {
  return db.user.findMany({
    where: { organizationId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      _count: {
        select: {
          progress: true,
          activityAttempts: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
