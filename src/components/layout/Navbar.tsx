'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', label: 'Build' },
  { href: '/armas', label: 'Armas' },
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
          <Link href="/" className="text-amber-500 font-bold text-lg mr-4 shrink-0">
            W&P Calculator
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
          </div>
        )}
      </div>
    </nav>
  );
}
