import type { Metadata } from "next";
import { Cinzel, Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { ToastProvider } from "@/components/ui/Toast";
import { ShareProvider } from "@/components/ui/ShareProvider";
import { I18nProvider } from "@/i18n/I18nProvider";
import { Footer } from "@/components/layout/Footer";
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

// Tipografia del subtitulo del logo ("Weapons and Protections")
const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://wypforge.vercel.app"),
  title: "WypForge",
  description: "Calculadora de armas, armadura y simulador de daño para Regnum Online",
  openGraph: {
    title: "WypForge - Regnum Online",
    description: "Calculadora de armas, armadura y simulador de daño para Regnum Online",
    type: "website",
    locale: "es_AR",
  },
  twitter: {
    card: "summary_large_image",
    title: "WypForge",
    description: "Calculadora de armas y armadura para Regnum Online",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100">
        <I18nProvider>
        <ToastProvider>
        <ShareProvider>
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
          {children}
        </main>
        <Footer />
        <ScrollToTop />
        </ShareProvider>
        </ToastProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
