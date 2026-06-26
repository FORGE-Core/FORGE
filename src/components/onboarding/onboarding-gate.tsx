"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  readOnboardingCache,
  writeOnboardingCache,
} from "@/lib/onboarding/client-cache";
import { onboardingClient } from "@/services/client";
import { useTenant } from "@/providers/tenant-provider";

const EXEMPT_PATHS = ["/onboarding", "/profile"];

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
      router.replace("/onboarding");
      return;
    }

    let cancelled = false;
    let idleId: number | undefined;

    async function check() {
      try {
        const data = await onboardingClient.getStatus();
        if (cancelled) return;

        if (data.completed) {
          writeOnboardingCache("complete");
          return;
        }

        writeOnboardingCache("pending");
        router.replace("/onboarding");
      } catch {
        /* no bloquear navegación */
      }
    }

    const run = () => {
      if (cancelled) return;
      void check();
    };

    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(run, { timeout: 2000 });
    } else {
      const timer = setTimeout(run, 300);
      return () => {
        cancelled = true;
        clearTimeout(timer);
      };
    }

    return () => {
      cancelled = true;
      if (idleId !== undefined) window.cancelIdleCallback(idleId);
    };
  }, [pathname, router, isAdmin]);

  return null;
}
