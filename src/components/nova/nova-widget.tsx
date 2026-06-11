"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { NovaAvatar2D } from "@/components/alae/nova-avatar-2d";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAccessibility } from "@/components/alae/accessibility-provider";

export function NovaWidget() {
  const [open, setOpen] = useState(false);
  const { simplifiedLanguage, stepByStepMode, preferredModality, isSpeaking } =
    useAccessibility();

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            className="mb-4 w-[320px] overflow-hidden rounded-[24px] border border-black/5 bg-white shadow-2xl shadow-black/10"
          >
            <div className="gradient-brand px-5 py-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <NovaAvatar2D
                    size={36}
                    state={isSpeaking ? "speaking" : "idle"}
                  />
                  <div>
                    <p className="font-heading font-bold">NOVA</p>
                    <p className="text-xs text-white/80">Tu asistente de aprendizaje</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1 hover:bg-white/10"
                  aria-label="Cerrar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="space-y-3 p-5">
              <p className="text-sm font-medium">¿Necesitas ayuda?</p>
              <p className="text-sm text-brand-muted-gray leading-relaxed">
                Puedo explicarte procesos, resolver dudas y ayudarte a aprender más
                rápido.
              </p>
              {(simplifiedLanguage || stepByStepMode) && (
                <p className="rounded-xl bg-brand-champagne/50 px-3 py-2 text-xs text-brand-muted-gray">
                  ALAE activo:{" "}
                  {[
                    simplifiedLanguage && "lenguaje fácil",
                    stepByStepMode && "paso a paso",
                    preferredModality !== "MIXED" && preferredModality.toLowerCase(),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
              <Button className="w-full" asChild>
                <Link href="/dashboard/chat">
                  <MessageCircle className="h-4 w-4" />
                  Abrir mentor IA
                </Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((v) => !v)}
        className="flex h-14 items-center gap-2 rounded-full gradient-brand px-5 text-white shadow-lg shadow-brand-cobalt/30"
        aria-label="Abrir NOVA"
      >
        <NovaAvatar2D size={32} state={isSpeaking ? "speaking" : "idle"} />
        <span className="font-heading font-semibold">NOVA</span>
      </motion.button>
    </div>
  );
}
