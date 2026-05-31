"use client";

import { motion } from "framer-motion";
import { Clock, Play } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";

export interface ModuleCardData {
  slug: string;
  title: string;
  category: string;
  level: string;
  duration: string;
  status: "pending" | "in_progress" | "completed";
  progress: number;
  gradient: string;
}

export function ModuleCard({ module, index = 0 }: { module: ModuleCardData; index?: number }) {
  const statusLabel =
    module.status === "completed"
      ? "Completado"
      : module.status === "in_progress"
        ? "En progreso"
        : "Pendiente";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      <Link href={`/dashboard/modules/${module.slug}`}>
        <article className="group overflow-hidden rounded-[24px] border border-black/5 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
          <div
            className={cn(
              "relative flex h-36 items-end bg-gradient-to-br p-5",
              module.gradient
            )}
          >
            <div className="absolute inset-0 bg-black/10 opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative z-10 flex w-full items-end justify-between">
              <Badge className="bg-white/20 text-white backdrop-blur-sm">
                {module.category}
              </Badge>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
                <Play className="h-5 w-5 fill-white text-white" />
              </div>
            </div>
          </div>
          <div className="space-y-3 p-5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-heading font-semibold leading-tight group-hover:text-brand-cobalt">
                {module.title}
              </h3>
              <Badge
                variant={
                  module.status === "completed"
                    ? "success"
                    : module.status === "pending"
                      ? "warning"
                      : "default"
                }
              >
                {statusLabel}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-brand-muted-gray">
              <span>{module.level}</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {module.duration}
              </span>
            </div>
            {module.progress > 0 && (
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-brand-muted-gray">Progreso</span>
                  <span className="font-medium">{module.progress}%</span>
                </div>
                <ProgressBar value={module.progress} size="sm" />
              </div>
            )}
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
