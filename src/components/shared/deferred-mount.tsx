"use client";

import { useEffect, useState } from "react";

type DeferredMountProps = {
  children: React.ReactNode;
  delayMs?: number;
};

export function DeferredMount({ children, delayMs = 0 }: DeferredMountProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const mount = () => {
      if (!cancelled) setMounted(true);
    };

    const schedule = () => {
      if (delayMs > 0) {
        timeoutId = setTimeout(mount, delayMs);
        return;
      }
      if ("requestIdleCallback" in window) {
        idleId = window.requestIdleCallback(mount, { timeout: 1500 });
        return;
      }
      timeoutId = setTimeout(mount, 200);
    };

    schedule();

    return () => {
      cancelled = true;
      if (idleId !== undefined) window.cancelIdleCallback(idleId);
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, [delayMs]);

  if (!mounted) return null;
  return children;
}
