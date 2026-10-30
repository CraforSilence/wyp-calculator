'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Subclase } from '@/types/character';
import type { Weapon, WeaponCalcResult } from '@/types/weapon';
import { calcAbilities, type AbilityDamage } from '@/lib/engine/abilities';
import { useTrainer } from '@/hooks/useTrainer';
import { getTrainer } from '@/lib/trainer';
import { PODER_MAX } from '@/data/trainer/rules';
import { SUBCATEGORIAS_POR_SUBCLASE } from '@/lib/engine/constants';
import { POWER_ICONS } from '@/data/trainer/icons';
import { PowerIcon } from '@/components/icons/PowerIcons';
import { useI18n } from '@/i18n/I18nProvider';

interface AbilityTableProps {
  weapon: Weapon;
  calc: WeaponCalcResult;
  subclase: Subclase;
  /** Una sola columna de nivel (con selector), para fichas angostas */
  compact?: boolean;
}

/** Nivel de cada poder en el setup abierto del Entrenador, si es de esta subclase */
function useTrainerLevels(subclase: Subclase): Map<string, number> | null {
  const { current } = useTrainer();
  return useMemo(() => {
    if (current.subclase !== subclase) return null;
    const trainer = getTrainer(subclase);
    if (!trainer) return null;
    const map = new Map<string, number>();
    trainer.disciplinas.forEach((d, row) => d.poderes.forEach((p, i) => map.set(p.id, current.poderes[row]?.[i] ?? 0)));
    return map;
  }, [current, subclase]);
}

const range = (min: number, max: number) => (min === max ? `${min}` : `${min}–${max}`);
const LEVELS = Array.from({ length: PODER_MAX }, (_, i) => i + 1);

/** Valores del daño extra: uno solo si es igual en todos los niveles, o el del nivel elegido */
function extraText(values: string[], level: number | null): string {
  const filled = values.filter(Boolean);
  if (level) return values[level - 1] || '—';
  return new Set(filled).size === 1 ? filled[0] : filled.join(' / ');
}

type Pick = number | 'mine';

/** Daño de los poderes de la subclase con esta arma, por nivel */
export function AbilityTable({ weapon, calc, subclase, compact }: AbilityTableProps) {
  const { lang, t } = useI18n();
  const levels = useTrainerLevels(subclase);
  const [onlyMine, setOnlyMine] = useState(false);
  const [pick, setPick] = useState<Pick>(levels ? 'mine' : PODER_MAX);
  const all = useMemo(() => calcAbilities(weapon, calc, subclase), [weapon, calc, subclase]);
  const visible = onlyMine && levels ? all.filter((a) => (levels.get(a.power.id) ?? 0) > 0) : all;
  const conArma = visible.filter((a) => a.conArma);
  const fijos = visible.filter((a) => !a.conArma);
  const activePick: Pick = pick === 'mine' && !levels ? PODER_MAX : pick;

  if (!SUBCATEGORIAS_POR_SUBCLASE[subclase].includes(weapon.subcategoria)) {
    return <p className="text-sm text-zinc-500">{t('Tu {subclase} no puede usar {tipo}: elegí un arma de tu subclase para ver sus habilidades.', { subclase: t(subclase), tipo: t(weapon.subcategoria) })}</p>;
  }
  if (all.length === 0) return <p className="text-sm text-zinc-500">{t('Esta arma no tiene poderes de daño para tu subclase.')}</p>;

  const cols = compact ? 1 : PODER_MAX;

  const row = (a: AbilityDamage) => {
    const mine = levels?.get(a.power.id) ?? 0;
    const spec = POWER_ICONS[a.power.id];
    const onlyExtras = a.niveles.every((l) => l.max === 0);
    // Nivel que muestra la columna única del modo compacto
    const shown = activePick === 'mine' ? mine : activePick;
    const cell = (lvl: number, highlight: boolean) => (
      <td
        key={lvl}
        className={`px-1.5 py-1.5 text-center tabular-nums whitespace-nowrap ${highlight ? 'bg-amber-600/20 text-amber-200 font-semibold rounded' : 'text-zinc-300'}`}
      >
        {lvl === 0 || onlyExtras ? <span className="text-zinc-600">—</span> : range(a.niveles[lvl - 1].min, a.niveles[lvl - 1].max)}
      </td>
    );
    return (
      <tr key={`${a.discipline.id}-${a.power.id}`} className={`border-t border-zinc-800/70 ${levels && mine === 0 ? 'opacity-55' : ''}`}>
        <td className="py-1.5 pr-2 w-full">
          <div className="flex items-center gap-2 min-w-0">
            {spec && <PowerIcon spec={spec} className={`${compact ? 'w-6 h-6' : 'w-7 h-7'} shrink-0 rounded`} />}
            <div className="min-w-0">
              <div className="text-zinc-100 font-medium">
                {a.power.nombre[lang]}
                {a.probada && <span className="ml-1 text-emerald-400" title={t('Fórmula probada en el juego')}>✓</span>}
                {compact && activePick === 'mine' && mine > 0 && <span className="ml-1 text-[11px] text-amber-400/80">{t('Nv {n}', { n: mine })}</span>}
              </div>
              {!compact && <div className="text-[11px] text-zinc-500">{a.discipline.nombre[lang]}</div>}
              {a.extras.map((e) => (
                <div key={e.label.es} className="text-[11px] text-zinc-500">
                  + {e.label[lang]}: {extraText(e.values, compact ? (shown || null) : mine || null)}
                </div>
              ))}
            </div>
          </div>
        </td>
        {compact ? cell(shown, activePick === 'mine' && shown > 0) : LEVELS.map((lvl) => cell(lvl, mine === lvl))}
      </tr>
    );
  };

  const section = (label: string) => (
    <tr>
      <td colSpan={cols + 1} className="pt-3 pb-1 text-[11px] uppercase tracking-wider text-zinc-500">{label}</td>
    </tr>
  );

  return (
    <div className={`space-y-3 ${compact ? 'text-xs' : 'text-sm'}`}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-500">
        {levels ? (
          <>
            {!compact && <span>{t('Resaltado: tu nivel en el setup del Entrenador.')}</span>}
            <label className="inline-flex items-center gap-1.5 cursor-pointer text-zinc-300">
              <input type="checkbox" className="accent-amber-500" checked={onlyMine} onChange={(e) => setOnlyMine(e.target.checked)} />
              {t('Solo los que tengo')}
            </label>
          </>
        ) : (
          <span>
            {t('Armá tu setup de {subclase} en el', { subclase: t(subclase) })}{' '}
            <Link href="/entrenador" className="text-amber-400 hover:text-amber-300 hover:underline underline-offset-2">{t('Entrenador')}</Link>{' '}
            {t('para ver resaltado el nivel de cada poder.')}
          </span>
        )}
        {compact && (
          <div className="inline-flex rounded border border-zinc-700 overflow-hidden" role="group" aria-label={t('Nivel del poder')}>
            {([...(levels ? ['mine' as const] : []), ...LEVELS] as Pick[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPick(p)}
                aria-pressed={activePick === p}
                className={`px-2 py-1 cursor-pointer ${activePick === p ? 'bg-amber-600/20 text-amber-400' : 'text-zinc-400 hover:bg-zinc-800'}`}
              >
                {p === 'mine' ? t('Mi nivel') : t('Nv {n}', { n: p })}
              </button>
            ))}
          </div>
        )}
      </div>

      {visible.length === 0 ? (
        <p className="text-xs text-zinc-500">{t('Tu setup no tiene poderes de daño para esta arma.')}</p>
      ) : (
        <div className="overflow-x-auto -mx-1 px-1">
          <table className="w-full">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-zinc-500">
                <th className="text-left font-medium pb-1">{t('Poder')}</th>
                {compact
                  ? <th className="font-medium pb-1 px-1.5 text-center">{activePick === 'mine' ? t('Mi nivel') : t('Nv {n}', { n: activePick })}</th>
                  : LEVELS.map((n) => <th key={n} className="font-medium pb-1 px-1.5 text-center">{t('Nv {n}', { n })}</th>)}
              </tr>
            </thead>
            <tbody>
              {conArma.length > 0 && fijos.length > 0 && section(t('Con el arma'))}
              {conArma.map(row)}
              {fijos.length > 0 && section(t('Daño propio del poder (no depende del arma)'))}
              {fijos.map(row)}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-[11px] text-zinc-500">
        {t('Daño antes de la armadura del enemigo, sin crítico.')}{' '}
        <span className="text-emerald-400">✓</span> {t('fórmula probada en el juego; el resto se calcula con los valores de cada poder (daño del arma × % + daño fijo) y es estimado.')}
      </p>
    </div>
  );
}
