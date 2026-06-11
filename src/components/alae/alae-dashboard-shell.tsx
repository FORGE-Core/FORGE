"use client";

import dynamic from "next/dynamic";
import { AccessibilityProvider } from "./accessibility-provider";
import { SkipToContent } from "./skip-to-content";
import { DeferredMount } from "@/components/shared/deferred-mount";

const AlaeQuickToolbar = dynamic(
  () =>
    import("./alae-quick-toolbar").then((mod) => ({
      default: mod.AlaeQuickToolbar,
    })),
  { ssr: false }
);

const VoiceCommandListener = dynamic(
  () =>
    import("./voice-command-listener").then((mod) => ({
      default: mod.VoiceCommandListener,
    })),
  { ssr: false }
);

export function AlaeDashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AccessibilityProvider>
      <SkipToContent />
      <DeferredMount delayMs={300}>
        <AlaeQuickToolbar />
      </DeferredMount>
      <DeferredMount delayMs={500}>
        <VoiceCommandListener />
      </DeferredMount>
      {children}
    </AccessibilityProvider>
  );
}
