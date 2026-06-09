"use client";

import { Suspense } from "react";
import ActivitiesContent from "./activities-content";

export default function ActivitiesPage() {
  return (
    <Suspense fallback={<p className="text-sm text-brand-muted-gray">Cargando…</p>}>
      <ActivitiesContent />
    </Suspense>
  );
}
