"use client";

import { useEffect, useRef, useState } from "react";
import {
  announce,
  subscribeAnnouncer,
  type AnnouncePriority,
} from "@/lib/alae/announcer";

/**
 * Regiones aria-live globales. NVDA, JAWS, VoiceOver y Narrator las leen
 * cuando la app anuncia cambios (navegación, guardado, errores, etc.).
 */
export function ScreenReaderLiveRegions() {
  const [polite, setPolite] = useState("");
  const [assertive, setAssertive] = useState("");
  const politeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const assertiveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return subscribeAnnouncer((message, priority: AnnouncePriority) => {
      if (priority === "assertive") {
        setAssertive("");
        if (assertiveTimer.current) clearTimeout(assertiveTimer.current);
        requestAnimationFrame(() => setAssertive(message));
        assertiveTimer.current = setTimeout(() => setAssertive(""), 4000);
        return;
      }

      setPolite("");
      if (politeTimer.current) clearTimeout(politeTimer.current);
      requestAnimationFrame(() => setPolite(message));
      politeTimer.current = setTimeout(() => setPolite(""), 4000);
    });
  }, []);

  return (
    <>
      <div
        id="sr-announcer-polite"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {polite}
      </div>
      <div
        id="sr-announcer-assertive"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {assertive}
      </div>
    </>
  );
}

export { announce };
