"use client";

import { ExternalLink, Headphones } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SCREEN_READERS = [
  {
    name: "NVDA",
    platform: "Windows (gratis)",
    url: "https://www.nvaccess.org/download/",
  },
  {
    name: "JAWS",
    platform: "Windows",
    url: "https://www.freedomscientific.com/products/software/jaws/",
  },
  {
    name: "VoiceOver",
    platform: "Mac, iPhone, iPad (integrado)",
    url: "https://support.apple.com/guide/voiceover/welcome/mac",
  },
  {
    name: "Narrator",
    platform: "Windows (integrado)",
    url: "https://support.microsoft.com/es-es/windows/usar-el-narrador-6d83eef6-d71f-0c54-0ee1-4b5c5c5d0b8f",
  },
] as const;

export function ScreenReaderGuide() {
  return (
    <Card className="border-brand-cobalt/20 bg-brand-champagne/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Headphones className="h-5 w-5 text-brand-cobalt" aria-hidden />
          Lectores de pantalla (opcional)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-brand-muted-gray">
        <p>
          FORGE incluye <strong>Modo lectura asistida</strong>: la app lee en
          voz alta usando solo el navegador (Chrome, Edge, Safari), sin instalar
          programas. Actívalo en el inicio de sesión o en Perfil → Accesibilidad.
        </p>
        <p>
          Si prefieres un lector del sistema, estas son opciones conocidas:
        </p>
        <ul className="space-y-2">
          {SCREEN_READERS.map((sr) => (
            <li key={sr.name}>
              <a
                href={sr.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-brand-cobalt hover:underline"
              >
                {sr.name}
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </a>
              <span className="text-brand-muted-gray"> — {sr.platform}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs">
          Atajos en modo asistido: Tab para moverte, Alt+R lee la página, Alt+S
          detiene la voz, Alt+H ayuda.
        </p>
      </CardContent>
    </Card>
  );
}
