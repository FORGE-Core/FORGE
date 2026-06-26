import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  Circle,
  FileText,
  HelpCircle,
  ImageIcon,
  Play,
  Sparkles,
  Video,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { InclusionIssuesList } from "@/components/alae/inclusion-issues-list";
import { InclusionScoreCard } from "@/components/alae/inclusion-score-card";
import { AlaeAdaptButtons } from "@/components/alae/alae-adapt-buttons";
import { cn } from "@/lib/utils";
import type { ModuleDetailData } from "@/services/server/training/module-detail.service";
import { ModuleAdminVideo } from "./module-admin-video";
import { ModuleAdminDocument } from "./module-admin-document";
import { ModuleAdminDetails } from "./module-admin-details";
import { ModuleHero } from "./module-hero";

export function ModuleDetailContent({
  slug,
  module: trainingModule,
}: {
  slug: string;
  module: ModuleDetailData;
}) {
  const videoUrl = trainingModule.videoUrl;

  return (
    <div className="space-y-8 pb-8">
      <Link
        href="/modules"
        className="inline-flex items-center gap-2 text-sm text-brand-muted-gray hover:text-brand-cobalt"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a módulos
      </Link>

      <div className="grid gap-8 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <ModuleHero
            title={trainingModule.title}
            category={trainingModule.category}
            level={trainingModule.level}
            duration={trainingModule.duration}
            gradient={trainingModule.gradient}
            description={trainingModule.description}
            hasVideo={trainingModule.hasVideo}
            canManage={trainingModule.canManage}
            videoUrl={videoUrl}
          />

          {trainingModule.canManage && (
            <ModuleAdminDetails
              slug={slug}
              module={trainingModule}
            />
          )}

          {trainingModule.canManage && (
            <ModuleAdminVideo
              slug={slug}
              moduleTitle={trainingModule.title}
              videoId={trainingModule.videoId}
            />
          )}

          {trainingModule.canManage && (
            <ModuleAdminDocument
              moduleId={trainingModule.id}
              resources={trainingModule.resources}
            />
          )}

          <Card>
            <CardHeader>
              <CardTitle>Lecciones del módulo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {trainingModule.lessons.map((lesson) => (
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
              {trainingModule.resources.length === 0 ? (
                <p className="col-span-2 text-sm text-brand-muted-gray">
                  Sin recursos adjuntos. Consulta el mentor IA o los documentos
                  de la empresa.
                </p>
              ) : (
                trainingModule.resources.map((r) => (
                  <a
                    key={r.id}
                    href={
                      r.type === "pdf" ||
                      r.type === "video" ||
                      r.type === "image"
                        ? `/api/documents/${r.id}/file`
                        : undefined
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-2xl border border-black/5 bg-brand-light-bg px-4 py-3 transition-colors hover:border-brand-cobalt/20"
                  >
                    {r.type === "pdf" && (
                      <FileText className="h-5 w-5 text-red-500" />
                    )}
                    {r.type === "video" && (
                      <Video className="h-5 w-5 text-brand-cobalt" />
                    )}
                    {r.type === "image" && (
                      <ImageIcon className="h-5 w-5 text-emerald-600" />
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
                  href={`/chat?prompt=${encodeURIComponent(
                    `Resume en 5 puntos el módulo "${trainingModule.title}"`
                  )}`}
                >
                  <Sparkles className="h-4 w-4" />
                  Resumir módulo
                </Link>
              </Button>
              <Button className="w-full" variant="outline" asChild>
                <Link
                  href={`/chat?prompt=${encodeURIComponent(
                    `Explícame de forma sencilla el módulo "${trainingModule.title}"`
                  )}`}
                >
                  <Bot className="h-4 w-4" />
                  Explícamelo más fácil
                </Link>
              </Button>
              <Button className="w-full" asChild>
                <Link
                  href={`/chat?prompt=${encodeURIComponent(
                    `Dame un ejemplo práctico del módulo "${trainingModule.title}"`
                  )}`}
                >
                  Generar ejemplo práctico
                </Link>
              </Button>
              <Button className="w-full" variant="outline" asChild>
                <Link href={`/activities?moduleId=${trainingModule.id}`}>
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
