'use client';

import { useMemo, useState } from 'react';
import { Badge, rarezaToBadgeVariant } from '@/components/ui/Badge';
import type { Weapon, WeaponCalcResult } from '@/types/weapon';
import { useT } from '@/i18n/I18nProvider';

export interface PickerItem {
  weapon: Weapon;
  result: WeaponCalcResult;
}

interface WeaponPickerProps {
  items: PickerItem[];
  selectedIds: string[];
  maxSelected: number;
  onToggle: (id: string) => void;
  ref?: React.Ref<HTMLInputElement>;
}

/** Normaliza para buscar sin importar tildes ni mayusculas */
function norm(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export function WeaponPicker({ items, selectedIds, maxSelected, onToggle, ref }: WeaponPickerProps) {
  const t = useT();
  const [query, setQuery] = useState('');
  const [subcatChoice, setSubcat] = useState<string>('Todas');

  const subcats = useMemo(
    () => Array.from(new Set(items.map((i) => i.weapon.subcategoria))).sort(),
    [items],
  );
  // Si la lista de armas cambia y la subcategoria elegida ya no existe, volver a 'Todas'
  const subcat = (subcats as string[]).includes(subcatChoice) ? subcatChoice : 'Todas';

  const filtered = useMemo(() => {
    const terms = norm(query).split(/\s+/).filter(Boolean);
    return items
      .filter(({ weapon }) => {
        if (subcat !== 'Todas' && weapon.subcategoria !== subcat) return false;
        if (terms.length === 0) return true;
        const haystack = norm(`${weapon.nombre} ${t(weapon.subcategoria)} ${t(weapon.rareza)} ${t(weapon.velocidad)} ${weapon.notas ?? ''}`);
        return terms.every((dt) => haystack.includes(dt));
      })
      .sort((a, b) => a.weapon.nombre.localeCompare(b.weapon.nombre));
  }, [items, query, subcat]);

  const full = selectedIds.length >= maxSelected;

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <div className="relative flex-1">
          <svg className="w-4 h-4 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
          </svg>
          <input
            ref={ref}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("Buscar arma por nombre, tipo, rareza...")}
            className="w-full bg-zinc-800 border border-zinc-700 rounded pl-8 pr-2.5 py-1.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-colors"
          />
        </div>
      </div>

      {subcats.length > 1 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {['Todas', ...subcats].map((s) => (
            <button
              key={s}
              onClick={() => setSubcat(s)}
              className={`px-2.5 py-0.5 rounded text-xs border transition-colors cursor-pointer ${
                subcat === s
                  ? 'bg-amber-900/30 border-amber-700 text-amber-400'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
              }`}
            >
              {t(s)}
            </button>
          ))}
        </div>
      )}

      <div className="max-h-72 lg:max-h-none lg:flex-1 lg:min-h-0 overflow-y-auto rounded border border-zinc-800 divide-y divide-zinc-800/70">
        {filtered.length === 0 && (
          <div className="py-6 text-center text-sm text-zinc-500">{t("No hay armas que coincidan.")}</div>
        )}
        {filtered.map(({ weapon, result }) => {
          const isSelected = selectedIds.includes(weapon.id);
          const disabled = !isSelected && full;
          return (
            <button
              key={weapon.id}
              onClick={() => onToggle(weapon.id)}
              disabled={disabled}
              title={disabled ? t('Máximo {n} armas. Quitá una para agregar otra.', { n: maxSelected }) : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${
                isSelected ? 'bg-amber-900/15' : 'hover:bg-zinc-800/60'
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-sm truncate ${isSelected ? 'text-amber-300' : 'text-zinc-200'}`}>{weapon.nombre}</span>
                  <Badge variant={rarezaToBadgeVariant(weapon.rareza)}>{t(weapon.rareza)}</Badge>
                  {!weapon.isDefault && <Badge variant="info">{t("Propia")}</Badge>}
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">
                  {t(weapon.subcategoria)} &middot; {t(weapon.velocidad)} &middot; {result.danoMin}-{result.danoMax}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs text-zinc-500">{t("DPS")}</div>
                <div className="text-sm font-semibold text-amber-400">{result.dpsEfectivo}</div>
              </div>
              <span
                className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold border ${
                  isSelected
                    ? 'bg-amber-600 border-amber-500 text-white'
                    : 'border-zinc-600 text-zinc-400'
                }`}
                aria-hidden
              >
                {isSelected ? '✓' : '+'}
              </span>
            </button>
          );
        })}
      </div>
      <div className="text-xs text-zinc-500 mt-2">
        {t('{n} de {total} armas', { n: filtered.length, total: items.length })}
      </div>
    </div>
  );
}
