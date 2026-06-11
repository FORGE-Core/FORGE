"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  Circle,
  FileText,
  HelpCircle,
  Play,
  Sparkles,
  Video,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { ModuleCardData } from "@/components/modules/module-card";
import { AlaeAdaptButtons } from "@/components/alae/alae-adapt-buttons";
import { InclusionIssuesList } from "@/components/alae/inclusion-issues-list";
import { InclusionScoreCard } from "@/components/alae/inclusion-score-card";
import { ModuleVideoManager } from "@/components/modules/module-video-manager";
import { ModuleVideoPlayer } from "@/components/modules/module-video-player";
import { cn } from "@/lib/utils";

type LessonItem = {
  id: string;
  title: string;
  duration: string;
  completed?: boolean;
  current?: boolean;
};

type ResourceItem = {
  id: string;
  name: string;
  type: string;
};

type ModuleDetail = ModuleCardData & {
  id: string;
  description: string | null;
  audience: string | null;
  documentId: string | null;
  videoId: string | null;
  hasVideo: boolean;
  canManage: boolean;
  lessons?: LessonItem[];
  resources?: ResourceItem[];
  inclusionScore?: number | null;
  inclusionIssues?: string[];
  inclusionRecommendations?: string[];
};

export default function ModuleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [trainingModule, setTrainingModule] = useState<ModuleDetail | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  const loadModule = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/training-modules/${slug}`);
      if (res.status === 404) {
        setNotFoundState(true);
        return;
      }
      const data = await res.json();
      if (res.ok && data.module) {
        setTrainingModule(data.module);
        if (data.module.hasVideo) setShowVideo(true);
      }
    } catch {
      setNotFoundState(true);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadModule();
  }, [loadModule]);

  if (notFoundState) notFound();
  if (loading || !trainingModule) {
    return (
      <p className="text-sm text-brand-muted-gray">Cargando módulo…</p>
    );
  }

  const videoUrl = trainingModule.videoId
    ? `/api/documents/${trainingModule.videoId}/file`
    : null;

  return (
    <div className="space-y-8 pb-8">
      <Link
        href="/dashboard/modules"
        className="inline-flex items-center gap-2 text-sm text-brand-muted-gray hover:text-brand-cobalt"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a módulos
      </Link>

      <div className="grid gap-8 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          {trainingModule.hasVideo && showVideo && videoUrl ? (
            <div className="overflow-hidden rounded-[28px] shadow-lg ring-1 ring-black/5">
              <ModuleVideoPlayer
                src={videoUrl}
                title={trainingModule.title}
                captionText={trainingModule.description}
                onPlay={() => {
                  void fetch("/api/alae/modality", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      modality: "LISTENING",
                      source: "module-video",
                    }),
                  });
                }}
              />
              <div className="bg-brand-dark-bg px-6 py-4 text-white">
                <Badge className="mb-2 bg-white/20 text-white">
                  {trainingModule.category}
                </Badge>
                <h1 className="font-heading text-2xl font-bold md:text-3xl">
                  {trainingModule.title}
                </h1>
                <p className="mt-1 text-sm text-white/80">
                  {trainingModule.level} · {trainingModule.duration}
                </p>
              </div>
            </div>
          ) : (
            <div
              className={cn(
                "relative flex aspect-video items-center justify-center overflow-hidden rounded-[28px] bg-gradient-to-br shadow-lg",
                trainingModule.gradient
              )}
            >
              {trainingModule.hasVideo && videoUrl ? (
                <button
                  type="button"
                  onClick={() => setShowVideo(true)}
                  className="flex h-20 w-20 items-center justify-center rounded-full bg-white/25 backdrop-blur transition-transform hover:scale-105"
                  aria-label="Reproducir video del módulo"
                >
                  <Play className="h-10 w-10 fill-white text-white" />
                </button>
              ) : (
                <div className="flex flex-col items-center gap-2 px-6 text-center text-white/80">
                  <Video className="h-12 w-12 text-white/60" />
                  <p className="text-sm">
                    {trainingModule.canManage
                      ? "Aún no hay video. Súbelo abajo para tu equipo."
                      : "El administrador publicará el video de este módulo pronto."}
                  </p>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6 text-white">
                <Badge className="mb-2 bg-white/20 text-white">
                  {trainingModule.category}
                </Badge>
                <h1 className="font-heading text-2xl font-bold md:text-3xl">
                  {trainingModule.title}
                </h1>
                <p className="mt-1 text-sm text-white/80">
                  {trainingModule.level} · {trainingModule.duration}
                </p>
              </div>
            </div>
          )}

          {trainingModule.canManage && (
            <ModuleVideoManager
              slug={slug}
              moduleTitle={trainingModule.title}
              videoId={trainingModule.videoId}
              onUpdated={loadModule}
            />
          )}

          <Card>
            <CardHeader>
              <CardTitle>Lecciones del módulo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(trainingModule.lessons ?? []).map((lesson) => (
                <div
                  key={lesson.id}
                  className={cn(
                    "flex items-center gap-4 rounded-2xl px-4 py-3 transition-colors",
                    lesson.current &&
                      "border border-brand-cobalt/20 bg-brand-champagne/50",
                    !lesson.current && "hover:bg-brand-light-bg"
                  )}
                >
                  {lesson.completed ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                  ) : lesson.current ? (
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full gradient-brand">
                      <Play className="h-2.5 w-2.5 fill-white text-white" />
                    </div>
                  ) : (
                    <Circle className="h-5 w-5 shrink-0 text-brand-muted-gray/40" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{lesson.title}</p>
                    <p className="text-xs text-brand-muted-gray">
                      {lesson.duration}
                    </p>
                  </div>
                  {lesson.current && <Badge>En curso</Badge>}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recursos relacionados</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {(trainingModule.resources ?? []).length === 0 ? (
                <p className="text-sm text-brand-muted-gray col-span-2">
                  Sin recursos adjuntos. Consulta el mentor IA o los documentos
                  de la empresa.
                </p>
              ) : (
                (trainingModule.resources ?? []).map((r) => (
                  <a
                    key={r.id}
                    href={
                      r.type === "pdf" || r.type === "video"
                        ? `/api/documents/${r.id}/file`
                        : undefined
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-2xl border border-black/5 bg-brand-light-bg px-4 py-3 hover:border-brand-cobalt/20"
                  >
                    {r.type === "pdf" && (
                      <FileText className="h-5 w-5 text-red-500" />
                    )}
                    {r.type === "video" && (
                      <Video className="h-5 w-5 text-brand-cobalt" />
                    )}
                    {r.type === "faq" && (
                      <HelpCircle className="h-5 w-5 text-amber-500" />
                    )}
                    {r.type === "doc" && (
                      <FileText className="h-5 w-5 text-brand-cobalt" />
                    )}
                    <span className="text-sm font-medium">{r.name}</span>
                  </a>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {trainingModule.inclusionScore != null && (
            <Card className="border-brand-lavender/20 bg-brand-champagne/30">
              <CardHeader>
                <CardTitle className="text-base">Inclusión ALAE</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-brand-muted-gray">
                    Claridad y accesibilidad del contenido
                  </p>
                  <InclusionScoreCard
                    score={trainingModule.inclusionScore}
                    size="sm"
                  />
                </div>
                {(trainingModule.inclusionIssues?.length ?? 0) > 0 && (
                  <InclusionIssuesList
                    issues={(trainingModule.inclusionIssues ?? []).map(
                      (message, i) => ({
                        code: `issue-${i}`,
                        severity: "medium",
                        message,
                      })
                    )}
                    recommendations={
                      trainingModule.inclusionRecommendations ?? []
                    }
                  />
                )}
              </CardContent>
            </Card>
          )}

          <Card className="sticky top-8 border-brand-lavender/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-brand-lavender" />
                <CardTitle>Resumen IA</CardTitle>
              </div>
              <p className="text-sm text-brand-muted-gray">
                La IA resume este módulo para ti.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed text-brand-muted-gray">
                {trainingModule.description}
              </p>
              {trainingModule.description && (
                <AlaeAdaptButtons
                  content={trainingModule.description}
                  title={trainingModule.title}
                  sourceId={trainingModule.id}
                  sourceType="MODULE"
                />
              )}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tu progreso</span>
                  <span className="font-semibold">
                    {trainingModule.progress}%
                  </span>
                </div>
                <ProgressBar value={trainingModule.progress} />
              </div>
              <Button className="w-full" variant="outline" asChild>
                <Link
                  href={`/dashboard/chat?prompt=${encodeURIComponent(
                    `Resume en 5 puntos el módulo "${trainingModule.title}"`
                  )}`}
                >
                  <Sparkles className="h-4 w-4" />
                  Resumir módulo
                </Link>
              </Button>
              <Button className="w-full" variant="outline" asChild>
                <Link
                  href={`/dashboard/chat?prompt=${encodeURIComponent(
                    `Explícame de forma sencilla el módulo "${trainingModule.title}"`
                  )}`}
                >
                  <Bot className="h-4 w-4" />
                  Explícamelo más fácil
                </Link>
              </Button>
              <Button className="w-full" asChild>
                <Link
                  href={`/dashboard/chat?prompt=${encodeURIComponent(
                    `Dame un ejemplo práctico del módulo "${trainingModule.title}"`
                  )}`}
                >
                  Generar ejemplo práctico
                </Link>
              </Button>
              <Button className="w-full" variant="outline" asChild>
                <Link href={`/dashboard/activities?moduleId=${trainingModule.id}`}>
                  Hacer quiz del módulo
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
