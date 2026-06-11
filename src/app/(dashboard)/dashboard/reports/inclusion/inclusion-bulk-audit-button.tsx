"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InclusionBulkAuditButton() {
  const router = useRouter();
  const [auditing, setAuditing] = useState(false);

  return (
    <Button
      variant="outline"
      disabled={auditing}
      onClick={async () => {
        setAuditing(true);
        try {
          const res = await fetch("/api/alae/inclusion-audit/bulk", {
            method: "POST",
          });
          if (res.ok) router.refresh();
        } finally {
          setAuditing(false);
        }
      }}
    >
      {auditing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <RefreshCw className="h-4 w-4" />
      )}
      Auditar todo el contenido
    </Button>
  );
}
