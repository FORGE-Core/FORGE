import { Sparkles } from "lucide-react";
import { ProgressBar } from "@/components/ui/progress-bar";

export function WelcomeHero({
  name,
  pendingCount,
  overallProgress,
}: {
  name: string;
  pendingCount: number;
  overallProgress: number;
}) {
  return (
    <div className="relative overflow-hidden rounded-[28px] gradient-brand p-8 text-white shadow-xl shadow-brand-cobalt/20 animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-12 -left-8 h-48 w-48 rounded-full bg-white/5 blur-3xl" />
      <div className="relative z-10">
        <div className="mb-2 flex items-center gap-2 text-sm text-white/80">
          <Sparkles className="h-4 w-4" />
          Centro de aprendizaje
        </div>
        <h1 className="font-heading text-3xl font-bold md:text-4xl">
          Hola, {name}
        </h1>
        <p className="mt-2 max-w-xl text-white/85">
          {pendingCount > 0
            ? `Tienes ${pendingCount} módulo${pendingCount === 1 ? "" : "s"} pendiente${pendingCount === 1 ? "" : "s"}. Sigue avanzando paso a paso.`
            : "Estás al día con tu capacitación. ¡Excelente trabajo!"}
        </p>
        <div className="mt-6 max-w-md">
          <div className="mb-2 flex justify-between text-sm text-white/80">
            <span>Progreso global</span>
            <span className="font-semibold">{overallProgress}%</span>
          </div>
          <ProgressBar value={overallProgress} size="lg" className="bg-white/20" />
        </div>
      </div>
    </div>
  );
}
