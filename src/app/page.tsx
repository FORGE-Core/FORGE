"use client";

import { motion } from "framer-motion";
import { ArrowRight, Brain, LineChart, Shield, Zap } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";

const features = [
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

      {/* Hero claro */}
      <section className="relative overflow-hidden px-6 pb-24 pt-32">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-champagne/60 to-transparent" />
        <div className="relative mx-auto max-w-5xl text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block rounded-full border border-brand-lavender/30 bg-white px-4 py-1.5 text-xs font-medium text-brand-cobalt"
          >
            Capacitación empresarial · IA · Logística
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 font-heading text-5xl font-bold leading-tight tracking-tight md:text-7xl"
          >
            Transforma tu conocimiento en{" "}
            <span className="text-gradient">experiencias de aprendizaje</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-brand-muted-gray"
          >
            FORGE convierte manuales, procesos y documentación en capacitación
            interactiva con IA. No es un chatbot — es un ecosistema de aprendizaje
            inteligente para equipos de alta rotación.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Button size="lg" asChild>
              <Link href="/register">
                Comenzar gratis
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Ver demo</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Sección oscura premium */}
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
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-[24px] p-6"
              >
                <f.icon className="mb-4 h-8 w-8 text-brand-lavender" />
                <h3 className="font-heading font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-white/60">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
