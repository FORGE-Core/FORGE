import { CheckCircle2, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "success" | "error" | "info";

const styles: Record<Variant, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  error: "border-red-200 bg-red-50 text-red-900",
  info: "border-brand-cobalt/20 bg-brand-champagne/40 text-brand-muted-gray",
};

const icons: Record<Variant, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

export function FeedbackBanner({
  variant = "info",
  message,
  className,
}: {
  variant?: Variant;
  message: string;
  className?: string;
}) {
  const Icon = icons[variant];
  return (
    <p
      role="status"
      className={cn(
        "flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm",
        styles[variant],
        className
      )}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      {message}
    </p>
  );
}
