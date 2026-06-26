import {
  AlertTriangle,
  ArrowRight,
  Brain,
  CheckCircle2,
  LineChart,
  Shield,
  Zap,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";

const features: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: Brain,
    title: "IA contextual con RAG",
    desc: "Respuestas basadas únicamente en tu documentación interna.",
  },
  {
    icon: Zap,
    title: "Onboarding acelerado",
    desc: "Reduce errores operativos y tiempo de incorporación.",
  },
  {
    icon: LineChart,
    title: "Aprendizaje adaptativo",
    desc: "Detecta debilidades y sugiere repasos personalizados.",
  },
  {
    icon: Shield,
    title: "Multi-tenant seguro",
    desc: "Datos, documentos y embeddings aislados por empresa.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-brand-light-bg">
      <Navbar />

      <main id="main-content" tabIndex={-1}>
      <section className="relative overflow-hidden px-6 pb-24 pt-28 md:pt-32">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-champagne/60 to-transparent" />
        <div className="relative mx-auto max-w-5xl text-center">
          <p className="mx-auto mb-6 max-w-xl">
            <Link
              href="/accesible"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-cobalt/30 bg-white px-5 py-2.5 text-sm font-medium text-brand-cobalt shadow-sm hover:bg-brand-champagne/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cobalt"
            >
              <Volume2 className="h-4 w-4" aria-hidden />
              Acceso con lectura por voz
            </Link>
          </p>
          <span className="inline-block animate-in fade-in slide-in-from-bottom-2 rounded-full border border-brand-lavender/30 bg-white px-4 py-1.5 text-xs font-medium text-brand-cobalt duration-500">
            Capacitación empresarial · IA · Logística
          </span>
          <h1 className="mt-6 animate-in fade-in slide-in-from-bottom-3 font-heading text-5xl font-bold leading-tight tracking-tight duration-700 fill-mode-both md:text-7xl">
            Capacita empleados hasta{" "}
            <span className="text-gradient">70% más rápido</span> con IA
          </h1>
          <p className="mx-auto mt-6 max-w-2xl animate-in fade-in slide-in-from-bottom-3 text-lg text-brand-muted-gray duration-700 fill-mode-both">
            Transforma documentos empresariales en experiencias inteligentes de
            aprendizaje. FORGE convierte manuales y procesos en capacitación
            medible con mentor IA contextual.
          </p>
          <div className="mt-10 flex animate-in fade-in slide-in-from-bottom-3 flex-wrap items-center justify-center gap-4 duration-700 fill-mode-both">
            <Button size="lg" asChild>
              <Link href="mailto:demo@forge.app?subject=Solicitar%20demo">
                Solicitar demo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Ver plataforma</Link>
            </Button>
            <Button size="lg" variant="ghost" asChild>
              <Link href="/register">Comenzar gratis</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="how" className="border-y border-black/5 bg-white px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-heading text-center text-3xl font-bold md:text-4xl">
            Cómo funciona FORGE
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-brand-muted-gray">
            De manuales estáticos a capacitación medible en cuatro pasos.
          </p>
          <ol className="mt-16 grid gap-8 md:grid-cols-4">
            {[
              {
                step: "1",
                title: "Sube documentos",
                desc: "Manuales, procesos y videos de tu operación.",
              },
              {
                step: "2",
                title: "IA genera contenido",
                desc: "Módulos, quizzes y simulaciones desde tu documentación.",
              },
              {
                step: "3",
                title: "Capacita al equipo",
                desc: "Cada persona aprende con NOVA, adaptado por ALAE.",
              },
              {
                step: "4",
                title: "Mide resultados",
                desc: "Reportes de progreso, inclusión y patrones de aprendizaje.",
              },
            ].map((item) => (
              <li
                key={item.step}
                className="relative rounded-[24px] border border-black/5 bg-brand-light-bg p-6"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl gradient-brand text-sm font-bold text-white">
                  {item.step}
                </span>
                <h3 className="mt-4 font-heading font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-brand-muted-gray">{item.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-3">
          <div>
            <h2 className="font-heading text-2xl font-bold">El problema</h2>
            <ul className="mt-6 space-y-4 text-brand-muted-gray">
              {[
                "Capacitación lenta y dependiente de supervisores",
                "Errores operativos por procesos mal entendidos",
                "Manuales que nadie lee hasta que algo falla",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-heading text-2xl font-bold">La solución</h2>
            <ul className="mt-6 space-y-4 text-brand-muted-gray">
              {[
                "IA que responde solo con tu documentación oficial",
                "Simulaciones y quizzes generados desde tus manuales",
                "Reportes de progreso y temas problemáticos",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <Brain className="mt-0.5 h-5 w-5 shrink-0 text-brand-cobalt" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-heading text-2xl font-bold">Beneficios</h2>
            <ul className="mt-6 space-y-4 text-brand-muted-gray">
              {[
                "Onboarding hasta 70% más rápido",
                "Menos errores en operaciones diarias",
                "Aprendizaje medible por empleado y equipo",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="rounded-t-[40px] bg-brand-dark-bg px-6 py-24 text-brand-text-light"
      >
        <div className="mx-auto max-w-6xl">
          <h2 className="font-heading text-3xl font-bold md:text-4xl">
            Todo lo que necesitas para capacitar mejor
          </h2>
          <p className="mt-4 max-w-xl text-white/60">
            Diseñado para empresas de logística, operaciones y equipos con alta
            rotación de personal.
          </p>
          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="glass rounded-[24px] p-6 animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-both"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <f.icon className="mb-4 h-8 w-8 text-brand-lavender" />
                <h3 className="font-heading font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-white/60">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      </main>
    </div>
  );
}
