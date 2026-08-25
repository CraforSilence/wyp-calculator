'use client';

import { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  tooltip?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, tooltip, options, className = '', id, ...props }: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={selectId}
          className={`text-xs text-zinc-400 font-medium ${tooltip ? 'cursor-help border-b border-dotted border-zinc-600' : ''}`}
          title={tooltip}
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-colors ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
