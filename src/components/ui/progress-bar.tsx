import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function ProgressBar({ value, className, size = "md" }: ProgressBarProps) {
  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-full bg-brand-light-bg",
        size === "sm" && "h-1.5",
        size === "md" && "h-2.5",
        size === "lg" && "h-4",
        className
      )}
    >
      <div
        className="h-full rounded-full gradient-brand transition-all duration-700"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
