"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { announce } from "@/lib/alae/announcer";

const ROUTE_LABELS: Record<string, string> = {
  "/inicio": "Inicio",
  "/modules": "Módulos de capacitación",
  "/activities": "Práctica",
  "/chat": "Mentor IA",
  "/documents": "Documentos",
  "/reports": "Reportes",
  "/team": "Equipo",
  "/profile": "Mi perfil",
  "/settings": "Ajustes",
  "/onboarding": "Configuración inicial",
};

function labelForPath(pathname: string): string {
  if (ROUTE_LABELS[pathname]) return ROUTE_LABELS[pathname];

  if (pathname.startsWith("/modules/")) {
    const slug = pathname.split("/")[2]?.replace(/-/g, " ") ?? "módulo";
    return `Módulo: ${slug}`;
  }
  if (pathname.startsWith("/team/")) return "Detalle del miembro del equipo";

  return "Página de FORGE";
}

/** Informa a lectores de pantalla cuando el usuario cambia de sección. */
export function RouteAnnouncer() {
  const pathname = usePathname();
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    const label = labelForPath(pathname);
    announce(`Navegaste a ${label}`);
  }, [pathname]);

  return null;
}
