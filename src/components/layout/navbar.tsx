"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 z-50 w-full border-b border-black/5 bg-brand-light-bg/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="font-heading text-xl font-bold">
          <span className="text-gradient">Forge</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <Link href="#features" className="text-sm text-brand-muted-gray hover:text-brand-text-dark">
            Funciones
          </Link>
          <Link href="#how" className="text-sm text-brand-muted-gray hover:text-brand-text-dark">
            Cómo funciona
          </Link>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden lg:block">
          <Link
            href="/accesible"
            className="inline-flex items-center gap-1.5 rounded-full border border-brand-cobalt/30 px-3 py-1.5 text-xs font-medium text-brand-cobalt hover:bg-brand-champagne/50"
          >
            <Volume2 className="h-3.5 w-3.5" aria-hidden />
            Lectura por voz
          </Link>
        </div>
          <Button variant="ghost" asChild>
            <Link href="/login">Iniciar sesión</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Comenzar gratis</Link>
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
