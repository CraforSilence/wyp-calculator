'use client';

import { createContext, useCallback, useContext, useState, useRef, useEffect } from 'react';

export type ToastVariant = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: 'bg-emerald-900/90 border-emerald-700 text-emerald-200',
  error: 'bg-red-900/90 border-red-700 text-red-200',
  info: 'bg-zinc-800/90 border-zinc-600 text-zinc-200',
};

const VARIANT_ICONS: Record<ToastVariant, string> = {
  success: '\u2713',
  error: '\u2715',
  info: 'i',
};

function ToastItem({ toast: t, onRemove }: { toast: Toast; onRemove: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(t.id), 3000);
    return () => clearTimeout(timer);
  }, [t.id, onRemove]);

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium shadow-lg animate-toast-in ${VARIANT_STYLES[t.variant]}`}
    >
      <span className="text-xs font-bold w-4 text-center shrink-0">{VARIANT_ICONS[t.variant]}</span>
      <span>{t.message}</span>
      <button
        onClick={() => onRemove(t.id)}
        className="ml-2 opacity-60 hover:opacity-100 transition-opacity text-base leading-none cursor-pointer"
        aria-label="Cerrar"
      >
        &times;
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const toast = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = ++counterRef.current;
    setToasts((prev) => [...prev, { id, message, variant }]);
  }, []);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={remove} />
        ))}
      </div>
    </ToastContext>
  );
}
