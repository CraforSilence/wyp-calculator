'use client';

interface HelpTipProps {
  text: string;
}

export function HelpTip({ text }: HelpTipProps) {
  return (
    <span
      title={text}
      className="inline-flex items-center justify-center w-4 h-4 ml-1 text-[10px] font-bold text-zinc-400 bg-zinc-700/50 border border-zinc-600 rounded-full cursor-help hover:text-zinc-200 hover:border-zinc-400 transition-colors"
    >
      ?
    </span>
  );
}
