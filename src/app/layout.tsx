import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { ToastProvider } from "@/components/ui/Toast";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "W&P Calculator",
  description: "Calculadora de armas, armadura y simulador de daño para Regnum Online",
  openGraph: {
    title: "W&P Calculator - Regnum Online",
    description: "Calculadora de armas, armadura y simulador de daño para Regnum Online",
    type: "website",
    locale: "es_AR",
  },
  twitter: {
    card: "summary",
    title: "W&P Calculator",
    description: "Calculadora de armas y armadura para Regnum Online",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100">
        <ToastProvider>
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
          {children}
        </main>
        <footer className="border-t border-zinc-800 py-6 mt-8">
          <div className="max-w-7xl mx-auto px-4 text-center text-sm text-zinc-500">
            <p>W&amp;P Calculator (Weapon and Protection Calculator) es un proyecto libre y de codigo abierto.</p>
            <p className="mt-1">
              <a href="https://github.com/CraforSilence/wyp-calculator" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:text-amber-400 transition-colors">
                GitHub
              </a>
              {' '}&middot;{' '}
              Hecho por la comunidad para la comunidad.
            </p>
            <p className="mt-1">
              Para sugerencias y mejoras:{' '}
              <a href="https://discord.com/users/215881295962570753" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                Discord (crafor)
              </a>
            </p>
          </div>
        </footer>
        <ScrollToTop />
        </ToastProvider>
      </body>
    </html>
  );
}
