import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-black/5 bg-brand-light-bg/80 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-300">
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
          <Button asChild>
            <Link href="/register">Comenzar gratis</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
