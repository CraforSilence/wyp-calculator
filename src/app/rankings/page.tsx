'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCharacter } from '@/hooks/useCharacter';
import { useWeapons } from '@/hooks/useWeapons';
import { useJewelry } from '@/hooks/useJewelry';
import { useBuildWeapon } from '@/hooks/useBuildWeapon';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { WeaponSheet } from '@/components/weapons/WeaponSheet';
import { calcWeaponDamage } from '@/lib/engine/damage';
import { PageHeader } from '@/components/layout/PageHeader';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Badge, rarezaToBadgeVariant } from '@/components/ui/Badge';
import { SUBCATEGORIAS_POR_CLASE, DAMAGE_TYPE_LABELS, PHYSICAL_DAMAGE_TYPES } from '@/lib/engine/constants';
import type { WeaponCalcResult, DamageTypeName } from '@/types/weapon';
import type { Clase } from '@/types/character';
import type { Weapon } from '@/types/weapon';
import { useT } from '@/i18n/I18nProvider';
import { DamageIcon } from '@/components/icons/StatIcons';
import { WeaponIcon } from '@/components/icons/WeaponIcon';
import { IconSelect } from '@/components/ui/IconSelect';

type SortKey = 'dps' | 'prom' | 'crit' | 'sg' | 'gps';

/** Columnas ordenables: valor y si "mejor" es mas alto (desc) o mas bajo (asc). */
const SORTS: Record<SortKey, { label: string; title: string; get: (r: WeaponCalcResult) => number; higherIsBetter: boolean }> = {
  prom: { label: 'Prom', title: 'Daño promedio por golpe', get: (r) => r.danoPromedio, higherIsBetter: true },
  crit: { label: 'Crit%', title: 'Chance de crítico total', get: (r) => r.critTotalPct, higherIsBetter: true },
  sg: { label: 's/g', title: 'Segundos por golpe (menos es más rápido)', get: (r) => r.velEfectiva, higherIsBetter: false },
  gps: { label: 'g/s', title: 'Golpes por segundo', get: (r) => r.golpesPorSeg, higherIsBetter: true },
  dps: { label: 'DPS', title: 'Daño por segundo con crítico incluido', get: (r) => r.dpsEfectivo, higherIsBetter: true },
};

const COMPARE_KEY = 'regnum-compare-selected';
const MAX_COMPARE = 5;

function SortTh({ k, active, bestFirst, onSort, className = '' }: {
  k: SortKey; active: boolean; bestFirst: boolean; onSort: (k: SortKey) => void; className?: string;
}) {
  // Flecha segun el orden real de los numeros (desc/asc), no segun "mejor primero"
  const desc = SORTS[k].higherIsBetter === bestFirst;
  const t = useT();
  return (
    <th className={`py-2 px-2 text-right ${className}`} aria-sort={active ? (desc ? 'descending' : 'ascending') : undefined}>
      <button
        onClick={() => onSort(k)}
        title={t('{titulo}. Clic para ordenar.', { titulo: t(SORTS[k].title) })}
        className={`inline-flex items-center gap-0.5 cursor-pointer transition-colors ${active ? 'text-amber-400' : 'hover:text-zinc-300'}`}
      >
        {t(SORTS[k].label)}
        <span className={`text-[10px] ${active ? '' : 'opacity-0'}`}>{desc ? '▼' : '▲'}</span>
      </button>
    </th>
  );
}

export default function RankingsPage() {
  const t = useT();
  const { character } = useCharacter();
  const { weapons } = useWeapons();
  const { jewelry } = useJewelry();
  const [filterClase, setFilterClase] = useState<string>('Todas');
  const [filterSubcat, setFilterSubcat] = useState<string>('Todas');
  const [selectedDetail, setSelectedDetail] = useState<{ weapon: (typeof weapons)[0]; result: WeaponCalcResult } | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('dps');
  // true = orden "mejor primero" de la columna; al tocar de nuevo se invierte
  const [bestFirst, setBestFirst] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const { setWeapon } = useBuildWeapon();
  const [, setCompareIds] = useLocalStorage<string[]>(COMPARE_KEY, []);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) setBestFirst(!bestFirst);
    else { setSortKey(key); setBestFirst(true); }
  };

  const loadInBuild = (weapon: Weapon) => {
    setWeapon(weapon);
    // Abre el Build directo en el paso del arma
    try { window.sessionStorage.setItem('regnum-build-tab', JSON.stringify('armas')); } catch { /* sin sessionStorage */ }
    toast(t('"{arma}" cargada en el Build', { arma: weapon.nombre }), 'success');
    router.push('/build');
  };

  const addToCompare = (id: string) => {
    setCompareIds((prev) => (prev.includes(id) ? prev : [...prev, id].slice(-MAX_COMPARE)));
    router.push('/comparar');
  };

  const results = useMemo(() => {
    return weapons
      .filter((w) => {
        if (filterClase !== 'Todas' && w.clase !== filterClase) return false;
        if (filterSubcat !== 'Todas' && w.subcategoria !== filterSubcat) return false;
        return true;
      })
      .map((w) => ({ weapon: w, result: calcWeaponDamage(w, character, jewelry) }))
      .sort((a, b) => {
        const { get, higherIsBetter } = SORTS[sortKey];
        const diff = get(b.result) - get(a.result);
        return (higherIsBetter === bestFirst ? diff : -diff) || b.result.dpsEfectivo - a.result.dpsEfectivo;
      });
  }, [weapons, character, jewelry, filterClase, filterSubcat, sortKey, bestFirst]);
  const maxDps = Math.max(...results.map((r) => r.result.dpsEfectivo), 1);
  const sortTh = (k: SortKey, className?: string) => (
    <SortTh k={k} active={sortKey === k} bestFirst={bestFirst} onSort={toggleSort} className={className} />
  );

  const subcatOptions = filterClase !== 'Todas'
    ? SUBCATEGORIAS_POR_CLASE[filterClase as Clase] || []
    : [];

  return (
    <div>
      <PageHeader title={t("Rankings")} description={t("Ranking de armas con tu personaje. Tocá una columna para ordenar y un arma para ver el detalle.")} />

      <div className="flex flex-wrap gap-3 mb-4">
        <Select
          label={t("Clase")}
          value={filterClase}
          onChange={(e) => { setFilterClase(e.target.value); setFilterSubcat('Todas'); }}
          options={[{ value: 'Todas', label: 'Todas' }, { value: 'Guerrero', label: 'Guerrero' }, { value: 'Arquero', label: 'Arquero' }, { value: 'Mago', label: 'Mago' }]}
        />
        <div className="sm:hidden">
          <Select
            label={t("Ordenar por")}
            value={sortKey}
            onChange={(e) => { setSortKey(e.target.value as SortKey); setBestFirst(true); }}
            options={(Object.keys(SORTS) as SortKey[]).map((k) => ({ value: k, label: SORTS[k].label }))}
          />
        </div>
        {subcatOptions.length > 0 && (
          <IconSelect
            label={t('Subcategoría')}
            value={filterSubcat}
            onChange={setFilterSubcat}
            renderIcon={(v) => (v === 'Todas' ? null : <WeaponIcon subcategoria={v} />)}
            className="min-w-44"
            options={[{ value: 'Todas', label: 'Todas' }, ...subcatOptions.map((s) => ({ value: s, label: s }))]}
          />
        )}
      </div>

      {/* Mobile card list */}
      <div className="sm:hidden space-y-2">
        {results.map(({ weapon, result }, i) => (
          <div
            key={weapon.id}
            onClick={() => setSelectedDetail({ weapon, result })}
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 cursor-pointer hover:border-zinc-700 transition-colors animate-fade-in-up"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-zinc-500 font-mono">#{i + 1}</span>
                  <WeaponIcon subcategoria={weapon.subcategoria} />
                  <span className="text-sm font-medium text-zinc-200 truncate">{result.nombre}</span>
                </div>
                <Badge variant={rarezaToBadgeVariant(weapon.rareza)} className="mt-1">{t(weapon.rareza)}</Badge>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs text-zinc-500">{t("DPS")}</div>
                <div className="text-base font-bold text-amber-400">{result.dpsEfectivo}</div>
              </div>
            </div>
            <div className="mt-2 h-1 bg-zinc-800 rounded-full overflow-hidden" aria-hidden>
              <div className="h-full bg-amber-500/80 rounded-full" style={{ width: `${(result.dpsEfectivo / maxDps) * 100}%` }} />
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-center">
              <div>
                <div className="text-zinc-500">{t('Daño')}</div>
                <div className="text-zinc-300">{result.danoMin}-{result.danoMax}</div>
              </div>
              <div>
                <div className="text-zinc-500">{t("Crit")}</div>
                <div className="text-zinc-300">{result.critTotalPct}%</div>
              </div>
              <div>
                <div className="text-zinc-500">{t("Vel")}</div>
                <div className="text-zinc-300">{result.velEfectiva}s</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-left text-xs text-zinc-500">
              <th className="py-2 px-2 w-8">#</th>
              <th className="py-2 px-2">{t("Nombre")}</th>
              <th className="py-2 px-2 text-right">{t('Daño')}</th>
              {sortTh('prom')}
              {sortTh('crit')}
              {sortTh('sg')}
              {sortTh('gps')}
              {sortTh('dps', 'font-bold w-40')}
              <th className="py-2 px-2 text-right">{t("Riposte")}</th>
              <th className="py-2 px-2 text-right">{t("Impacto")}</th>
              <th className="py-2 px-2 text-right">{t("Cruz del Sur")}</th>
            </tr>
          </thead>
          <tbody>
            {results.map(({ weapon, result }, i) => (
              <tr
                key={weapon.id}
                onClick={() => setSelectedDetail({ weapon, result })}
                className="border-b border-zinc-800/50 hover:bg-zinc-900 cursor-pointer transition-colors"
              >
                <td className="py-2 px-2 text-zinc-500">{i + 1}</td>
                <td className="py-2 px-2">
                  <div className="flex items-center gap-2">
                    <WeaponIcon subcategoria={weapon.subcategoria} />
                    <span className="text-zinc-200">{result.nombre}</span>
                    <Badge variant={rarezaToBadgeVariant(weapon.rareza)} className="hidden sm:inline-flex">{t(weapon.rareza)}</Badge>
                  </div>
                </td>
                <td className="py-2 px-2 text-right text-zinc-300">{result.danoMin}-{result.danoMax}</td>
                <td className="py-2 px-2 text-right text-zinc-300">{result.danoPromedio}</td>
                <td className="py-2 px-2 text-right text-zinc-300">{result.critTotalPct}%</td>
                <td className="py-2 px-2 text-right text-zinc-400">{result.velEfectiva}</td>
                <td className="py-2 px-2 text-right text-zinc-400">{result.golpesPorSeg}</td>
                <td className="py-2 px-2">
                  <div className="flex items-center justify-end gap-2">
                    <div className="h-1.5 flex-1 max-w-24 bg-zinc-800 rounded-full overflow-hidden" aria-hidden>
                      <div className="h-full bg-amber-500/80 rounded-full" style={{ width: `${(result.dpsEfectivo / maxDps) * 100}%` }} />
                    </div>
                    <span className="font-bold text-amber-400 tabular-nums w-12 text-right">{result.dpsEfectivo}</span>
                  </div>
                </td>
                <td className="py-2 px-2 text-right text-red-400">{result.riposteDmg ?? '-'}</td>
                <td className="py-2 px-2 text-right text-orange-400">
                  {result.impactoVigoroso ? `${result.impactoVigoroso.min}-${result.impactoVigoroso.max}` : '-'}
                </td>
                <td className="py-2 px-2 text-right text-sky-400">
                  {result.cruzDelSur ? `${result.cruzDelSur.min}-${result.cruzDelSur.max}` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {results.length === 0 && (
        <div className="text-center py-12 text-zinc-500">{t("No hay armas que coincidan con el filtro.")}</div>
      )}

      <Modal
        open={!!selectedDetail}
        onClose={() => setSelectedDetail(null)}
        title={selectedDetail?.result.nombre || ''}
        size="md"
      >
        {selectedDetail && (
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 flex-wrap -mt-1">
              <Badge variant={rarezaToBadgeVariant(selectedDetail.weapon.rareza)}>{t(selectedDetail.weapon.rareza)}</Badge>
              <span className="text-xs text-zinc-500">
                {t(selectedDetail.weapon.clase)} &middot; <WeaponIcon subcategoria={selectedDetail.weapon.subcategoria} /> {t(selectedDetail.weapon.subcategoria)} &middot; {t(selectedDetail.weapon.velocidad)}
              </span>
            </div>

            <WeaponSheet weapon={selectedDetail.weapon} />

            {(() => {
              const r = selectedDetail.result;
              const ability = r.riposteDmg
                ? { label: 'Riposte', value: String(r.riposteDmg), color: 'text-red-400' }
                : r.impactoVigoroso
                  ? { label: 'Impacto', value: `${r.impactoVigoroso.min}–${r.impactoVigoroso.max}`, color: 'text-orange-400' }
                  : r.cruzDelSur
                    ? { label: 'Cruz del Sur', value: `${r.cruzDelSur.min}–${r.cruzDelSur.max}`, color: 'text-sky-400' }
                    : null;
              const tiles: { label: string; value: React.ReactNode; sub?: string; color?: string }[] = [
                { label: 'Daño', value: `${r.danoMin}–${r.danoMax}` },
                { label: 'Promedio', value: r.danoPromedio },
                { label: 'DPS', value: r.dpsEfectivo, color: 'text-amber-400' },
                { label: 'Crítico', value: `${r.critTotalPct}%`, sub: `x${r.critMult}` },
                { label: 'Velocidad', value: `${r.velEfectiva}s`, sub: `${r.golpesPorSeg} g/s` },
                ability
                  ? { label: ability.label, value: ability.value, color: ability.color }
                  : { label: 'Habilidad', value: '—', color: 'text-zinc-600' },
              ];
              return (
                <div
                  className="rounded-md border border-zinc-700/70 bg-zinc-950/70 px-3 py-2.5"
                  title={t("Calculado con los atributos de tu personaje y tu joyería")}
                >
                  <span className="text-[11px] uppercase tracking-wider text-amber-500/80 font-semibold">{t("Con tu personaje")}</span>
                  <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                    {tiles.map((dt) => (
                      <div key={dt.label} className="rounded bg-zinc-900/80 px-1.5 py-1.5 text-center">
                        <div className="text-[11px] uppercase tracking-wider text-zinc-500">{t(dt.label)}</div>
                        <div className={`text-sm font-semibold tabular-nums ${dt.color ?? 'text-zinc-100'}`}>{dt.value}</div>
                        {dt.sub && <div className="text-[11px] text-zinc-500 tabular-nums">{dt.sub}</div>}
                      </div>
                    ))}
                  </div>

                  <div className="mt-2 pt-1.5 border-t border-zinc-800/80">
                    <div className="text-[11px] uppercase tracking-wider text-zinc-600">{t("Desglose por tipo")}</div>
                    {(Object.entries(r.desglose) as [DamageTypeName, [number, number]][]).map(([tipo, [min, max]]) => (
                      <div key={tipo} className="flex items-baseline justify-between gap-2 py-0.5">
                        <span className="text-xs text-zinc-500 inline-flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${PHYSICAL_DAMAGE_TYPES.includes(tipo) ? 'bg-orange-500' : 'bg-blue-500'}`} />
                          <DamageIcon type={tipo} /> {t(DAMAGE_TYPE_LABELS[tipo] || tipo)}
                        </span>
                        <span className="text-sm text-zinc-200 tabular-nums">{min === max ? min : `${min} – ${max}`}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" className="w-full" onClick={() => loadInBuild(selectedDetail.weapon)}>{t("Usar en el Build")}</Button>
              <Button size="sm" variant="secondary" className="w-full" onClick={() => addToCompare(selectedDetail.weapon.id)}>{t("Agregar a Comparar")}</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
