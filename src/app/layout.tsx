import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "@/components/providers";
import { getAlaeBootScript } from "@/lib/alae/dom-effects";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  preload: true,
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  preload: false,
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: "FORGE— Capacitación empresarial inteligente",
  description:
    "Plataforma SaaS de onboarding y capacitación con IA contextual para empresas de logística y operaciones.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FORGE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${jakarta.variable}`}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
        <script
          dangerouslySetInnerHTML={{ __html: getAlaeBootScript() }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
