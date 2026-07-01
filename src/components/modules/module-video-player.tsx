"use client";

import { useAccessibility } from "@/components/alae/accessibility-provider";

type ModuleVideoPlayerProps = {
  src: string;
  title: string;
  captionText?: string | null;
  onPlay?: () => void;
  showCaptionPanel?: boolean;
  describedById?: string;
};

export function ModuleVideoPlayer({
  src,
  title,
  captionText,
  onPlay,
  showCaptionPanel = true,
  describedById,
}: ModuleVideoPlayerProps) {
  const { captionsEnabled } = useAccessibility();
  const captionId =
    describedById ??
    `module-video-captions-${title.replace(/\s+/g, "-").slice(0, 24)}`;
  const showCaptions =
    showCaptionPanel && captionsEnabled && Boolean(captionText);

  return (
    <div className={showCaptions ? "space-y-2" : ""}>
      <video
        controls
        className="aspect-video w-full bg-black"
        src={src}
        preload="metadata"
        playsInline
        aria-label={`Video del módulo: ${title}`}
        aria-describedby={showCaptions ? captionId : describedById}
        onPlay={onPlay}
      >
        {captionsEnabled && (
          <track
            kind="captions"
            srcLang="es"
            label="Español"
            default
          />
        )}
        Tu navegador no soporta reproducción de video.
      </video>
      {showCaptions && captionText && (
        <div
          id={captionId}
          role="region"
          aria-live="polite"
          className="rounded-2xl border border-black/5 bg-brand-champagne/60 px-4 py-3 text-sm leading-relaxed text-brand-text-dark"
        >
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-muted-gray">
            Subtítulos / contexto
          </p>
          <p>{captionText}</p>
        </div>
      )}
    </div>
  );
}
