import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AlaeDashboardShell } from "@/components/alae/alae-dashboard-shell";
import { DashboardChrome } from "@/components/layout/dashboard-chrome";
import { Sidebar } from "@/components/layout/sidebar";
import { getTenantSnapshotForSession } from "@/lib/tenant";
import { TenantProvider } from "@/providers/tenant-provider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const tenant = await getTenantSnapshotForSession(session);
  if (!tenant) redirect("/login");

  return (
    <TenantProvider tenant={tenant}>
      <AlaeDashboardShell>
        <div className="flex min-h-screen">
          <Sidebar />
          <main
            id="main-content"
            className="min-w-0 flex-1 overflow-auto p-4 md:p-6 lg:p-8"
            role="main"
            tabIndex={-1}
          >
            {children}
          </main>
          <DashboardChrome />
        </div>
      </AlaeDashboardShell>
    </TenantProvider>
  );
}
