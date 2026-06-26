"use client";

import { SkipToContent } from "./skip-to-content";

export function AlaeDashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SkipToContent />
      {children}
    </>
  );
}
