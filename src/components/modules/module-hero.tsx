"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ModuleHeroProps = {
  title: string;
  category: string;
  level: string;
  duration: string;
  gradient: string;
  description: string | null;
};

export function ModuleHero({
  title,
  category,
  level,
  duration,
  gradient,
  description,
}: ModuleHeroProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[28px] bg-gradient-to-br shadow-lg",
        gradient
      )}
    >
      <div className="aspect-video w-full bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
        <Badge className="mb-2 w-fit bg-white/20 text-white">{category}</Badge>
        <h1 className="font-heading text-2xl font-bold md:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-white/80">
          {level} · {duration}
        </p>
        {description && (
          <p className="mt-3 line-clamp-2 text-sm text-white/70">{description}</p>
        )}
      </div>
    </div>
  );
}
