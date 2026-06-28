"use client";

import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const ModuleVideoManager = dynamic(
  () =>
    import("@/components/modules/module-video-manager").then((mod) => ({
      default: mod.ModuleVideoManager,
    })),
  { ssr: false }
);

type ModuleAdminVideoProps = {
  slug: string;
  moduleTitle: string;
  videoId: string | null;
};

export function ModuleAdminVideo({
  slug,
  moduleTitle,
  videoId,
}: ModuleAdminVideoProps) {
  const router = useRouter();

  return (
    <ModuleVideoManager
      slug={slug}
      moduleTitle={moduleTitle}
      videoId={videoId}
      onUpdated={() => router.refresh()}
    />
  );
}
