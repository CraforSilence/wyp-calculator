'use client';

import { Fragment, SelectHTMLAttributes } from 'react';
import { HelpPopover } from './HelpPopover';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  tooltip?: string;
  /** Con `group`, las opciones se muestran agrupadas (optgroup) en el orden en que aparecen. */
  options: { value: string; label: string; group?: string }[];
}

type SelectOption = SelectProps['options'][number];

function renderOptions(options: SelectOption[]) {
  if (!options.some((o) => o.group)) {
    return options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>);
  }
  const groups: { name?: string; items: SelectOption[] }[] = [];
  for (const opt of options) {
    const last = groups[groups.length - 1];
    if (last && last.name === opt.group) last.items.push(opt);
    else groups.push({ name: opt.group, items: [opt] });
  }
  return groups.map((g, i) => {
    const items = g.items.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>);
    return g.name ? <optgroup key={g.name} label={g.name}>{items}</optgroup> : <Fragment key={`_${i}`}>{items}</Fragment>;
  });
}

export function Select({ label, tooltip, options, className = '', id, ...props }: SelectProps) {
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
        {renderOptions(options)}
      </select>
    </div>
  );
}
