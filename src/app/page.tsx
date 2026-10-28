'use client';

import Link from 'next/link';
import { useT } from '@/i18n/I18nProvider';

const SECTIONS = [
  {
    href: '/build',
    title: 'Build',
    icon: '/logo/wypforge-mark.png',
    description: 'Armá tu personaje paso a paso: clase y atributos, arma y joyería, armadura y simulación de daño contra un enemigo.',
    featured: true,
  },
  {
    href: '/armas',
    title: 'Armas',
    icon: '/icons/arma.svg',
    description: 'Cargá y guardá tus armas con sus bonus, gemas y muescas para usarlas en el Build o compararlas.',
  },
  {
    href: '/joyeria',
    title: 'Joyería',
    icon: '/icons/anillo.svg',
    description: 'Guardá tus anillos y amuletos para precargarlos en el Build con un clic.',
  },
  {
    href: '/armadura',
    title: 'Armaduras',
    icon: '/icons/pechera.svg',
    description: 'Calculá la protección de cada pieza y cuánto daño te pasa según el tipo de golpe.',
  },
  {
    href: '/rankings',
    title: 'Rankings',
    icon: '/icons/rankings.svg',
    description: 'Todas tus armas ordenadas por DPS, promedio, crítico o velocidad, calculadas con tu personaje.',
  },
  {
    href: '/comparar',
    title: 'Comparar',
    icon: '/icons/comparar.svg',
    description: 'Poné hasta 5 armas lado a lado y mirá cuál conviene y por cuánto.',
  },
];

const FEATURES = [
  { title: 'Fórmulas del juego', text: 'Daño, crítico, velocidad, protección y resistencias calculados como en Regnum.' },
  { title: 'Sin cuentas', text: 'Todo se guarda en tu navegador. No hay registro ni servidores.' },
  { title: 'Compartí con códigos', text: 'Compartí un arma, una joya, una armadura, un comparativo o tu build completo con un link o un código.' },
];

export default function HomePage() {
  const t = useT();
  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero */}
      <section className="flex flex-col items-center text-center pt-6 pb-10 animate-fade-in-up">
        <h1>
          <img
            src="/logo/wypforge-logo-dark.png"
            alt="WYP Forge - Weapons and Protections"
            width={593}
            height={498}
            className="w-64 sm:w-80 h-auto"
          />
        </h1>
        <p className="text-base text-zinc-300 mt-5 max-w-2xl">
          {t('Calculadora de armas, armaduras y daño para')} <span className="text-zinc-100 font-semibold">Regnum Online</span>.{' '}
          {t('Armá tu personaje, compará armas y descubrí cuánto pegás de verdad contra la armadura del enemigo.')}
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <Link
            href="/build"
            className="px-5 py-2.5 rounded-md bg-amber-600 hover:bg-amber-500 text-zinc-950 font-semibold text-sm transition-colors"
          >
            {t("Armar mi build")}
          </Link>
          <Link
            href="/rankings"
            className="px-5 py-2.5 rounded-md border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/60 text-zinc-200 text-sm transition-colors"
          >
            {t("Ver ranking de armas")}
          </Link>
        </div>
        <p className="text-xs text-zinc-500 mt-3">
          ¿Te pasaron un código o un link?{' '}
          <Link href="/importar" className="text-amber-500 hover:text-amber-400 underline-offset-2 hover:underline">{t("Importalo acá")}</Link>
        </p>
      </section>

      {/* Secciones */}
      <section>
        <h2 className="text-xs uppercase tracking-wider text-zinc-500 mb-3">{t("Qué podés hacer")}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SECTIONS.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className={`group flex gap-3 rounded-lg border p-4 transition-colors ${
                s.featured
                  ? 'bg-amber-500/5 border-amber-600/40 hover:border-amber-500/70'
                  : 'bg-zinc-900 border-zinc-800 hover:border-zinc-600'
              }`}
            >
              <span className="shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-lg border border-zinc-700 bg-zinc-800 p-1.5">
                <img src={s.icon} alt="" className="w-full h-full object-contain" />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-1 text-sm font-semibold text-zinc-100 group-hover:text-amber-400 transition-colors">
                  {t(s.title)}
                  <span className="text-zinc-600 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-transform">→</span>
                </span>
                <span className="block text-xs text-zinc-400 mt-1">{t(s.description)}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Características */}
      <section className="grid gap-3 sm:grid-cols-3 mt-8">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-lg border border-zinc-800/70 px-4 py-3">
            <div className="text-sm font-semibold text-zinc-200">{t(f.title)}</div>
            <div className="text-xs text-zinc-500 mt-1">{t(f.text)}</div>
          </div>
        ))}
      </section>
    </div>
  );
}
