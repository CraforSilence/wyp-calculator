'use client';

import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { CLASE_SUBCLASES } from '@/lib/engine/constants';
import { filterArmorForSubclase } from '@/lib/engine/armor';
import type { Subclase } from '@/types/character';
import type { CatalogArmorSet } from '@/types/armor';
import { useT } from '@/i18n/I18nProvider';

export interface ArmorPickerItem {
  set: CatalogArmorSet;
  totalProt: number;
}

interface ArmorPickerProps {
  items: ArmorPickerItem[];
  selectedIds: string[];
  maxSelected: number;
  onToggle: (id: string) => void;
  /** Color de cada set elegido (el mismo que usa el gráfico de golpes). */
  colorOf: (id: string) => string | undefined;
  ref?: React.Ref<HTMLInputElement>;
}

const CLASES = ['Todas', 'Guerrero', 'Arquero', 'Mago'] as const;

/** Normaliza para buscar sin importar tildes ni mayusculas */
function norm(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export function ArmorPicker({ items, selectedIds, maxSelected, onToggle, colorOf, ref }: ArmorPickerProps) {
  const t = useT();
  const [query, setQuery] = useState('');
  const [clase, setClase] = useState<(typeof CLASES)[number]>('Todas');
  const [subclase, setSubclase] = useState<string>('Todas');
  const subclases = clase === 'Todas' ? [] : CLASE_SUBCLASES[clase];

  const filtered = useMemo(() => {
    const terms = norm(query).split(/\s+/).filter(Boolean);
    return items
      .filter(({ set }) => {
        if (clase !== 'Todas' && set.clase !== clase) return false;
        if (subclase !== 'Todas' && set.subclase !== subclase) return false;
        if (terms.length === 0) return true;
        const haystack = norm(`${set.nombre} ${t(set.clase)} ${set.subclase ? t(set.subclase) : ''} ${set.notas ?? ''}`);
        return terms.every((term) => haystack.includes(term));
      })
      .sort((a, b) => a.set.nombre.localeCompare(b.set.nombre));
  }, [items, query, clase, subclase, t]);

  const full = selectedIds.length >= maxSelected;

  return (
    <div className="flex flex-col h-full">
      <div className="relative mb-3">
        <svg className="w-4 h-4 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
        </svg>
        <input
          ref={ref}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("Buscar set por nombre o subclase...")}
          className="w-full bg-zinc-800 border border-zinc-700 rounded pl-8 pr-2.5 py-1.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-colors"
        />
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {CLASES.map((c) => (
          <button
            key={c}
            onClick={() => { setClase(c); setSubclase('Todas'); }}
            className={`px-2.5 py-0.5 rounded text-xs border transition-colors cursor-pointer ${
              clase === c
                ? 'bg-amber-900/30 border-amber-700 text-amber-400'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
            }`}
          >
            {t(c)}
          </button>
        ))}
      </div>

      {subclases.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {['Todas', ...subclases].map((sc) => (
            <button
              key={sc}
              onClick={() => setSubclase(sc)}
              className={`px-2.5 py-0.5 rounded text-xs border transition-colors cursor-pointer ${
                subclase === sc
                  ? 'bg-cyan-900/30 border-cyan-700 text-cyan-400'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
              }`}
            >
              {t(sc)}
            </button>
          ))}
        </div>
      )}

      <div className="max-h-72 lg:max-h-none lg:flex-1 lg:min-h-0 overflow-y-auto rounded border border-zinc-800 divide-y divide-zinc-800/70">
        {filtered.length === 0 && (
          <div className="py-6 text-center text-sm text-zinc-500">{t("No hay sets que coincidan.")}</div>
        )}
        {filtered.map(({ set, totalProt }) => {
          const isSelected = selectedIds.includes(set.id);
          const disabled = !isSelected && full;
          const color = colorOf(set.id);
          return (
            <button
              key={set.id}
              onClick={() => onToggle(set.id)}
              disabled={disabled}
              title={disabled ? t('Máximo {n} sets. Quitá uno para agregar otro.', { n: maxSelected }) : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${
                isSelected ? 'bg-amber-900/15' : 'hover:bg-zinc-800/60'
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-sm truncate ${isSelected ? 'text-amber-300' : 'text-zinc-200'}`}>{set.nombre}</span>
                  {!set.isDefault && <Badge variant="info">{t("Propio")}</Badge>}
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">
                  {t(set.clase)}{set.subclase && <> &middot; {t(set.subclase)}</>} &middot; {t('{n} piezas', { n: Object.keys((set.subclase ? filterArmorForSubclase(set, set.subclase as Subclase) : set).pieces).length })}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs text-zinc-500">{t("Protección")}</div>
                <div className="text-sm font-semibold text-amber-400 tabular-nums">{Math.round(totalProt)}</div>
              </div>
              <span
                className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold border ${
                  isSelected ? 'text-white border-transparent' : 'border-zinc-600 text-zinc-400'
                }`}
                style={isSelected && color ? { backgroundColor: color } : undefined}
                aria-hidden
              >
                {isSelected ? '✓' : '+'}
              </span>
            </button>
          );
        })}
      </div>
      <div className="text-xs text-zinc-500 mt-2">
        {t('{n} de {total} sets', { n: filtered.length, total: items.length })}
      </div>
    </div>
  );
}
