"use client";

import { Suspense } from "react";
import { SessionProvider } from "next-auth/react";
import { AccessibilityProvider } from "@/components/alae/accessibility-provider";
import { FocusReadAloud } from "@/components/alae/focus-read-aloud";
import { AssistedReadingRouteReader } from "@/components/alae/assisted-reading-route-reader";
import { AssistedReadingShortcut } from "@/components/alae/assisted-reading-shortcut";
import { AssistedReadingToolbar } from "@/components/alae/assisted-reading-toolbar";
import { RouteAnnouncer } from "@/components/alae/route-announcer";
import { ScreenReaderLiveRegions } from "@/components/alae/screen-reader-live";
import { SpeechUnlock } from "@/components/alae/speech-unlock";
import { PwaProvider } from "@/components/pwa/pwa-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus={false} refetchInterval={0}>
      <AccessibilityProvider>
        <SpeechUnlock />
        <ScreenReaderLiveRegions />
        <RouteAnnouncer />
        <AssistedReadingShortcut />
        <Suspense fallback={null}>
          <AssistedReadingRouteReader />
          <FocusReadAloud />
        </Suspense>
        <AssistedReadingToolbar />
        <PwaProvider>{children}</PwaProvider>
      </AccessibilityProvider>
    </SessionProvider>
  );
}
