import { Suspense } from "react";
import { ActivitiesContent } from "@/components/activities";

export default function ActivitiesPage() {
  return (
    <Suspense fallback={null}>
      <ActivitiesContent />
    </Suspense>
  );
}
