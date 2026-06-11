"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const EXEMPT_PATHS = ["/dashboard/onboarding", "/dashboard/accessibility"];

export function OnboardingGate() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (EXEMPT_PATHS.some((p) => pathname.startsWith(p))) return;

    let cancelled = false;

    async function check() {
      try {
        const res = await fetch("/api/onboarding/status");
        const data = await res.json();
        if (cancelled || !res.ok) return;
        if (data.isAdmin && !data.completed) {
          router.replace("/dashboard/onboarding");
        }
      } catch {
        /* no bloquear navegación */
      }
    }

    void check();
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  return null;
}
