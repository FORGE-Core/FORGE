import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function InclusionScoreCard({
  score,
  label = "Inclusión",
  size = "md",
}: {
  score: number;
  label?: string;
  size?: "sm" | "md" | "lg";
}) {
  const color =
    score >= 75
      ? "text-emerald-600"
      : score >= 50
        ? "text-amber-600"
        : "text-rose-600";

  const ring =
    score >= 75
      ? "border-emerald-200 bg-emerald-50"
      : score >= 50
        ? "border-amber-200 bg-amber-50"
        : "border-rose-200 bg-rose-50";

  return (
    <Card className={cn("border", ring)} aria-label={`${label}: ${score}%`}>
      <CardHeader className="pb-1">
        <CardTitle className="text-sm font-medium text-brand-muted-gray">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p
          className={cn(
            "font-heading font-bold",
            color,
            size === "lg" && "text-4xl",
            size === "md" && "text-3xl",
            size === "sm" && "text-xl"
          )}
        >
          {Math.round(score)}%
        </p>
      </CardContent>
    </Card>
  );
}
