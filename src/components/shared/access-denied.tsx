import Link from "next/link";
import { Button } from "@/components/ui/button";

type AccessDeniedProps = {
  title: string;
  description: string;
  backHref?: string;
  backLabel?: string;
};

export function AccessDenied({
  title,
  description,
  backHref = "/home",
  backLabel = "Volver al inicio",
}: AccessDeniedProps) {
  return (
    <div className="space-y-4 pb-8">
      <h1 className="font-heading text-3xl font-bold">{title}</h1>
      <p className="max-w-lg text-brand-muted-gray">{description}</p>
      <Button variant="outline" asChild>
        <Link href={backHref}>{backLabel}</Link>
      </Button>
    </div>
  );
}
