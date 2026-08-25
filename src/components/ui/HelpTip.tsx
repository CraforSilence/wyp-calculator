'use client';

interface HelpTipProps {
  text: string;
}

export function HelpTip({ text }: HelpTipProps) {
  return (
    <span
      title={text}
      className="inline-flex items-center justify-center w-4 h-4 ml-1 text-[10px] font-bold text-zinc-500 bg-zinc-800 border border-zinc-700 rounded-full cursor-help hover:text-zinc-300 hover:border-zinc-500 transition-colors"
    >
      ?
    </span>
  );
}
