'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useT } from '@/i18n/I18nProvider';

const TABS = [
  { href: '/comparar', label: 'Armas', icon: '/icons/arma.svg' },
  { href: '/comparar-armaduras', label: 'Armaduras', icon: '/icons/pechera.svg' },
];

/** Cambia entre comparar armas y comparar armaduras. */
export function CompareTabs() {
  const t = useT();
  const pathname = usePathname();
  return (
    <nav className="mb-3 inline-flex rounded-md border border-zinc-800 bg-zinc-900 p-0.5" aria-label={t('Qué comparar')}>
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? 'page' : undefined}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
              active ? 'bg-amber-900/30 text-amber-400' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <img src={tab.icon} alt="" className="w-3.5 h-3.5" />
            {t(tab.label)}
          </Link>
        );
      })}
    </nav>
  );
}
