'use client';

import { useToast } from '@/components/ui/Toast';

interface ShareButtonProps {
  code: string;
  className?: string;
}

export function ShareButton({ code, className = '' }: ShareButtonProps) {
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast('Codigo copiado al portapapeles', 'success');
    } catch {
      toast('Error al copiar', 'error');
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`p-1 text-zinc-500 hover:text-emerald-400 transition-colors cursor-pointer ${className}`}
      title="Compartir"
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
    </button>
  );
}
