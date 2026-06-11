"use client";

import { Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SimplifiedContent({
  content,
  title = "Explicación fácil",
}: {
  content: string;
  title?: string;
}) {
  if (!content.trim()) return null;

  return (
    <Card className="border-brand-lavender/40" role="region" aria-label={title}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4" aria-hidden />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm">
          {content}
        </div>
      </CardContent>
    </Card>
  );
}
