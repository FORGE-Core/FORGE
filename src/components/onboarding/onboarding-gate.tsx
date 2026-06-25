"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  readOnboardingCache,
  writeOnboardingCache,
} from "@/lib/onboarding/client-cache";
import { onboardingClient } from "@/services/client";
import { useTenant } from "@/providers/tenant-provider";

const EXEMPT_PATHS = ["/dashboard/onboarding", "/dashboard/accessibility"];

export function OnboardingGate() {
  const pathname = usePathname();
  const router = useRouter();
  const { role } = useTenant();
  const isAdmin = role === "ADMIN";

  useEffect(() => {
    if (EXEMPT_PATHS.some((p) => pathname.startsWith(p))) return;

    if (!isAdmin) {
      writeOnboardingCache("not-admin");
      return;
    }

    const cached = readOnboardingCache();
    if (cached === "complete") return;
    if (cached === "pending") {
      router.replace("/dashboard/onboarding");
      return;
    }

    let cancelled = false;

    async function check() {
      try {
        const data = await onboardingClient.getStatus();
        if (cancelled) return;

        if (data.completed) {
          writeOnboardingCache("complete");
          return;
        }

        writeOnboardingCache("pending");
        router.replace("/dashboard/onboarding");
      } catch {
        /* no bloquear navegación */
      }
    }

    void check();
    return () => {
      cancelled = true;
    };
  }, [pathname, router, isAdmin]);

  return null;
}
