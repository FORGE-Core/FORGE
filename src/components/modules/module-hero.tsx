"use client";

import { Badge } from "@/components/ui/badge";
import { ModuleVideoPlayer } from "@/components/modules/module-video-player";
import { cn } from "@/lib/utils";
import type { ModuleVideoItem } from "@/services/server/training/module-detail.service";
import { alaeClient } from "@/services/client";

type ModuleHeroProps = {
  title: string;
  category: string;
  level: string;
  duration: string;
  gradient: string;
  description: string | null;
  featuredVideo?: ModuleVideoItem | null;
};

export function ModuleHero({
  title,
  category,
  level,
  duration,
  gradient,
  description,
  featuredVideo,
}: ModuleHeroProps) {
  if (featuredVideo) {
    const heroInfoId = `module-hero-info-${title.replace(/\s+/g, "-").slice(0, 24)}`;

    return (
      <div className="overflow-hidden rounded-[28px] border border-brand-lavender/20 bg-white shadow-sm shadow-black/5">
        <div
          className={cn("h-1 bg-gradient-to-r", gradient)}
          aria-hidden="true"
        />
        <ModuleVideoPlayer
          src={featuredVideo.url}
          title={featuredVideo.title || title}
          showCaptionPanel={false}
          describedById={description ? heroInfoId : undefined}
          onPlay={() => {
            void alaeClient.recordModality({
              modality: "LISTENING",
              source: "module-video",
            });
          }}
        />
        <div
          id={heroInfoId}
          className="space-y-2 border-t border-black/5 bg-gradient-to-br from-brand-champagne/50 to-white px-6 py-5"
        >
          <Badge>{category}</Badge>
          <h1 className="font-heading text-xl font-bold text-brand-text-dark md:text-2xl">
            {title}
          </h1>
          <p className="text-sm text-brand-muted-gray">
            {level} · {duration}
          </p>
          {description && (
            <p className="text-sm leading-relaxed text-brand-muted-gray">
              {description}
            </p>
          )}
        </div>
      </div>
    );
  }

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
