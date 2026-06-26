"use client";

import { useEffect, useState } from "react";
import { readCachedProfile } from "@/lib/alae/profile-cache";
import { useAccessibilityPrefs } from "@/components/alae/accessibility-provider";

/** Micrófono en login/registro: prefs en vivo, caché local o ?accesible=1 */
export function useAuthVoiceEnabled() {
  const { assistedReadingMode, voiceInputEnabled } = useAccessibilityPrefs();
  const [fromUrl, setFromUrl] = useState(false);
  const [fromCache, setFromCache] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setFromUrl(params.get("accesible") === "1");

    const cached = readCachedProfile();
    setFromCache(
      !!cached?.assistedReadingMode || !!cached?.voiceInputEnabled
    );
  }, [assistedReadingMode, voiceInputEnabled]);

  const enabled =
    assistedReadingMode || voiceInputEnabled || fromUrl || fromCache;

  return { enabled };
}
