"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  BookOpen,
  Bot,
  FileText,
  Gamepad2,
  LayoutDashboard,
  LogOut,
  Settings,
  User,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/modules", label: "Módulos", icon: BookOpen },
  { href: "/dashboard/activities", label: "Actividades", icon: Zap },
  { href: "/dashboard/simulations", label: "Simulaciones", icon: Gamepad2 },
  { href: "/dashboard/chat", label: "Mentor IA", icon: Bot },
  { href: "/dashboard/documents", label: "Documentos", icon: FileText },
  { href: "/dashboard/reports", label: "Reportes", icon: BarChart3 },
  {
    href: "/dashboard/team",
    label: "Equipo",
    icon: Users,
    roles: ["ADMIN", "SUPERVISOR"] as const,
  },
  { href: "/dashboard/profile", label: "Mi perfil", icon: User },
  { href: "/dashboard/settings", label: "Ajustes", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-white/10 bg-brand-dark-bg p-4 text-brand-text-light">
      <Link href="/dashboard" className="mb-8 px-3 font-heading text-xl font-bold">
        <span className="text-brand-lavender">FORGE</span>
      </Link>
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {navItems.map((item) => {
          if ("roles" in item && item.roles) {
            const userRole = session?.user?.role;
            if (!userRole || !item.roles.includes(userRole as "ADMIN" | "SUPERVISOR")) {
              return null;
            }
          }
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </motion.div>
            </Link>
          );
        })}
      </nav>
      <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
        {session?.user?.email && (
          <p className="truncate px-3 text-xs text-white/45" title={session.user.email}>
            {session.user.name ?? session.user.email}
          </p>
        )}
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Cerrar sesión
        </button>
      </div>
      <div className="mt-4 rounded-2xl bg-white/5 px-3 py-3 text-xs text-white/50">
        <p className="font-medium text-white/70">NOVA</p>
        <p className="mt-1">Asistente IA siempre disponible</p>
      </div>
    </aside>
  );
}
