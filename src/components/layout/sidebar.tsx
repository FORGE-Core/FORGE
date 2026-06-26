"use client";

import {
  BarChart3,
  BookOpen,
  Bot,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  User,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { APP_ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { useTenant } from "@/providers/tenant-provider";

const navItems = [
  { href: APP_ROUTES.home, label: "Inicio", icon: LayoutDashboard, exact: true },
  { href: APP_ROUTES.modules, label: "Módulos", icon: BookOpen },
  { href: APP_ROUTES.activities, label: "Práctica", icon: Zap },
  { href: APP_ROUTES.chat, label: "Mentor IA", icon: Bot },
  { href: APP_ROUTES.documents, label: "Documentos", icon: FileText },
  {
    href: APP_ROUTES.reports,
    label: "Reportes",
    icon: BarChart3,
    roles: ["ADMIN", "SUPERVISOR"] as const,
  },
  {
    href: APP_ROUTES.team,
    label: "Equipo",
    icon: Users,
    roles: ["ADMIN", "SUPERVISOR"] as const,
  },
  { href: APP_ROUTES.profile, label: "Mi perfil", icon: User },
  { href: APP_ROUTES.settings, label: "Ajustes", icon: Settings },
];

function userInitials(name?: string | null, email?: string | null) {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
  }
  return (email?.[0] ?? "U").toUpperCase();
}

export function Sidebar() {
  const pathname = usePathname();
  const tenant = useTenant();

  const visibleItems = navItems.filter((item) => {
    if ("roles" in item && item.roles) {
      return item.roles.includes(tenant.role as "ADMIN" | "SUPERVISOR");
    }
    return true;
  });

  return (
    <aside
      className={cn(
        "group/sidebar relative z-40 m-3 flex h-[calc(100vh-1.5rem)] w-[4.25rem] shrink-0 flex-col",
        "rounded-[28px] bg-[#141414] py-4 text-brand-text-light overflow-hidden",
        "shadow-[0_8px_40px_rgba(0,0,0,0.18)]",
        "transition-[width] duration-200 ease-out hover:w-60"
      )}
      aria-label="Menú lateral"
    >
      {/* Logo */}
      <Link
        href={APP_ROUTES.home}
        prefetch={false}
        aria-label="FORGE, ir al inicio"
        className="mb-5 flex w-full items-center justify-center px-2 group-hover/sidebar:justify-start group-hover/sidebar:gap-3 group-hover/sidebar:px-4"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl gradient-brand font-heading text-sm font-bold text-white">
          F
        </div>
        <span
          className={cn(
            "hidden overflow-hidden whitespace-nowrap font-heading text-lg font-bold",
            "group-hover/sidebar:ml-0 group-hover/sidebar:inline group-hover/sidebar:max-w-[140px]"
          )}
        >
          <span className="text-brand-lavender">FORGE</span>
        </span>
      </Link>

      <nav
        className="flex flex-1 flex-col gap-1 overflow-hidden px-2"
        aria-label="Navegación principal"
      >
        {visibleItems.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className="block"
            >
              <div
                className={cn(
                  "flex items-center rounded-2xl py-2.5 transition-colors duration-150",
                  "justify-center group-hover/sidebar:justify-start group-hover/sidebar:px-3",
                  active
                    ? "bg-white/12 text-white"
                    : "text-white/55 hover:bg-white/8 hover:text-white"
                )}
              >
                <Icon className="h-[1.15rem] w-[1.15rem] shrink-0" strokeWidth={1.75} />
                <span
                  className={cn(
                    "max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium opacity-0",
                    "transition-[max-width,opacity,margin] duration-300 ease-out",
                    "group-hover/sidebar:ml-3 group-hover/sidebar:max-w-[160px] group-hover/sidebar:opacity-100"
                  )}
                >
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-2 space-y-1 border-t border-white/8 px-2 pt-3">
        <div
            className={cn(
              "flex items-center rounded-2xl py-2 transition-all duration-300",
              "justify-center group-hover/sidebar:justify-start group-hover/sidebar:px-3"
            )}
            title={tenant.userEmail ?? undefined}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/12 text-xs font-semibold text-white/90">
              {userInitials(tenant.userName, tenant.userEmail)}
            </div>
            <div
              className={cn(
                "max-w-0 overflow-hidden opacity-0",
                "transition-[max-width,opacity,margin] duration-300 ease-out",
                "group-hover/sidebar:ml-3 group-hover/sidebar:max-w-[160px] group-hover/sidebar:opacity-100"
              )}
            >
              <p className="truncate text-sm font-medium text-white/90">
                {tenant.userName ?? "Usuario"}
              </p>
              <p className="truncate text-xs text-white/45">{tenant.userEmail}</p>
            </div>
          </div>

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          aria-label="Cerrar sesión"
          className={cn(
            "flex w-full items-center rounded-2xl py-2.5 text-white/55 transition-all duration-200",
            "justify-center hover:bg-white/8 hover:text-white",
            "group-hover/sidebar:justify-start group-hover/sidebar:px-3"
          )}
          title="Cerrar sesión"
        >
          <LogOut className="h-[1.15rem] w-[1.15rem] shrink-0" strokeWidth={1.75} />
          <span
            className={cn(
              "max-w-0 overflow-hidden whitespace-nowrap text-sm opacity-0",
              "transition-[max-width,opacity,margin] duration-300 ease-out",
              "group-hover/sidebar:ml-3 group-hover/sidebar:max-w-[140px] group-hover/sidebar:opacity-100"
            )}
          >
            Cerrar sesión
          </span>
        </button>
      </div>
    </aside>
  );
}
