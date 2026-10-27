'use client';

import { useEffect, useRef } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** Ancho maximo: 'md' para fichas angostas, 'lg' (por defecto) para formularios */
  size?: 'md' | 'lg';
}

const SIZE_CLASSES = { md: 'max-w-md', lg: 'max-w-2xl' } as const;

export function Modal({ open, onClose, title, children, size = 'lg' }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      // Click en el fondo (fuera del contenido) cierra
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      // m-auto: el reset de Tailwind le saca el centrado nativo al <dialog>
      className={`m-auto bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl text-zinc-100 p-0 ${SIZE_CLASSES[size]} w-[calc(100%-2rem)] backdrop:bg-black/60`}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <h2 className="text-base font-semibold">{title}</h2>
        <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200 text-lg cursor-pointer">&times;</button>
      </div>
      <div className="p-4 max-h-[80vh] overflow-y-auto">{children}</div>
    </dialog>
  );
}
