import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "W&P Calculator",
  description: "Weapon and Protection Calculator - Calculadora de armas, armadura y simulador de daño para Regnum Online",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100">
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
      </body>
    </html>
  );
}
