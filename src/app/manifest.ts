import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FORGE — Capacitación empresarial",
    short_name: "FORGE",
    description:
      "Plataforma de capacitación empresarial con IA, accesibilidad ALAE y aprendizaje adaptativo.",
    start_url: "/home",
    display: "standalone",
    background_color: "#f7f6f0",
    theme_color: "#4f46e5",
    orientation: "portrait-primary",
    lang: "es",
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
    categories: ["education", "business", "productivity"],
  };
}
