"use client";

import { useState } from "react";
import { Play, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ModuleVideoPlayer } from "@/components/modules/module-video-player";
import { cn } from "@/lib/utils";
import { alaeClient } from "@/services/client";

type ModuleHeroProps = {
  title: string;
  category: string;
  level: string;
  duration: string;
  gradient: string;
  description: string | null;
  hasVideo: boolean;
  canManage: boolean;
  videoUrl: string | null;
};

export function ModuleHero({
  title,
  category,
  level,
  duration,
  gradient,
  description,
  hasVideo,
  canManage,
  videoUrl,
}: ModuleHeroProps) {
  const [showVideo, setShowVideo] = useState(hasVideo);

  if (hasVideo && showVideo && videoUrl) {
    return (
      <div className="overflow-hidden rounded-[28px] shadow-lg ring-1 ring-black/5">
        <ModuleVideoPlayer
          src={videoUrl}
          title={title}
          captionText={description}
          onPlay={() => {
            void alaeClient.recordModality({
              modality: "LISTENING",
              source: "module-video",
            });
          }}
        />
        <div className="bg-brand-dark-bg px-6 py-4 text-white">
          <Badge className="mb-2 bg-white/20 text-white">{category}</Badge>
          <h1 className="font-heading text-2xl font-bold md:text-3xl">{title}</h1>
          <p className="mt-1 text-sm text-white/80">
            {level} · {duration}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex aspect-video items-center justify-center overflow-hidden rounded-[28px] bg-gradient-to-br shadow-lg",
        gradient
      )}
    >
      {hasVideo && videoUrl ? (
        <button
          type="button"
          onClick={() => setShowVideo(true)}
          className="flex h-20 w-20 items-center justify-center rounded-full bg-white/25 backdrop-blur transition-transform active:scale-95"
          aria-label="Reproducir video del módulo"
        >
          <Play className="h-10 w-10 fill-white text-white" />
        </button>
      ) : (
        <div className="flex flex-col items-center gap-2 px-6 text-center text-white/80">
          <Video className="h-12 w-12 text-white/60" />
          <p className="text-sm">
            {canManage
              ? "Aún no hay video. Súbelo abajo para tu equipo."
              : "El administrador publicará el video de este módulo pronto."}
          </p>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6 text-white">
        <Badge className="mb-2 bg-white/20 text-white">{category}</Badge>
        <h1 className="font-heading text-2xl font-bold md:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-white/80">
          {level} · {duration}
        </p>
      </div>
    </div>
  );
}
