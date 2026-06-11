"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { DeferredMount } from "@/components/shared/deferred-mount";

const PwaInstallPrompt = dynamic(
  () =>
    import("./pwa-install-prompt").then((mod) => ({
      default: mod.PwaInstallPrompt,
    })),
  { ssr: false }
);

export function PwaProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") {
      void navigator.serviceWorker.getRegistrations().then((regs) => {
        for (const reg of regs) void reg.unregister();
      });
      return;
    }
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  return (
    <>
      {children}
      <DeferredMount delayMs={2000}>
        <PwaInstallPrompt />
      </DeferredMount>
    </>
  );
}
