"use client";

import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import type { ModuleVideoItem } from "@/services/server/training/module-detail.service";

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
  videos: ModuleVideoItem[];
};

export function ModuleAdminVideo({
  slug,
  moduleTitle,
  videos,
}: ModuleAdminVideoProps) {
  const router = useRouter();

  return (
    <ModuleVideoManager
      slug={slug}
      moduleTitle={moduleTitle}
      videos={videos}
      onUpdated={() => router.refresh()}
    />
  );
}
