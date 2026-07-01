"use client";

import { Video } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModuleVideoPlayer } from "@/components/modules/module-video-player";
import type { ModuleVideoItem } from "@/services/server/training/module-detail.service";
import { alaeClient } from "@/services/client";

type ModuleVideoListProps = {
  videos: ModuleVideoItem[];
  moduleTitle: string;
  description?: string | null;
  canManage?: boolean;
  showEmptyState?: boolean;
  startIndex?: number;
};

export function ModuleVideoList({
  videos,
  moduleTitle,
  description,
  canManage = false,
  showEmptyState = true,
  startIndex = 1,
}: ModuleVideoListProps) {
  if (videos.length === 0) {
    if (!showEmptyState) return null;
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Video className="h-5 w-5 text-brand-cobalt" />
            <CardTitle className="text-base">Videos del módulo</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-brand-muted-gray">
            {canManage
              ? "Aún no hay videos. Súbelos abajo para tu equipo."
              : "El administrador publicará los videos de este módulo pronto."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Video className="h-5 w-5 text-brand-cobalt" />
          <CardTitle className="text-base">
            Videos del módulo
            {videos.length > 1 ? ` (${videos.length})` : ""}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {videos.map((video, index) => (
          <div key={video.id} className="space-y-2">
            {(videos.length > 1 || startIndex > 1) && (
              <p className="text-sm font-medium text-brand-text-dark">
                {startIndex + index}. {video.title}
              </p>
            )}
            <div className="overflow-hidden rounded-2xl ring-1 ring-black/5">
              <ModuleVideoPlayer
                src={video.url}
                title={video.title || moduleTitle}
                captionText={description}
                onPlay={() => {
                  void alaeClient.recordModality({
                    modality: "LISTENING",
                    source: "module-video",
                  });
                }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
