'use client';

import { useMemo, useRef, useState } from 'react';
import { useArmorSets } from '@/hooks/useArmorSets';
import { useBuildDamage } from '@/hooks/useBuildDamage';
import { useWeapons } from '@/hooks/useWeapons';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { calcWeaponDamage } from '@/lib/engine/damage';
import { setBonusesFor } from '@/lib/engine/armor';
import { simulateHits, seededRng } from '@/lib/engine/simulation';
import { ARMOR_CLASSES, ARMOR_SLOTS_POR_SUBCLASE, CLASE_SUBCLASES, PHYSICAL_DAMAGE_TYPES, MAGICAL_DAMAGE_TYPES } from '@/lib/engine/constants';
import { PageHeader } from '@/components/layout/PageHeader';
import { CompareTabs } from '@/components/comparison/CompareTabs';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { ArmorPicker } from '@/components/comparison/ArmorPicker';
import { ArmorCompareCard, type ArmorBestFlags } from '@/components/comparison/ArmorCompareCard';
import { ArmorHitsChart } from '@/components/comparison/ArmorHitsChart';
import { ArmorComparison } from '@/components/armor/ArmorComparison';
import { ShieldEditor, DEFAULT_COMPARE_SHIELD } from '@/components/comparison/ShieldEditor';
import { getTotalBonuses, setProtection } from '@/components/armor/ArmorSetTable';
import type { ArmorPiece, ArmorSet, CatalogArmorSet } from '@/types/armor';
import type { Subclase } from '@/types/character';
import type { WeaponCalcResult, Weapon } from '@/types/weapon';
import { useT, rich } from '@/i18n/I18nProvider';

const MAX_COMPARE = 5;
const NUM_HITS = 10;
const BUILD_WEAPON = '__build__';

/** Un color por lugar de la comparación (validado para fondo oscuro y daltonismo). */
const SLOT_COLORS = ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181'];

/** Quien se pone el set. Los variantes siempre traen subclase; la de la clase queda como resguardo. */
function defenderOf(set: CatalogArmorSet): Subclase {
  return (set.subclase as Subclase | undefined) ?? CLASE_SUBCLASES[set.clase][0];
}

/**
 * Un set de toda la clase (ej. Dragón) cambia según quién lo usa: el Bárbaro no lleva escudo y
 * cada subclase tiene su bonus de conjunto. Se separa en una versión por subclase para compararlas.
 */
function subclaseVariants(set: CatalogArmorSet): CatalogArmorSet[] {
  if (set.subclase) return [set];
  return CLASE_SUBCLASES[set.clase].map((sub) => ({ ...set, id: `${set.id}|${sub}`, subclase: sub, nombre: `${set.nombre} · ${sub}` }));
}

/** Si la subclase usa escudo y el set no trae uno (ej. Dragón de Caballero), se le pone el escudo elegido. */
function needsShield(set: CatalogArmorSet): boolean {
  const allowed = ARMOR_SLOTS_POR_SUBCLASE[set.subclase as Subclase];
  return !!allowed?.includes('escudo') && !set.pieces.escudo;
}

/** El set del catálogo como armadura puesta, sin buffs ni joyería del defensor. */
function toArmorSet(set: CatalogArmorSet, defender: Subclase): ArmorSet {
  return {
    pieces: set.pieces,
    bonusArmaduraPct: 0,
    generalResistance: { fisico: 0, magico: 0 },
    typeResistance: {},
    barrierPoints: {},
    meleeDmgReductionPct: 0,
    rangedDmgReductionPct: 0,
    bonusConjunto: setBonusesFor(set, defender),
  };
}

const sumOf = (perType: Record<string, number>, types: string[]) => types.reduce((s, dt) => s + (perType[dt] || 0), 0);

export default function CompararArmadurasPage() {
  const t = useT();
  const { sets: catalog } = useArmorSets();
  const [shield, setShield] = useLocalStorage<ArmorPiece>('regnum-compare-armor-shield', DEFAULT_COMPARE_SHIELD);
  // Ids de los sets que llevan el escudo elegido (no traen uno propio)
  const { sets, withShield } = useMemo(() => {
    const withShield = new Set<string>();
    const sets = catalog.flatMap(subclaseVariants).map((set) => {
      if (!needsShield(set)) return set;
      withShield.add(set.id);
      return { ...set, pieces: { ...set.pieces, escudo: shield } };
    });
    return { sets, withShield };
  }, [catalog, shield]);
  const { weapons } = useWeapons();
  const { character, jewelry, weapon: buildWeapon, hasWeapon, mainCalc } = useBuildDamage();
  // Un lugar por color: al quitar un set queda el hueco y los demás no cambian de color
  const [slots, setSlots] = useLocalStorage<(string | null)[]>('regnum-compare-armor-slots', []);
  const [attackerId, setAttackerId] = useLocalStorage<string>('regnum-compare-armor-attacker', BUILD_WEAPON);
  const [seed, setSeed] = useState(1);
  const searchRef = useRef<HTMLInputElement>(null);

  const pickerItems = useMemo(
    () => sets.map((set) => ({ set, totalProt: setProtection(set, ARMOR_CLASSES[defenderOf(set)]).totalProt })),
    [sets],
  );

  // Ignora sets borrados u ocultos (el lugar queda libre)
  const selected = useMemo(
    () => slots.slice(0, MAX_COMPARE).flatMap((id, slot) => {
      const set = id ? sets.find((s) => s.id === id) : undefined;
      return set ? [{ set, slot, color: SLOT_COLORS[slot] }] : [];
    }),
    [slots, sets],
  );
  const selectedIds = selected.map((s) => s.set.id);
  const colorOf = (id: string) => selected.find((s) => s.set.id === id)?.color;

  const toggleSet = (id: string) => {
    setSlots((prev) => {
      const live = prev.slice(0, MAX_COMPARE).map((x) => (x && sets.some((s) => s.id === x) ? x : null));
      const at = live.indexOf(id);
      if (at >= 0) { live[at] = null; return live; }
      const free = live.indexOf(null);
      if (free >= 0) { live[free] = id; return live; }
      if (live.length < MAX_COMPARE) return [...live, id];
      return prev;
    });
  };

  // --- Con qué se golpea: el arma del Build (con flechas/duales) o cualquiera de la lista, con el personaje del Build ---
  const attacker = useMemo((): { weapon: Weapon; calc: WeaponCalcResult } | null => {
    if (attackerId === BUILD_WEAPON) return hasWeapon && mainCalc ? { weapon: buildWeapon, calc: mainCalc } : null;
    const w = weapons.find((x) => x.id === attackerId);
    return w ? { weapon: w, calc: calcWeaponDamage(w, character, jewelry) } : null;
  }, [attackerId, hasWeapon, mainCalc, buildWeapon, weapons, character, jewelry]);

  const attackerOptions = useMemo(() => [
    { value: BUILD_WEAPON, label: hasWeapon ? `${t('Mi arma del Build')} (${buildWeapon.nombre})` : t('Mi arma del Build (no cargada)') },
    ...weapons.filter((w) => !w.isDefault).map((w) => ({ value: w.id, label: w.nombre, group: 'Mis armas' })),
    ...weapons.filter((w) => w.isDefault).map((w) => ({ value: w.id, label: w.nombre, group: 'Armas base' })),
  ], [weapons, hasWeapon, buildWeapon.nombre, t]);

  // --- Stats y golpes de cada set ---
  const rows = useMemo(() => selected.map(({ set, color }) => {
    const defender = defenderOf(set);
    const armorClass = ARMOR_CLASSES[defender];
    const { prot, totalProt } = setProtection(set, armorClass);
    // Misma semilla para todos: mismas tiradas y mismos críticos, solo cambia la armadura
    const sim = attacker
      ? simulateHits(attacker.weapon, character, jewelry, toArmorSet(set, defender), NUM_HITS, defender, null, attacker.calc, seededRng(seed))
      : null;
    return {
      set, color, defender, armorClass, sim,
      fisica: sumOf(prot.perType, PHYSICAL_DAMAGE_TYPES),
      magica: sumOf(prot.perType, MAGICAL_DAMAGE_TYPES),
      total: totalProt,
      bonuses: getTotalBonuses(set, defender),
    };
  }), [selected, attacker, character, jewelry, seed]);

  const { flags, bestReceived } = useMemo(() => {
    const metric = {
      received: (r: (typeof rows)[number]) => (r.sim ? -r.sim.totalDamage : null),
      total: (r: (typeof rows)[number]) => r.total,
      fisica: (r: (typeof rows)[number]) => r.fisica,
      magica: (r: (typeof rows)[number]) => r.magica,
    };
    const flags = new Map<string, ArmorBestFlags>();
    const top = {} as Record<keyof ArmorBestFlags, number>;
    const tied = {} as Record<keyof ArmorBestFlags, boolean>;
    for (const key of Object.keys(metric) as (keyof ArmorBestFlags)[]) {
      const vals = rows.map(metric[key]).map((v) => (v === null ? -Infinity : Math.round(v)));
      top[key] = Math.max(...vals);
      tied[key] = vals.every((v) => v === top[key]);
    }
    for (const r of rows) {
      const f = {} as ArmorBestFlags;
      for (const key of Object.keys(metric) as (keyof ArmorBestFlags)[]) {
        const v = metric[key](r);
        f[key] = rows.length >= 2 && v !== null && Math.round(v) === top[key] && !tied[key];
      }
      flags.set(r.set.id, f);
    }
    return { flags, bestReceived: -top.received };
  }, [rows]);

  const byReceived = [...rows].sort((a, b) => (a.sim?.totalDamage ?? 0) - (b.sim?.totalDamage ?? 0));
  const byTotal = [...rows].sort((a, b) => b.total - a.total);
  const rankOf = (id: string) => (attacker ? byReceived : byTotal).findIndex((r) => r.set.id === id) + 1;
  const diffPct = (received: number) => (bestReceived > 0 ? ((received - bestReceived) / bestReceived) * 100 : 0);
  const emptySlots = MAX_COMPARE - selected.length;
  const attackerTypes = attacker ? Object.keys(attacker.calc.desglose) : [];
  const isPhysical = attackerTypes.length > 0 && attackerTypes.every((dt) => (PHYSICAL_DAMAGE_TYPES as string[]).includes(dt));
  const isMagical = attackerTypes.length > 0 && attackerTypes.every((dt) => (MAGICAL_DAMAGE_TYPES as string[]).includes(dt));

  return (
    <div>
      <CompareTabs />
      <PageHeader
        title={t("Comparar armaduras")}
        description={t('Poné hasta {n} sets lado a lado y mirá cuál te protege más contra los mismos golpes.', { n: MAX_COMPARE })}
        actions={selected.length > 0 ? <Button variant="ghost" size="sm" onClick={() => setSlots([])}>{t("Limpiar")}</Button> : undefined}
      />

      {/* Con qué se golpea */}
      <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] sm:items-end">
        <Select
          label={t("Golpear con")}
          className="w-full min-w-0"
          value={attackerId}
          onChange={(e) => setAttackerId(e.target.value)}
          options={attackerOptions}
        />
        <p className="text-xs text-zinc-400">
          {attacker
            ? t('{n} golpes de {arma} (promedio {prom} por golpe) con los stats y la joyería de tu Build. Cada set recibe exactamente los mismos golpes, así que la diferencia es solo la armadura.', { n: NUM_HITS, arma: attacker.weapon.nombre, prom: attacker.calc.danoPromedio })
            : t('Cargá un arma en el Build o elegí una de la lista para ver los golpes contra cada set.')}
        </p>
      </div>

      {/* Escudo para los sets que no traen (solo si hay alguno en la comparación) */}
      {selected.some((s) => withShield.has(s.set.id)) && (
        <details className="group mb-4 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3" open>
          <summary className="cursor-pointer select-none list-none flex items-center gap-2 text-sm font-semibold text-zinc-200">
            <span className="text-zinc-500 transition-transform group-open:rotate-90">▸</span>
            {t("Tu escudo")}
            <span className="text-xs font-normal text-zinc-500">
              · {t('se usa en: {sets}', { sets: selected.filter((s) => withShield.has(s.set.id)).map((s) => s.set.nombre).join(', ') })}
            </span>
          </summary>
          <p className="mt-2 mb-3 text-xs text-zinc-500">{t('Estos sets no traen escudo, pero un Caballero igual lleva uno. Cargá el tuyo para que la comparación sea justa contra los sets que sí traen.')}</p>
          <ShieldEditor piece={shield} onChange={setShield} onReset={() => setShield(DEFAULT_COMPARE_SHIELD)} />
        </details>
      )}

      {/* Veredicto */}
      {rows.length >= 2 && attacker && (() => {
        const top = byReceived[0];
        const second = byReceived[1];
        const lead = diffPct(second.sim!.totalDamage);
        const strongest = byTotal[0];
        return (
          <div className="mb-4 rounded-lg border border-emerald-700/40 bg-emerald-500/5 px-4 py-3">
            <p className="text-[12px] uppercase tracking-wider text-emerald-400/80 font-semibold mb-1">{t("Veredicto")}</p>
            <p className="text-sm text-zinc-200">
              🛡️ {rich(t, 'Contra {arma}, el que menos daño recibe es {set}', { arma: attacker.weapon.nombre, set: <strong className="text-amber-400">{top.set.nombre}</strong> })}
              {lead !== 0
                ? <> ({top.sim!.totalDamage}). {rich(t, 'Le sigue {set}, que recibe {mas}.', { set: second.set.nombre, mas: <span className="text-red-400">{t('{pct}% más', { pct: lead.toFixed(1) })}</span> })}</>
                : <> ({t('empata con {set}', { set: second.set.nombre })}).</>}
            </p>
            <ul className="mt-1.5 space-y-0.5 text-xs text-zinc-400">
              {strongest.set.id !== top.set.id
                ? <li>📊 {rich(t, '{set} tiene más protección total ({prot}), pero contra esta arma le rinde menos: mirá la protección del tipo de daño que pega.', { set: <span className="text-zinc-200">{strongest.set.nombre}</span>, prot: Math.round(strongest.total) })}</li>
                : <li>📊 {t('También es el de más protección total ({prot}).', { prot: Math.round(strongest.total) })}</li>}
              {(isPhysical || isMagical) && (
                <li>⚔️ {isPhysical ? t('El arma pega solo daño físico: cuenta la protección física y Resistir físico.') : t('El arma pega solo daño mágico: cuenta la protección mágica y Resistir mágico.')}</li>
              )}
            </ul>
          </div>
        );
      })()}

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] gap-4 mb-6 items-start lg:items-stretch">
        <div className="lg:relative lg:min-h-[32rem]">
          <div className="lg:absolute lg:inset-0 flex flex-col bg-zinc-900 border border-zinc-800 rounded-lg animate-fade-in-up">
            <div className="px-4 py-3 border-b border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-200">{t("Armaduras")} <span className="text-zinc-500 font-normal">({selected.length}/{MAX_COMPARE})</span></h3>
            </div>
            <div className="p-4 flex-1 min-h-0">
              <ArmorPicker
                ref={searchRef}
                items={pickerItems}
                selectedIds={selectedIds}
                maxSelected={MAX_COMPARE}
                onToggle={toggleSet}
                colorOf={colorOf}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 content-start">
          {rows.map((r) => (
            <ArmorCompareCard
              key={r.set.id}
              set={r.set}
              color={r.color}
              defender={r.defender}
              armorClass={r.armorClass}
              fisica={r.fisica}
              magica={r.magica}
              total={r.total}
              bonuses={r.bonuses}
              withShield={withShield.has(r.set.id)}
              received={r.sim?.totalDamage ?? null}
              receivedDiffPct={r.sim ? diffPct(r.sim.totalDamage) : 0}
              best={flags.get(r.set.id)!}
              rank={rows.length >= 2 ? rankOf(r.set.id) : undefined}
              onRemove={() => toggleSet(r.set.id)}
            />
          ))}
          {emptySlots > 0 && (
            <button
              onClick={() => searchRef.current?.focus()}
              className="min-h-40 rounded-lg border-2 border-dashed border-zinc-800 hover:border-zinc-700 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer flex flex-col items-center justify-center gap-1 text-sm"
            >
              <span className="text-2xl leading-none">+</span>
              <span>{t("Agregar set")}</span>
              <span className="text-xs text-zinc-600">
                {selected.length === 0 ? t("Buscá y elegí en la lista") : (emptySlots === 1 ? t('Queda 1 lugar') : t('Quedan {n} lugares', { n: emptySlots }))}
              </span>
            </button>
          )}
        </div>
      </div>

      {rows.length >= 1 && attacker && (
        <Card
          className="mb-6"
          title={<span>{t('{n} golpes contra cada set', { n: NUM_HITS })} <span className="text-xs font-normal text-zinc-500">· {t('daño final por golpe, menos es mejor')}</span></span>}
        >
          <ArmorHitsChart
            entries={rows.map((r) => ({ id: r.set.id, nombre: r.set.nombre, color: r.color, sim: r.sim! }))}
            onReroll={() => setSeed((s) => s + 1)}
          />
        </Card>
      )}

      {rows.length >= 2 && (
        <ArmorComparison sets={rows.map((r) => r.set)} armorClass={(set) => ARMOR_CLASSES[defenderOf(set)]} />
      )}

      {rows.length === 1 && (
        <div className="text-center py-6 text-zinc-500 text-sm">{t("Agregá al menos un set más para ver el veredicto y el cuadro comparativo.")}</div>
      )}
    </div>
  );
}
