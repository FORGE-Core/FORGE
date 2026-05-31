import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { NovaWidget } from "@/components/nova/nova-widget";
import { Sidebar } from "@/components/layout/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex min-h-screen bg-brand-light-bg">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6 md:p-8">{children}</main>
      <NovaWidget />
    </div>
  );
}
