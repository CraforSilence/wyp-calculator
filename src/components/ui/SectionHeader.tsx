import type { ReactNode } from 'react';
import { HelpPopover } from './HelpPopover';

/** Título de una sección dentro de un formulario, con algo opcional a la derecha (contador, botón). */
export function SectionHeader({ title, help, children }: { title: string; help?: string; children?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-2 pb-1 border-b border-zinc-800/80">
      <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-amber-400/90">
        {title}
        {help && <HelpPopover text={help} />}
      </span>
      {children}
    </div>
  );
}
