'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { isMuescaSpeedType } from '@/lib/engine/constants';
import { useT } from '@/i18n/I18nProvider';

/** Un slot de bonus o muesca. `tipo: ''` = slot vacio. */
export interface SlotRow {
  tipo: string;
  valor: number;
}

export const EMPTY_SLOT: SlotRow = { tipo: '', valor: 0 };

/** Input de valor de una muesca: % para las de velocidad, nivel 1-30 para las de dano. */
export function muescaValueInput(tipo: string) {
  return isMuescaSpeedType(tipo)
    ? { placeholder: '%', max: 100, tooltip: 'Porcentaje de velocidad de la gema' }
    : { placeholder: 'Valor', max: 30, tooltip: 'Nivel de la gema (1-30)' };
}

/**
 * Completa con slots vacios hasta `max`. Los slots con datos que exceden el maximo se
 * conservan (por ejemplo al bajar la rareza) para que el usuario decida cual sacar.
 */
export function fitSlots<T extends SlotRow>(rows: T[], max: number): T[] {
  const slots = rows.slice(0, max);
  while (slots.length < max) slots.push({ ...EMPTY_SLOT } as T);
  for (const row of rows.slice(max)) {
    if (!row.tipo) continue;
    const free = slots.findIndex((s) => !s.tipo);
    if (free >= 0) slots[free] = row;
    else slots.push(row);
  }
  return slots;
}

interface SlotEditorProps<T extends SlotRow> {
  rows: T[];
  max: number;
  options: { value: string; label: string }[];
  onChange: (rows: T[]) => void;
  /** Que pide el input de valor segun el tipo elegido. */
  valueInput?: (tipo: string) => { placeholder?: string; max?: number; tooltip?: string };
  selectTooltip?: string;
  /** Nombre de lo que se edita, en singular y plural ("bonus", "muesca"/"muescas"). */
  noun: { one: string; many: string };
  /** Texto del limite para el aviso, por ejemplo "Una arma Epica". */
  limitLabel: string;
  /** Ancho del input de valor; mas angosto en cards chicas como la joyeria. */
  valueWidthClass?: string;
  /** Muestra solo los slots con datos y un boton para agregar, en vez de todos los vacios. */
  collapseEmpty?: boolean;
}

/** Edita una cantidad fija de slots (la que permite la rareza), en vez de agregar filas. */
export function SlotEditor<T extends SlotRow>({
  rows, max, options, onChange, valueInput, selectTooltip, noun, limitLabel, valueWidthClass = 'w-20', collapseEmpty = false,
}: SlotEditorProps<T>) {
  const t = useT();
  const slots = fitSlots(rows, max);
  // En modo compacto, el slot vacio que el usuario abrio con "+ Agregar"
  const [adding, setAdding] = useState(false);
  const firstFree = slots.findIndex((r) => !r.tipo);
  const freeCount = slots.slice(0, max).filter((r) => !r.tipo).length;
  const isVisible = (row: SlotRow, i: number) => !collapseEmpty || !!row.tipo || (adding && i === firstFree);
  const overflow = slots.length - max;
  // Tipos que esta rareza no admite (por ejemplo, un bonus de dano en una Arcana).
  const isAllowed = (tipo: string) => !tipo || options.some((o) => o.value === tipo);
  const disallowed = slots.filter((r) => !isAllowed(r.tipo)).length;

  const update = (i: number, patch: Partial<SlotRow>) => {
    if (patch.tipo) setAdding(false);
    const next = [...slots];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };
  const clear = (i: number) => {
    // Los slots de mas se quitan; los del limite quedan vacios.
    onChange(i < max ? slots.map((r, j) => (j === i ? ({ ...EMPTY_SLOT } as T) : r)) : slots.filter((_, j) => j !== i));
  };

  return (
    <div className="space-y-2">
      {slots.map((row, i) => {
        if (!isVisible(row, i)) return null;
        const extra = i >= max;
        const invalid = extra || !isAllowed(row.tipo);
        const vi = row.tipo ? valueInput?.(row.tipo) : undefined;
        return (
          <div key={i} className="flex gap-2 items-end">
            <span
              className={`shrink-0 w-5 pb-1.5 text-xs text-right ${invalid ? 'text-red-400' : 'text-zinc-500'}`}
              title={extra ? t('Excede el límite de esta rareza') : invalid ? t("Esta rareza no admite este tipo") : undefined}
            >
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
            <Select
              tooltip={selectTooltip}
              value={row.tipo}
              onChange={(e) => update(i, { tipo: e.target.value, ...(e.target.value ? {} : { valor: 0 }) })}
              options={[
                { value: '', label: '— Vacío —' },
                ...options,
                // Se muestra el tipo no permitido para que se vea que hay que cambiarlo.
                ...(isAllowed(row.tipo) ? [] : [{ value: row.tipo, label: `${t(row.tipo)} (${t('no permitido')})` }]),
              ]}
              className={`w-full ${row.tipo ? '' : 'text-zinc-500'} ${invalid ? 'border-red-500/70' : ''}`}
            />
            </div>
            <Input
              type="number"
              min={1}
              max={vi?.max}
              tooltip={vi?.tooltip && t(vi.tooltip)}
              placeholder={t(vi?.placeholder ?? 'Valor')}
              disabled={!row.tipo}
              value={row.valor || ''}
              onChange={(e) => update(i, { valor: Number(e.target.value) })}
              className={`${valueWidthClass} shrink-0 disabled:opacity-40`}
            />
            {(row.tipo || extra) ? (
              <Button size="sm" variant="danger-ghost" onClick={() => clear(i)} title={extra ? t("Quitar") : t("Vaciar slot")}>x</Button>
            ) : collapseEmpty ? (
              <Button size="sm" variant="ghost" onClick={() => setAdding(false)} title={t("Cancelar")}>x</Button>
            ) : null}
          </div>
        );
      })}
      {collapseEmpty && !adding && freeCount > 0 && (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="w-full rounded border border-dashed border-zinc-700 hover:border-amber-600/60 hover:bg-amber-400/5 py-2 text-xs text-amber-400 hover:text-amber-300 transition-colors"
        >
          + {t('Agregar {cosa}', { cosa: t(noun.one) })}
          <span className="ml-1 text-zinc-500">({freeCount} {freeCount === 1 ? t("libre") : t("libres")})</span>
        </button>
      )}
      {overflow > 0 && (
        <p className="text-xs text-red-400">
          {t('{limite} permite {max} {cosas}. Sacá {sobran} (en rojo).', { limite: limitLabel, max, cosas: t(max === 1 ? noun.one : noun.many), sobran: overflow })}
        </p>
      )}
      {disallowed > 0 && (
        <p className="text-xs text-red-400">
          {t('{limite} solo admite: {opciones}. Cambiá o sacá lo marcado en rojo.', { limite: limitLabel, opciones: options.map((o) => t(o.label.replace(/^[^\p{L}]*/u, ''))).join(', ') })}
        </p>
      )}
    </div>
  );
}
