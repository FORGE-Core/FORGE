import { cache } from "react";
import { auth } from "@/auth";
import { getTenantSnapshotForSession } from "@/lib/tenant";

/** Una sola lectura de sesión por request de servidor (layout + páginas). */
export const getCachedSession = cache(async () => auth());

/** Tenant del usuario actual, deduplicado por request. */
export const getCachedTenant = cache(async () => {
  const session = await getCachedSession();
  if (!session?.user) return null;
  return getTenantSnapshotForSession(session);
});
