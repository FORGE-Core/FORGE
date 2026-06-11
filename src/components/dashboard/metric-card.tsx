import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  delayMs?: number;
}

export function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  trend = "neutral",
  delayMs = 0,
}: MetricCardProps) {
  return (
    <div
      className="animate-in fade-in slide-in-from-bottom-3 duration-300 fill-mode-both"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-brand-muted-gray">
            {title}
          </CardTitle>
          <Icon className="h-4 w-4 text-brand-cobalt" />
        </CardHeader>
        <CardContent>
          <p className="font-heading text-2xl font-bold">{value}</p>
          {change && (
            <p
              className={cn(
                "mt-1 text-xs",
                trend === "up" && "text-emerald-600",
                trend === "down" && "text-red-600",
                trend === "neutral" && "text-brand-muted-gray"
              )}
            >
              {change}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
