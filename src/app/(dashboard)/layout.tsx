import { redirect } from "next/navigation";
import { AlaeDashboardShell } from "@/components/alae/alae-dashboard-shell";
import { Sidebar } from "@/components/layout/sidebar";
import { getCachedTenant } from "@/lib/auth/cached-session";
import { TenantProvider } from "@/providers/tenant-provider";
import { TenantThemeProvider } from "@/providers/tenant-theme-provider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await getCachedTenant();
  if (!tenant) redirect("/login");

  return (
    <TenantProvider tenant={tenant}>
      <TenantThemeProvider>
        <AlaeDashboardShell>
          <div className="flex min-h-screen">
            <Sidebar />
            <main
              id="main-content"
              className="main-content-area min-w-0 flex-1 overflow-auto p-4 md:p-6 lg:p-8"
              role="main"
              tabIndex={-1}
            >
              {children}
            </main>
          </div>
        </AlaeDashboardShell>
      </TenantThemeProvider>
    </TenantProvider>
  );
}
