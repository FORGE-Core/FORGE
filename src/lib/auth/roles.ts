import type { Session } from "next-auth";
import type { UserRole } from "@prisma/client";

export function isAdmin(role: UserRole | undefined): boolean {
  return role === "ADMIN";
}

export function isSupervisor(role: UserRole | undefined): boolean {
  return role === "SUPERVISOR";
}

/** Reportes, equipo y detalle de miembros (admin + supervisor). */
export function canViewReports(role: UserRole | undefined): boolean {
  return isAdmin(role) || isSupervisor(role);
}

export function canManageTeam(role: UserRole | undefined): boolean {
  return isAdmin(role);
}

export function canUploadMedia(role: UserRole | undefined): boolean {
  return isAdmin(role);
}

export function canManageDocuments(role: UserRole | undefined): boolean {
  return isAdmin(role);
}

/** Tipos visibles para empleados y supervisores (solo biblioteca publicada). */
export const EMPLOYEE_VISIBLE_DOCUMENT_TYPES = ["PDF", "VIDEO", "IMAGE"] as const;

export function getAdminRequiredError() {
  return "Solo los administradores pueden realizar esta acción";
}

export function assertAdminSession(session: Session | null) {
  if (!session?.user?.organizationId) {
    return { ok: false as const, status: 401, error: "Debes iniciar sesión" };
  }
  if (!isAdmin(session.user.role)) {
    return { ok: false as const, status: 403, error: getAdminRequiredError() };
  }
  return { ok: true as const, session };
}
