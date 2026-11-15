'use client';

import { ARMOR_BONUS_LABELS } from '@/lib/engine/constants';
import { BonusIcon } from '@/components/icons/StatIcons';
import type { ArmorBonus, CatalogArmorSet } from '@/types/armor';
import type { Subclase } from '@/types/character';
import { useT } from '@/i18n/I18nProvider';

export interface ArmorBestFlags {
  received: boolean;
  total: boolean;
  fisica: boolean;
  magica: boolean;
}

interface ArmorCompareCardProps {
  set: CatalogArmorSet;
  color: string;
  defender: Subclase;
  armorClass: number;
  fisica: number;
  magica: number;
  total: number;
  bonuses: ArmorBonus[];
  /** Lleva el escudo cargado en la comparación (el set no trae uno). */
  withShield?: boolean;
  /** Daño total que recibe en la simulación (null si no hay arma para golpear). */
  received: number | null;
  /** % de daño de más que recibe contra el mejor set (0 = el mejor). */
  receivedDiffPct: number;
  best: ArmorBestFlags;
  rank?: number;
  onRemove: () => void;
}

/** Defensivos primero: son los que cambian el daño recibido. */
const DEFENSIVE = new Set(['armaduraPct', 'bloqueo', 'resistirFisico', 'resistirMagico', 'resistirFuego', 'resistirHielo',
  'resistirElectricidad', 'resistirAplastante', 'resistirCortante', 'resistirPunzante']);

export function ArmorCompareCard({
  set, color, defender, armorClass, fisica, magica, total, bonuses, withShield, received, receivedDiffPct, best, rank, onRemove,
}: ArmorCompareCardProps) {
  const t = useT();
  const sorted = [...bonuses].sort((a, b) => Number(DEFENSIVE.has(b.type)) - Number(DEFENSIVE.has(a.type)));
  const num = (on: boolean) => (on ? 'text-emerald-400' : 'text-zinc-200');

  return (
    <div className="relative bg-zinc-900 border border-zinc-800 rounded-lg p-4 border-t-4 animate-fade-in-up" style={{ borderTopColor: color }}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {rank !== undefined && (
              <span className={`shrink-0 text-xs font-bold tabular-nums ${rank === 1 ? 'text-amber-400' : 'text-zinc-500'}`}>#{rank}</span>
            )}
            <h3 className="text-sm font-semibold text-zinc-100 truncate" title={set.nombre}>{set.nombre}</h3>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            {t(defender)} &middot; {t('clase de armadura x{n}', { n: armorClass.toFixed(2) })}
          </p>
          {withShield && (
            <p className="mt-1 inline-flex items-center gap-1 rounded border border-zinc-700 bg-zinc-800/60 px-1.5 py-0.5 text-[11px] text-zinc-300">
              <img src="/icons/escudo.svg" alt="" className="w-3 h-3" /> {t("+ tu escudo")}
            </p>
          )}
        </div>
        <button
          onClick={onRemove}
          className="shrink-0 w-6 h-6 rounded text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-colors cursor-pointer"
          title={t("Quitar de la comparación")}
          aria-label={t("Quitar de la comparación")}
        >
          ×
        </button>
      </div>

      {received !== null && (
        <div className="mt-3 rounded-md bg-zinc-800/50 px-3 py-2">
          <div className="text-[11px] uppercase tracking-wide text-zinc-500">{t("Daño recibido (10 golpes)")}</div>
          <div className="flex items-baseline justify-between gap-2">
            <span className={`text-xl font-bold tabular-nums ${num(best.received)}`}>{received}</span>
            <span className={`text-xs ${best.received ? 'text-emerald-400' : 'text-zinc-500'}`}>
              {best.received ? t("🏆 recibe menos") : receivedDiffPct === 0 ? t("empate") : t('+{pct}% más', { pct: receivedDiffPct.toFixed(1) })}
            </span>
          </div>
        </div>
      )}

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-xs text-zinc-500">{t("Física")}</div>
          <div className={`text-sm font-semibold tabular-nums ${num(best.fisica)}`}>{Math.round(fisica)}</div>
        </div>
        <div>
          <div className="text-xs text-zinc-500">{t("Mágica")}</div>
          <div className={`text-sm font-semibold tabular-nums ${num(best.magica)}`}>{Math.round(magica)}</div>
        </div>
        <div>
          <div className="text-xs text-zinc-500">{t("Total")}</div>
          <div className={`text-sm font-bold tabular-nums ${best.total ? 'text-emerald-400' : 'text-amber-400'}`}>{Math.round(total)}</div>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-zinc-800 flex flex-wrap gap-x-3 gap-y-1">
        {sorted.map((b) => (
          <span key={b.type} className={`text-xs ${DEFENSIVE.has(b.type) ? 'text-zinc-300' : 'text-zinc-500'}`}>
            <BonusIcon bonus={b.type} /> {t(ARMOR_BONUS_LABELS[b.type])}: <span className="font-medium text-amber-400">+{b.value}</span>
          </span>
        ))}
        {sorted.length === 0 && <span className="text-xs text-zinc-600">{t('Sin bonus')}</span>}
      </div>
    </div>
  );
}
