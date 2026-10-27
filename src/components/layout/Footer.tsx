'use client';

import { useT } from '@/i18n/I18nProvider';

export function Footer() {
  const t = useT();
  return (
    <footer className="border-t border-zinc-800 py-6 mt-8">
      <div className="max-w-7xl mx-auto px-4 text-center text-sm text-zinc-500">
        <p>{t('WypForge, calculadora de armas y armaduras para Regnum Online, es un proyecto libre y de código abierto.')}</p>
        <p className="mt-1">
          <a href="https://github.com/CraforSilence/wyp-calculator" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:text-amber-400 transition-colors">
            GitHub
          </a>
          {' '}&middot;{' '}
          {t('Hecho por la comunidad para la comunidad.')}
        </p>
        <p className="mt-1">
          {t('Para sugerencias y mejoras:')}{' '}
          <a href="https://discord.com/users/215881295962570753" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 transition-colors">
            Discord (crafor)
          </a>
        </p>
      </div>
    </footer>
  );
}
