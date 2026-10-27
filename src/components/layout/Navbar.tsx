'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/build', label: 'Build' },
  { href: '/armas', label: 'Armas' },
  { href: '/joyeria', label: 'Joyeria' },
  { href: '/armadura', label: 'Armaduras' },
  { href: '/rankings', label: 'Rankings' },
  { href: '/comparar', label: 'Comparar' },
];

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handle = (e: MouseEvent) => {
      const nav = document.getElementById('main-nav');
      if (nav && !nav.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [menuOpen]);

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

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1 flex-1">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    active
                      ? 'bg-amber-600/20 text-amber-400'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Import general: pegar cualquier codigo o link y te lleva a su seccion */}
          <Link
            href="/importar"
            title="Pegá un código o link compartido"
            className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded border text-sm font-medium transition-colors ${
              pathname === '/importar'
                ? 'border-amber-600/60 bg-amber-600/20 text-amber-400'
                : 'border-zinc-700 text-zinc-300 hover:text-zinc-100 hover:border-zinc-500 hover:bg-zinc-800'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m0 0l-4-4m4 4l4-4" /></svg>
            Importar
          </Link>

          {/* Hamburger button - mobile only */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="md:hidden ml-auto p-2 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Menu"
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
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-3 py-2 rounded text-sm font-medium transition-colors ${
                    active
                      ? 'bg-amber-600/20 text-amber-400'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/importar"
              className={`flex items-center gap-1.5 px-3 py-2 rounded text-sm font-medium transition-colors ${
                pathname === '/importar' ? 'bg-amber-600/20 text-amber-400' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m0 0l-4-4m4 4l4-4" /></svg>
              Importar código
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
