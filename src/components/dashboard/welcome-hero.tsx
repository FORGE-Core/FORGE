"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { ProgressBar } from "@/components/ui/progress-bar";

export function WelcomeHero({
  name,
  pendingCount,
  overallProgress,
}: {
  name: string;
  pendingCount: number;
  overallProgress: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[28px] gradient-brand p-8 text-white shadow-xl shadow-brand-cobalt/20"
    >
      <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-12 -left-8 h-48 w-48 rounded-full bg-white/5 blur-3xl" />
      <div className="relative z-10">
        <div className="mb-2 flex items-center gap-2 text-sm text-white/80">
          <Sparkles className="h-4 w-4" />
          Centro de aprendizaje
        </div>
        <h1 className="font-heading text-3xl font-bold md:text-4xl">
          Hola, {name} 👋
        </h1>
        <p className="mt-2 text-lg text-white/90">
          Bienvenido a tu centro de aprendizaje.
        </p>
        <p className="mt-4 max-w-xl text-sm text-white/80 leading-relaxed">
          Tienes{" "}
          <strong className="text-white">
            {pendingCount} módulo{pendingCount !== 1 ? "s" : ""} pendiente
            {pendingCount !== 1 ? "s" : ""}
          </strong>{" "}
          y tu progreso general es del{" "}
          <strong className="text-white">{overallProgress}%</strong>.
        </p>
        <div className="mt-6 max-w-md">
          <div className="mb-2 flex justify-between text-xs text-white/80">
            <span>Progreso general</span>
            <span>{overallProgress}%</span>
          </div>
          <ProgressBar
            value={overallProgress}
            size="lg"
            className="bg-white/20"
          />
        </div>
      </div>
    </motion.div>
  );
}
