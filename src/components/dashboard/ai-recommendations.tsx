import { Brain, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AIRecommendations({
  items,
}: {
  items: { topic: string; reason: string; slug?: string; href?: string }[];
}) {
  if (items.length === 0) return null;

  return (
    <Card className="border-brand-lavender/20 bg-gradient-to-br from-white to-brand-champagne/40">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-brand">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <CardTitle>Recomendaciones inteligentes</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-brand-muted-gray">
          La IA detectó oportunidades de mejora en los siguientes temas:
        </p>
        <ul className="space-y-3">
          {items.map((rec, i) => (
            <li
              key={`${rec.topic}-${i}`}
              className="rounded-2xl border border-black/5 bg-white px-4 py-3 animate-in fade-in slide-in-from-left-2 duration-300 fill-mode-both"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <p className="text-sm font-medium">{rec.topic}</p>
              <p className="mt-1 text-xs text-brand-muted-gray">{rec.reason}</p>
            </li>
          ))}
        </ul>
        <Button className="w-full" asChild>
          <Link
            href={
              items[0]?.href ??
              (items[0]?.slug
                ? `/modules/${items[0].slug}`
                : "/modules")
            }
          >
            Reforzar conocimientos
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
