'use client';

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

  return (
    <nav className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-12 gap-1 overflow-x-auto">
          <Link href="/" className="text-amber-500 font-bold text-lg mr-4 shrink-0">
            Regnum
          </Link>
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors shrink-0 ${
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
      </div>
    </nav>
  );
}
