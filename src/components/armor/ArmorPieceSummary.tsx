'use client';

import {
  DAMAGE_TYPE_LABELS, DAMAGE_TYPE_ICONS, PHYSICAL_DAMAGE_TYPES, MAGICAL_DAMAGE_TYPES, ARMOR_BONUS_LABELS,
} from '@/lib/engine/constants';
import { bonusIcon } from '@/lib/bonusDisplay';
import type { ArmorPiece, ProtectionQuality } from '@/types/armor';

// En grid-cols-3: los físicos en la primera fila, los mágicos en la segunda
const SUMMARY_DAMAGE_TYPES = [...PHYSICAL_DAMAGE_TYPES, ...MAGICAL_DAMAGE_TYPES];

/** Color de cada calidad de proteccion: de rojo (Muy Mala) a verde (Muy Buena). */
export const QUALITY_STYLES: Record<ProtectionQuality, string> = {
  'Muy Mala': 'text-red-400 bg-red-500/10 border-red-500/30',
  'Mala': 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  'Normal': 'text-zinc-300 bg-zinc-800 border-zinc-700',
  'Buena': 'text-lime-400 bg-lime-500/10 border-lime-500/30',
  'Muy Buena': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
};

/** Vista de solo lectura de una pieza: PBA, calidad por tipo de dano, bonus y mejoras. */
export function ArmorPieceSummary({ piece }: { piece: ArmorPiece }) {
  const bonuses = piece.bonuses || [];
  const upgrades = piece.upgrades || [];

  return (
    <div className="space-y-3">
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold text-zinc-100">{piece.pba}</span>
        <span className="text-xs text-zinc-500">PBA</span>
        {piece.bcmt > 0 && <span className="text-sm text-amber-400 font-semibold">(+{piece.bcmt})</span>}
      </div>

      <div className="grid grid-cols-3 gap-1">
        {SUMMARY_DAMAGE_TYPES.map((t) => {
          const q = piece.protectionFactors[t] || 'Normal';
          return (
            <span
              key={t}
              title={`${DAMAGE_TYPE_LABELS[t]}: ${q}`}
              className={`flex items-center gap-1 rounded border px-1.5 py-0.5 text-[12px] whitespace-nowrap ${QUALITY_STYLES[q]}`}
            >
              <span aria-hidden>{DAMAGE_TYPE_ICONS[t]}</span>{q}
            </span>
          );
        })}
      </div>

      <div className="text-xs">
        {bonuses.length === 0 ? (
          <span className="text-zinc-600">Sin bonus</span>
        ) : (
          <div className="flex flex-wrap gap-x-3 gap-y-0.5">
            {bonuses.map((b, i) => (
              <span key={i}>
                <span className="text-zinc-400">{bonusIcon(b.type)} {ARMOR_BONUS_LABELS[b.type]}</span>{' '}
                <span className="text-amber-400 font-semibold">+{b.value}</span>
              </span>
            ))}
          </div>
        )}
        {upgrades.length > 0 && (
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
            {upgrades.map((u, i) => (
              <span key={i} className="text-zinc-400">
                Resistir {DAMAGE_TYPE_ICONS[u.type]} <span className="text-cyan-400 font-semibold">+{u.value}%</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
