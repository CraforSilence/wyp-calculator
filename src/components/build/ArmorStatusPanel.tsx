'use client';

import { useMemo } from 'react';
import { useCharacter } from '@/hooks/useCharacter';
import { useArmor } from '@/hooks/useArmor';
import { calcTotalProtection, calcAverageProtectionFactors, filterArmorForSubclase } from '@/lib/engine/armor';
import { pureHitPassThrough, totalResistancePct, minimumOnlyThreshold } from '@/lib/engine/resistance';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useBuildDamage } from '@/hooks/useBuildDamage';
import { buildEffectiveArmorSet } from '@/lib/engine/simulation';
import {
  ARMOR_CLASSES, ALL_DAMAGE_TYPES, DAMAGE_TYPE_LABELS, PHYSICAL_DAMAGE_TYPES,
  PROTECTION_FACTORS, ITEM_DISTRIBUTION,
} from '@/lib/engine/constants';
import { QUALITY_STYLES } from '@/components/armor/ArmorPieceSummary';
import type { ArmorSlot, ProtectionQuality } from '@/types/armor';
import { useT } from '@/i18n/I18nProvider';
import { DamageIcon } from '@/components/icons/StatIcons';

/** Calidad mas cercana a un factor de proteccion promedio. */
function nearestQuality(pf: number): ProtectionQuality {
  let best: ProtectionQuality = 'Normal';
  for (const [q, v] of Object.entries(PROTECTION_FACTORS) as [ProtectionQuality, number][]) {
    if (Math.abs(v - pf) < Math.abs(PROTECTION_FACTORS[best] - pf)) best = q;
  }
  return best;
}

/** Panel fijo al costado con lo que protege la armadura y cuanto dano deja pasar. */
export function ArmorStatusPanel() {
  const t = useT();
  const { character } = useCharacter();
  const { armorSet: storedArmorSet } = useArmor();
  // Con los bonus de resistencia de las piezas sumados, igual que en la simulacion
  const armorSet = useMemo(() => buildEffectiveArmorSet(filterArmorForSubclase(storedArmorSet, character.subclase)), [storedArmorSet, character.subclase]);
  const armorClass = ARMOR_CLASSES[character.subclase];
  const protection = useMemo(() => calcTotalProtection(armorSet, armorClass), [armorSet, armorClass]);
  const avgPF = useMemo(() => calcAverageProtectionFactors(armorSet), [armorSet]);
  // Golpe de ejemplo para ver cuanto pasa; se puede tomar el promedio del arma del Build
  const [refHit, setRefHit] = useLocalStorage<number>('regnum-armor-ref-hit', 400);
  const { hasWeapon, mainCalc } = useBuildDamage();
  const weaponAvg = hasWeapon && mainCalc ? Math.round(mainCalc.danoPromedio) : 0;

  const equipped = (Object.entries(armorSet.pieces) as [ArmorSlot, (typeof armorSet.pieces)[ArmorSlot]][])
    .filter(([, p]) => p && p.pba > 0);
  // El escudo protege aparte: la cobertura es la del cuerpo
  const coverage = Math.min(100, Math.round(
    equipped.filter(([slot]) => slot !== 'escudo').reduce((sum, [slot]) => sum + (ITEM_DISTRIBUTION[slot] ?? 0), 0) * 100,
  ));

  if (equipped.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-700 bg-zinc-900/60 p-4 text-center">
        <p className="text-[12px] uppercase tracking-wider text-zinc-500 mb-1">{t("Estado de armadura")}</p>
        <p className="text-sm text-zinc-400">{t("Cargá un set o una pieza y acá vas a ver cuánto te protege.")}</p>
      </div>
    );
  }

  const maxProt = Math.max(...Object.values(protection.perType), 1);
  const avg = (types: readonly string[]) => Math.round(types.reduce((s, t) => s + (protection.perType[t] || 0), 0) / types.length);
  const magicalTypes = ALL_DAMAGE_TYPES.filter((dt) => !PHYSICAL_DAMAGE_TYPES.includes(dt));

  return (
    <div className="rounded-lg border border-sky-800/50 bg-zinc-900 shadow-lg shadow-black/30 overflow-hidden">
      <div className="px-4 pt-3 pb-3 bg-gradient-to-b from-sky-500/10 to-transparent">
        <p className="text-[12px] uppercase tracking-wider text-sky-400/80 font-semibold">{t("Estado de armadura")}</p>
        <p className="text-xs text-zinc-400">
          {t('{n} piezas · CA {ca} · cubre {pct}%', { n: equipped.length, ca: armorClass, pct: coverage })}
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="rounded-md bg-orange-500/10 border border-orange-600/30 px-2.5 py-1.5">
            <p className="text-[12px] text-orange-400/80">{t("Prot. física media")}</p>
            <p className="text-xl font-bold text-orange-400 tabular-nums">{avg(PHYSICAL_DAMAGE_TYPES)}</p>
          </div>
          <div className="rounded-md bg-blue-500/10 border border-blue-600/30 px-2.5 py-1.5">
            <p className="text-[12px] text-blue-400/80">{t("Prot. mágica media")}</p>
            <p className="text-xl font-bold text-blue-400 tabular-nums">{avg(magicalTypes)}</p>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="mb-2 rounded-md bg-zinc-800/50 px-2.5 py-2">
          <label className="flex items-center justify-between gap-2 text-xs text-zinc-400">
            <span>{t("Golpe de ejemplo")}</span>
            <input
              type="number"
              min={1}
              value={refHit || ''}
              onChange={(e) => setRefHit(Math.max(0, Number(e.target.value)))}
              className="w-20 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-right text-sm text-zinc-100 tabular-nums focus:outline-none focus:border-amber-500"
            />
          </label>
          {weaponAvg > 0 && weaponAvg !== refHit && (
            <button
              onClick={() => setRefHit(weaponAvg)}
              className="mt-1 text-[12px] text-amber-400 hover:text-amber-300 transition-colors"
              title={t("Usa el daño promedio de tu arma del paso 2")}
            >
              {t('Usar el promedio de mi arma ({n})', { n: weaponAvg })}
            </button>
          )}
        </div>

        <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 text-[12px] text-zinc-500 pb-1 border-b border-zinc-800">
          <span>{t("Tipo")}</span>
          <span className="text-right whitespace-nowrap" title={t("Golpes de hasta este daño te hacen solo el mínimo (4-8%)")}>{t("mín. hasta")}</span>
          <span className="text-right w-16 whitespace-nowrap" title={t('Cuánto pasa de un golpe de {golpe} de ese tipo', { golpe: refHit })}>{t("te pasa")}</span>
        </div>
        {ALL_DAMAGE_TYPES.map((dt) => {
          const prot = protection.perType[dt] || 0;
          const isPhysical = PHYSICAL_DAMAGE_TYPES.includes(dt);
          const quality = nearestQuality(avgPF[dt] || 0);
          const res = totalResistancePct(armorSet, dt);
          const threshold = minimumOnlyThreshold(dt, protection, armorSet);
          const passes = refHit > 0 ? pureHitPassThrough(refHit, dt, protection, armorSet) : 0;
          const passPct = refHit > 0 ? Math.round((passes / refHit) * 100) : 0;
          return (
            <div key={dt} className="py-1.5 border-b border-zinc-800/60 last:border-0">
              <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 items-baseline text-sm">
                <span className="flex items-baseline gap-1.5 min-w-0">
                  <span className="text-zinc-300 truncate"><DamageIcon type={dt} /> {t(DAMAGE_TYPE_LABELS[dt])}</span>
                  <span className={`font-bold tabular-nums ${isPhysical ? 'text-orange-400' : 'text-blue-400'}`} title={t("Protección total contra este tipo")}>{Math.round(prot)}</span>
                </span>
                <span className="text-right tabular-nums text-zinc-400">{Number.isFinite(threshold) ? threshold : '∞'}</span>
                <span className="text-right tabular-nums text-zinc-200 w-16">
                  {passes}
                  <span className={`ml-1 text-[12px] ${passPct <= 8 ? 'text-emerald-400' : passPct >= 50 ? 'text-red-400' : 'text-zinc-500'}`}>{passPct}%</span>
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-1.5 flex-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${isPhysical ? 'bg-orange-600' : 'bg-blue-600'}`} style={{ width: `${(prot / maxProt) * 100}%` }} />
                </div>
                {/* La calidad (PF) solo pesa en el dano especial de gemas: se muestra si no es Normal */}
                {quality !== 'Normal' && (
                  <span className={`shrink-0 rounded border px-1 text-[11px] ${QUALITY_STYLES[quality]}`} title={t('Calidad promedio de las piezas: {calidad} (PF {pf}). Reduce el daño especial de gemas y muescas.', { calidad: t(quality), pf: (avgPF[dt] || 0).toFixed(2) })}>
                    {quality}
                  </span>
                )}
                {res > 0 && <span className="shrink-0 text-[11px] text-cyan-400" title={t("Resistencia total (general + por tipo + mejoras)")}>res {Math.round(res * 10) / 10}%</span>}
              </div>
            </div>
          );
        })}
        <p className="mt-2 text-[12px] text-zinc-600">
          <span className="text-zinc-500">{t("mín. hasta:")}</span> {t('golpes de ese tipo hasta ese daño te hacen solo el mínimo (4-8%).')}{' '}
          <span className="text-zinc-500">{t('te pasa:')}</span> {t('cuánto te llega del golpe de ejemplo ({golpe}) de ese tipo, sin barrera ni reducción melee/rango.', { golpe: refHit })}
        </p>
      </div>
    </div>
  );
}
