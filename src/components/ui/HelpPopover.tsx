'use client';

import { useState, useRef, useEffect } from 'react';

interface HelpPopoverProps {
  text: string;
}

export function HelpPopover({ text }: HelpPopoverProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block ml-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold rounded-full bg-zinc-700/50 border border-zinc-600 text-zinc-400 hover:text-amber-400 hover:border-amber-500 transition-colors leading-none"
        aria-label="Ayuda"
      >
        ?
      </button>
      {open && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-52 px-3 py-2 text-xs text-zinc-200 bg-zinc-800 border border-zinc-600 rounded-lg shadow-lg">
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-zinc-600" />
          {text}
        </div>
      )}
    </div>
  );
}
