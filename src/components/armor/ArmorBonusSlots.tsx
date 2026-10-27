'use client';

import { bonusIcon, bonusSelectOptions } from '@/lib/bonusDisplay';
import { SlotEditor } from '@/components/weapons/SlotEditor';
import {
  ARMOR_BONUS_TYPES, ARMOR_BONUS_LABELS, SHIELD_ONLY_BONUS_TYPES,
  ARMOR_RAREZAS, ARMOR_RAREZA_BONUS,
} from '@/lib/engine/constants';
import type { ArmorBonus, ArmorBonusType, ArmorRareza, ArmorSlot } from '@/types/armor';

/** Sin limite por rareza (Artesano en el catalogo), se mantiene el tope de antes. */
const ARTESANO_CATALOG_MAX = 4;

interface ArmorRarezaSelectProps {
  value: ArmorRareza;
  onChange: (rareza: ArmorRareza) => void;
  className?: string;
}

export function ArmorRarezaSelect({ value, onChange, className = '' }: ArmorRarezaSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as ArmorRareza)}
      title="Rareza de la pieza: define cuantos bonus puede tener"
      className={`bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 ${className}`}
    >
      {ARMOR_RAREZAS.map((r) => (
        <option key={r} value={r}>{r}</option>
      ))}
    </select>
  );
}

/** Texto corto del limite de bonus de una rareza, para el encabezado. */
export function armorBonusLimitLabel(rareza: ArmorRareza): string {
  const max = ARMOR_RAREZA_BONUS[rareza];
  if (max === null) return 'bonus fijos del set';
  if (max === 0) return 'sin bonus';
  return `${max} ${max === 1 ? 'slot' : 'slots'}`;
}

interface ArmorBonusSlotsProps {
  bonuses: ArmorBonus[];
  slot: ArmorSlot;
  rareza: ArmorRareza;
  onChange: (bonuses: ArmorBonus[]) => void;
  /** En el Build los bonus de Artesano son los del set y no se editan. */
  lockArtesano?: boolean;
}

/** Bonus de una pieza de armadura con la cantidad de slots que permite su rareza. */
export function ArmorBonusSlots({ bonuses, slot, rareza, onChange, lockArtesano = false }: ArmorBonusSlotsProps) {
  const limit = ARMOR_RAREZA_BONUS[rareza];

  if (limit === null && lockArtesano) {
    return (
      <div className="space-y-1">
        {bonuses.length === 0 ? (
          <p className="text-xs text-zinc-600">Sin bonus en esta pieza.</p>
        ) : (
          bonuses.map((b, i) => (
            <div key={i} className="flex items-center justify-between text-xs bg-zinc-800/60 rounded px-2 py-1">
              <span className="text-zinc-300">{bonusIcon(b.type)} {ARMOR_BONUS_LABELS[b.type]}</span>
              <span className="text-amber-400 font-semibold">+{b.value}</span>
            </div>
          ))
        )}
      </div>
    );
  }

  const max = limit ?? ARTESANO_CATALOG_MAX;
  if (max === 0 && bonuses.length === 0) {
    return <p className="text-xs text-zinc-600">{rareza}: las piezas no tienen bonus propios.</p>;
  }

  const options = bonusSelectOptions(
    ARMOR_BONUS_TYPES.filter((t) => slot === 'escudo' || !SHIELD_ONLY_BONUS_TYPES.includes(t)),
    (t) => ARMOR_BONUS_LABELS[t as ArmorBonusType],
  );

  return (
    <SlotEditor
      rows={bonuses.map((b) => ({ tipo: b.type, valor: b.value }))}
      max={max}
      options={options}
      // Los slots vacios no se guardan: fitSlots los vuelve a completar al mostrar.
      onChange={(rows) => onChange(rows.filter((r) => r.tipo).map((r) => ({ type: r.tipo as ArmorBonusType, value: r.valor })))}
      noun={{ one: 'bonus', many: 'bonus' }}
      limitLabel={`Una pieza ${rareza}`}
    />
  );
}
