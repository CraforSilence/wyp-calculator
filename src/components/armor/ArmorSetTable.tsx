'use client';

import { ARMOR_BONUS_LABELS, DAMAGE_TYPE_LABELS, ALL_DAMAGE_TYPES } from '@/lib/engine/constants';
import { calcTotalProtection } from '@/lib/engine/armor';
import type { CatalogArmorSet } from '@/types/armor';
import type { DamageTypeName } from '@/types/weapon';

interface ArmorSetTableProps {
  sets: CatalogArmorSet[];
  armorClass: number;
  onEdit: (set: CatalogArmorSet) => void;
  onDelete: (set: CatalogArmorSet) => void;
  onDuplicate: (set: CatalogArmorSet) => void;
  onReset?: (set: CatalogArmorSet) => void;
  isModified?: (id: string) => boolean;
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
}

export function ArmorSetTable({
  sets, armorClass, onEdit, onDelete, onDuplicate,
  onReset, isModified, selectedIds, onToggleSelect,
}: ArmorSetTableProps) {
  if (sets.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-800 text-left">
            {onToggleSelect && <th className="py-2 px-2 w-8"></th>}
            <th className="py-2 px-3 text-xs font-medium text-zinc-500">Nombre</th>
            <th className="py-2 px-3 text-xs font-medium text-zinc-500">Clase</th>
            <th className="py-2 px-3 text-xs font-medium text-zinc-500">Pzas</th>
            {ALL_DAMAGE_TYPES.map((t) => (
              <th key={t} className="py-2 px-2 text-xs font-medium text-zinc-500 text-right">
                {DAMAGE_TYPE_LABELS[t].slice(0, 4)}
              </th>
            ))}
            <th className="py-2 px-2 text-xs font-medium text-zinc-500 text-right">Total</th>
            <th className="py-2 px-3 text-xs font-medium text-zinc-500">Bonus</th>
            <th className="py-2 px-3 text-xs font-medium text-zinc-500 w-10"></th>
          </tr>
        </thead>
        <tbody>
          {sets.map((set) => {
            const modified = isModified?.(set.id) ?? false;
            const isSelected = selectedIds?.includes(set.id) ?? false;
            const fakeArmorSet = {
              pieces: set.pieces,
              bonusArmaduraPct: 0,
              generalResistance: { fisico: 0, magico: 0 },
              typeResistance: {},
              barrierPoints: {},
              meleeDmgReductionPct: 0,
              rangedDmgReductionPct: 0,
            };
            const prot = calcTotalProtection(fakeArmorSet, armorClass);
            const totalProt = Object.values(prot.perType).reduce((a, b) => a + b, 0);
            const pieceCount = Object.keys(set.pieces).length;

            return (
              <tr
                key={set.id}
                className={`border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors ${
                  modified ? 'bg-yellow-900/10' : ''
                } ${!set.isDefault ? 'bg-amber-900/5' : ''} ${isSelected ? 'bg-amber-900/15' : ''}`}
              >
                {onToggleSelect && (
                  <td className="py-2 px-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(set.id)}
                      className="accent-amber-500 cursor-pointer"
                    />
                  </td>
                )}
                <td className="py-2 px-3">
                  <span className="text-zinc-200 font-medium">{set.nombre}</span>
                  {set.notas && (
                    <span className="block text-xs text-zinc-500 mt-0.5">{set.notas}</span>
                  )}
                </td>
                <td className="py-2 px-3 text-zinc-400 text-xs">
                  {set.clase}
                  {set.subclase && <span className="block text-zinc-500">{set.subclase}</span>}
                </td>
                <td className="py-2 px-3 text-zinc-400 text-center">{pieceCount}</td>
                {ALL_DAMAGE_TYPES.map((t) => (
                  <td key={t} className="py-2 px-2 text-right text-zinc-300 tabular-nums">
                    {Math.round(prot.perType[t] || 0)}
                  </td>
                ))}
                <td className="py-2 px-2 text-right font-medium text-amber-400 tabular-nums">
                  {Math.round(totalProt)}
                </td>
                <td className="py-2 px-3">
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                    {set.bonusConjunto.map((b, i) => (
                      <span key={i} className="text-xs">
                        <span className="text-zinc-400">{ARMOR_BONUS_LABELS[b.type]}:</span>{' '}
                        <span className="text-amber-400 font-medium">+{b.value}</span>
                      </span>
                    ))}
                    {set.bonusConjunto.length === 0 && (
                      <span className="text-xs text-zinc-600">-</span>
                    )}
                  </div>
                </td>
                <td className="py-2 px-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => onDuplicate(set)} className="p-1 text-zinc-500 hover:text-blue-400 transition-colors" title="Duplicar">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    {onReset && modified && (
                      <button onClick={() => onReset(set)} className="p-1 text-zinc-500 hover:text-yellow-400 transition-colors" title="Resetear">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    )}
                    <button onClick={() => onDelete(set)} className="p-1 text-zinc-500 hover:text-red-400 transition-colors" title={set.isDefault ? 'Ocultar' : 'Eliminar'}>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        {set.isDefault ? (
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
