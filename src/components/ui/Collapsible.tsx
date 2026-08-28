'use client';

import { useState } from 'react';

interface CollapsibleProps {
  title: string;
  icon?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function Collapsible({ title, icon, defaultOpen = false, children }: CollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-zinc-800/50 transition-colors rounded-lg"
      >
        <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
          {icon && <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-zinc-700 bg-zinc-800 p-1"><img src={icon} alt="" className="w-full h-full object-contain" /></span>}
          {title}
        </h3>
        <svg
          className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Grid-rows animation wrapper */}
      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden min-h-0">
          <div className="px-4 pb-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
