"use client";

import { createContext, useContext, useMemo } from "react";
import {
  canManageDocuments,
  canManageTeam,
  canUploadMedia,
  canViewReports,
  isAdmin,
  isSupervisor,
} from "@/lib/auth/roles";
import type { TenantSnapshot } from "@/lib/tenant/types";

const TenantContext = createContext<TenantSnapshot | null>(null);

export function TenantProvider({
  tenant,
  children,
}: {
  tenant: TenantSnapshot;
  children: React.ReactNode;
}) {
  return (
    <TenantContext.Provider value={tenant}>{children}</TenantContext.Provider>
  );
}

export function useTenant(): TenantSnapshot {
  const ctx = useContext(TenantContext);
  if (!ctx) {
    throw new Error("useTenant debe usarse dentro de TenantProvider");
  }
  return ctx;
}

export function useTenantOptional(): TenantSnapshot | null {
  return useContext(TenantContext);
}

/** Permisos derivados del rol en el tenant actual. */
export function useTenantPermissions() {
  const tenant = useTenant();
  const role = tenant.role;

  return useMemo(
    () => ({
      role,
      isAdmin: isAdmin(role),
      isSupervisor: isSupervisor(role),
      canViewReports: canViewReports(role),
      canManageTeam: canManageTeam(role),
      canManageDocuments: canManageDocuments(role),
      canUploadMedia: canUploadMedia(role),
      organizationId: tenant.organizationId,
      plan: tenant.plan,
      features: tenant.features,
    }),
    [role, tenant.organizationId, tenant.plan, tenant.features]
  );
}

export type TenantPermissions = ReturnType<typeof useTenantPermissions>;
