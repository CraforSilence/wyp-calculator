'use client';

import { JEWELRY_BONUS_LABELS } from '@/lib/engine/constants';
import type { JewelryItem } from '@/types/jewelry';

const SLOT_LABELS: Record<string, string> = {
  anillo: 'Anillo',
  amuleto: 'Amuleto',
};

interface JewelryTableProps {
  items: JewelryItem[];
  onEdit: (item: JewelryItem) => void;
  onDelete: (item: JewelryItem) => void;
  onDuplicate: (item: JewelryItem) => void;
  onShare?: (item: JewelryItem) => void;
  onReset?: (item: JewelryItem) => void;
  isModified?: (id: string) => boolean;
}

export function JewelryTable({ items, onEdit, onDelete, onDuplicate, onShare, onReset, isModified }: JewelryTableProps) {
  if (items.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-800 text-left">
            <th className="py-2 px-3 text-xs font-medium text-zinc-500">Nombre</th>
            <th className="py-2 px-3 text-xs font-medium text-zinc-500">Tipo</th>
            <th className="py-2 px-3 text-xs font-medium text-zinc-500">Bonuses</th>
            <th className="py-2 px-3 text-xs font-medium text-zinc-500 w-10"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const modified = isModified?.(item.id) ?? false;
            return (
              <tr
                key={item.id}
                className={`border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors ${
                  modified ? 'bg-yellow-900/10' : ''
                } ${!item.isDefault ? 'bg-amber-900/5' : ''}`}
              >
                <td className="py-2 px-3">
                  <span className="text-zinc-200 font-medium">{item.nombre}</span>
                  {item.notas && (
                    <span className="block text-xs text-zinc-500 mt-0.5">{item.notas}</span>
                  )}
                </td>
                <td className="py-2 px-3 text-zinc-400">{SLOT_LABELS[item.slot]}</td>
                <td className="py-2 px-3">
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                    {item.bonuses.map((b, i) => (
                      <span key={i} className="text-xs">
                        <span className="text-zinc-400">{JEWELRY_BONUS_LABELS[b.type]}:</span>{' '}
                        <span className="text-amber-400 font-medium">+{b.value}</span>
                      </span>
                    ))}
                    {item.bonuses.length === 0 && (
                      <span className="text-xs text-zinc-600">Sin bonuses</span>
                    )}
                  </div>
                </td>
                <td className="py-2 px-3">
                  <div className="flex items-center gap-1">
                    {onShare && (
                      <button
                        onClick={() => onShare(item)}
                        className="p-1 text-zinc-500 hover:text-emerald-400 transition-colors"
                        title="Compartir"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => onEdit(item)}
                      className="p-1 text-zinc-500 hover:text-amber-400 transition-colors"
                      title="Editar"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDuplicate(item)}
                      className="p-1 text-zinc-500 hover:text-blue-400 transition-colors"
                      title="Duplicar"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    {onReset && modified && (
                      <button
                        onClick={() => onReset(item)}
                        className="p-1 text-zinc-500 hover:text-yellow-400 transition-colors"
                        title="Resetear"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(item)}
                      className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                      title={item.isDefault ? 'Ocultar' : 'Eliminar'}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        {item.isDefault ? (
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        )}
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
