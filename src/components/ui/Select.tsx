'use client';

import { Fragment, type SelectHTMLAttributes } from 'react';
import { HelpPopover } from './HelpPopover';
import { useT, type TFunction } from '@/i18n/I18nProvider';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  tooltip?: string;
  /** Con `group`, las opciones se muestran agrupadas (optgroup) en el orden en que aparecen. */
  options: { value: string; label: string; group?: string }[];
}

export type SelectOption = SelectProps['options'][number];

// Las etiquetas de las opciones suelen ser datos del juego (clases, bonus, rarezas): se traducen aca.
// Si traen algo que no es letra adelante ("+5 ...", "% Daño de Arma") se traduce solo el texto.
export function translateLabel(label: string, t: TFunction): string {
  const m = label.match(/^([^\p{L}]*)(.*)$/u);
  return m ? m[1] + t(m[2]) : t(label);
}

function renderOptions(options: SelectOption[], t: TFunction) {
  if (!options.some((o) => o.group)) {
    return options.map((opt) => <option key={opt.value} value={opt.value}>{translateLabel(opt.label, t)}</option>);
  }
  const groups: { name?: string; items: SelectOption[] }[] = [];
  for (const opt of options) {
    const last = groups[groups.length - 1];
    if (last && last.name === opt.group) last.items.push(opt);
    else groups.push({ name: opt.group, items: [opt] });
  }
  return groups.map((g, i) => {
    const items = g.items.map((opt) => <option key={opt.value} value={opt.value}>{translateLabel(opt.label, t)}</option>);
    return g.name ? <optgroup key={g.name} label={t(g.name)}>{items}</optgroup> : <Fragment key={`_${i}`}>{items}</Fragment>;
  });
}

export function Select({ label, tooltip, options, className = '', id, ...props }: SelectProps) {
  const t = useT();
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={selectId} className="text-xs text-zinc-400 font-medium">
          {label}
          {tooltip && <HelpPopover text={tooltip} />}
        </label>
      )}
      <select
        id={selectId}
        className={`bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-colors ${className}`}
        {...props}
      >
        {renderOptions(options, t)}
      </select>
    </div>
  );
}
