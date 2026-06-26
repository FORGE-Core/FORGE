"use client";

import dynamic from "next/dynamic";
import { DeferredMount } from "@/components/shared/deferred-mount";

const OnboardingGate = dynamic(
  () =>
    import("@/components/onboarding/onboarding-gate").then((mod) => ({
      default: mod.OnboardingGate,
    })),
  { ssr: false }
);

/** Solo en inicio: evita cargar onboarding en todas las rutas. */
export function HomeChrome() {
  return (
    <DeferredMount delayMs={800}>
      <OnboardingGate />
    </DeferredMount>
  );
}
