"use client";

import dynamic from "next/dynamic";
import { DeferredMount } from "@/components/shared/deferred-mount";

const NovaWidget = dynamic(
  () =>
    import("@/components/nova/nova-widget").then((mod) => ({
      default: mod.NovaWidget,
    })),
  { ssr: false }
);

const OnboardingGate = dynamic(
  () =>
    import("@/components/onboarding/onboarding-gate").then((mod) => ({
      default: mod.OnboardingGate,
    })),
  { ssr: false }
);

export function DashboardChrome() {
  return (
    <>
      <DeferredMount>
        <OnboardingGate />
      </DeferredMount>
      <DeferredMount delayMs={400}>
        <NovaWidget />
      </DeferredMount>
    </>
  );
}
