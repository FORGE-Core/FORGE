"use client";

import { Suspense } from "react";
import { SessionProvider } from "next-auth/react";
import { AccessibilityProvider } from "@/components/alae/accessibility-provider";
import { AssistedReadingAutoEnable } from "@/components/alae/assisted-reading-auto-enable";
import { AssistedReadingShortcut } from "@/components/alae/assisted-reading-shortcut";
import { AssistedReadingToolbar } from "@/components/alae/assisted-reading-toolbar";
import { RouteAnnouncer } from "@/components/alae/route-announcer";
import { ScreenReaderLiveRegions } from "@/components/alae/screen-reader-live";
import { PwaProvider } from "@/components/pwa/pwa-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus={false} refetchInterval={0}>
      <AccessibilityProvider>
        <ScreenReaderLiveRegions />
        <RouteAnnouncer />
        <AssistedReadingShortcut />
        <Suspense fallback={null}>
          <AssistedReadingAutoEnable />
        </Suspense>
        <AssistedReadingToolbar />
        <PwaProvider>{children}</PwaProvider>
      </AccessibilityProvider>
    </SessionProvider>
  );
}
