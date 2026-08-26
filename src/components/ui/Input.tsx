'use client';

import { InputHTMLAttributes } from 'react';
import { HelpPopover } from './HelpPopover';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  tooltip?: string;
}

export function Input({ label, tooltip, className = '', id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-xs text-zinc-400 font-medium">
          {label}
          {tooltip && <HelpPopover text={tooltip} />}
        </label>
      )}
      <input
        id={inputId}
        className={`bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-colors ${className}`}
        {...props}
      />
    </div>
  );
}
