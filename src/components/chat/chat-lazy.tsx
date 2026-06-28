"use client";

import dynamic from "next/dynamic";

export const AIChatLazy = dynamic(
  () => import("@/components/chat/ai-chat").then((mod) => ({ default: mod.AIChat })),
  {
    ssr: false,
    loading: () => (
      <p className="text-sm text-brand-muted-gray">Cargando mentor IA…</p>
    ),
  }
);
