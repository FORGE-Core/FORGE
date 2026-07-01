"use client";

import { useEffect } from "react";
import {
  applyBrandingToDocument,
  resetBrandingOnDocument,
} from "@/lib/organization/branding";
import { useTenantOptional } from "@/providers/tenant-provider";
import { resolveOrganizationBranding } from "@/lib/organization/branding";

export function TenantThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = useTenantOptional();
  const branding = resolveOrganizationBranding(tenant?.branding);

  useEffect(() => {
    applyBrandingToDocument(branding);
    return () => resetBrandingOnDocument();
  }, [
    branding.primary,
    branding.secondary,
    branding.accent,
    tenant?.organizationId,
  ]);

  return children;
}
