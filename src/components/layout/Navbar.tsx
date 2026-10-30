'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/i18n/I18nProvider';
import type { Lang } from '@/i18n/I18nProvider';

type NavItem = { href: string; label: string; icon: string };
type NavGroup = { label: string; items: NavItem[] };

// Cada grupo es un menu de la barra. Un grupo con un solo item se muestra como link directo.
const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Calculadora',
    items: [
      { href: '/build', label: 'Build', icon: '/logo/wypforge-mark.png' },
      { href: '/armas', label: 'Armas', icon: '/icons/arma.svg' },
      { href: '/joyeria', label: 'Joyería', icon: '/icons/anillo.svg' },
      { href: '/armadura', label: 'Armaduras', icon: '/icons/pechera.svg' },
      { href: '/rankings', label: 'Rankings', icon: '/icons/rankings.svg' },
      { href: '/comparar', label: 'Comparar', icon: '/icons/comparar.svg' },
    ],
  },
  {
    label: 'Entrenador',
    items: [{ href: '/entrenador', label: 'Entrenador', icon: '/icons/entrenador.svg' }],
  },
  {
    label: 'Guerra',
    items: [{ href: '/guerra', label: 'Estado de guerra', icon: '/icons/guerra.svg' }],
  },
];

const LANGS: Lang[] = ['es', 'en'];

// Mismo recuadro que las tarjetas del inicio, en chico
function NavIcon({ src }: { src: string }) {
  return (
    <span className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-md border border-zinc-700 bg-zinc-800 p-1">
      <img src={src} alt="" className="w-full h-full object-contain" />
    </span>
  );
}

export function Navbar() {
  const { t, lang, setLang } = useI18n();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  // Close menus on route change
  useEffect(() => {
    setMenuOpen(false);
    setOpenGroup(null);
  }, [pathname]);

  // Close menus on outside click
  useEffect(() => {
    if (!menuOpen && !openGroup) return;
    const handle = (e: MouseEvent) => {
      const nav = document.getElementById('main-nav');
      if (nav && !nav.contains(e.target as Node)) {
        setMenuOpen(false);
        setOpenGroup(null);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [menuOpen, openGroup]);

  // Close dropdown with Escape
  useEffect(() => {
    if (!openGroup) return;
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpenGroup(null); };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [openGroup]);

  const linkClass = (active: boolean) =>
    active ? 'bg-amber-600/20 text-amber-400' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800';

  return (
    <nav id="main-nav" className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-12 gap-1">
          <Link href="/" className="flex items-center gap-2 mr-4 shrink-0">
            <img src="/logo/wypforge-mark.png" alt="" width={192} height={106} className="h-8 w-auto" />
            <span className="flex flex-col items-start gap-1">
              <img src="/logo/wypforge-name-dark.png" alt="WYP Forge" width={593} height={130} className="h-5 w-auto" />
              <span className="font-logo text-[9px] leading-none uppercase tracking-[0.12em] text-zinc-400">Weapons and Protections</span>
            </span>
          </Link>

          {/* Desktop menus */}
          <div className="hidden md:flex items-center gap-1 flex-1">
            {NAV_GROUPS.map((group) => {
              const groupActive = group.items.some((i) => pathname === i.href);
              if (group.items.length === 1) {
                const item = group.items[0];
                return (
                  <Link
                    key={group.label}
                    href={item.href}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${linkClass(groupActive)}`}
                  >
                    {t(group.label)}
                  </Link>
                );
              }
              const open = openGroup === group.label;
              return (
                <div
                  key={group.label}
                  className="relative"
                  onMouseEnter={() => setOpenGroup(group.label)}
                  onMouseLeave={() => setOpenGroup((g) => (g === group.label ? null : g))}
                >
                  <button
                    onClick={() => setOpenGroup(open ? null : group.label)}
                    aria-haspopup="menu"
                    aria-expanded={open}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium transition-colors cursor-pointer ${linkClass(groupActive)}`}
                  >
                    {t(group.label)}
                    <svg className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {open && (
                    // pt-1 en vez de margin: el hueco sigue siendo parte del hover y el menu no se cierra al bajar el mouse
                    <div className="absolute left-0 top-full pt-1 z-50" role="menu">
                      <div className="min-w-48 rounded-md border border-zinc-800 bg-zinc-950 shadow-lg shadow-black/40 p-1">
                        {group.items.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            role="menuitem"
                            className={`flex items-center gap-2.5 px-2 py-1.5 rounded text-sm font-medium transition-colors ${linkClass(pathname === item.href)}`}
                          >
                            <NavIcon src={item.icon} />
                            {t(item.label)}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Import general: pegar cualquier codigo o link y te lleva a su seccion */}
          <Link
            href="/importar"
            title={t("Pegá un código o link compartido")}
            className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded border text-sm font-medium transition-colors ${
              pathname === '/importar'
                ? 'border-amber-600/60 bg-amber-600/20 text-amber-400'
                : 'border-zinc-700 text-zinc-300 hover:text-zinc-100 hover:border-zinc-500 hover:bg-zinc-800'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m0 0l-4-4m4 4l4-4" /></svg>
            {t("Importar")}
          </Link>

          {/* Idioma */}
          <div className="hidden md:inline-flex ml-2 rounded border border-zinc-700 overflow-hidden text-xs font-semibold" role="group" aria-label="Idioma / Language">
            {LANGS.map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                className={`px-2 py-1.5 uppercase transition-colors cursor-pointer ${lang === l ? 'bg-amber-600/20 text-amber-400' : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800'}`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Hamburger button - mobile only */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="md:hidden ml-auto p-2 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label={t('Menú')}
            aria-expanded={menuOpen}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile dropdown panel */}
        {menuOpen && (
          <div className="md:hidden border-t border-zinc-800 py-2 space-y-0.5">
            {NAV_GROUPS.map((group) => (
              <div key={group.label} className="pb-1">
                <div className="px-3 pt-2 pb-1 text-[11px] uppercase tracking-wider text-zinc-500">{t(group.label)}</div>
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-3 py-1.5 rounded text-sm font-medium transition-colors ${linkClass(pathname === item.href)}`}
                  >
                    <NavIcon src={item.icon} />
                    {t(item.label)}
                  </Link>
                ))}
              </div>
            ))}
            <Link
              href="/importar"
              className={`flex items-center gap-1.5 px-3 py-2 rounded text-sm font-medium transition-colors ${
                pathname === '/importar' ? 'bg-amber-600/20 text-amber-400' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m0 0l-4-4m4 4l4-4" /></svg>
              {t("Importar código")}
            </Link>
            <div className="flex gap-1 px-3 pt-2">
              {LANGS.map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  aria-pressed={lang === l}
                  className={`px-3 py-1.5 rounded text-xs font-semibold uppercase cursor-pointer ${lang === l ? 'bg-amber-600/20 text-amber-400' : 'text-zinc-400 hover:bg-zinc-800'}`}
                >
                  {l === 'es' ? t("Español") : t("English")}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
