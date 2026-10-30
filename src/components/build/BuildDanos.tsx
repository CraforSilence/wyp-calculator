'use client';

import { useBuildDamage } from '@/hooks/useBuildDamage';
import { DAMAGE_TYPE_LABELS, PHYSICAL_DAMAGE_TYPES, MAGICAL_DAMAGE_TYPES } from '@/lib/engine/constants';
import { Card } from '@/components/ui/Card';
import type { DamageTypeName, WeaponCalcResult } from '@/types/weapon';
import { useT } from '@/i18n/I18nProvider';
import { DamageIcon } from '@/components/icons/StatIcons';
import { WeaponIcon } from '@/components/icons/WeaponIcon';
import { AbilityTable } from '@/components/weapons/AbilityTable';

function DamageStatsGrid({ calc, label }: { calc: WeaponCalcResult; label?: string }) {
  const t = useT();
  return (
    <div className="space-y-4">
      {label && (
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-zinc-200">{label}</h4>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card>
          <div className="text-center">
            <div className="text-xs text-zinc-500 mb-1">{t('Daño')}</div>
            <div className="text-lg font-bold text-zinc-100">{calc.danoMin} - {calc.danoMax}</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-xs text-zinc-500 mb-1">{t("Promedio")}</div>
            <div className="text-lg font-bold text-zinc-100">{calc.danoPromedio}</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-xs text-zinc-500 mb-1">{t("DPS Efectivo")}</div>
            <div className="text-lg font-bold text-amber-400">{calc.dpsEfectivo}</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-xs text-zinc-500 mb-1">{t('Crítico')}</div>
            <div className="text-lg font-bold text-zinc-100">{calc.critTotalPct}%</div>
            <div className="text-xs text-zinc-500">x{calc.critMult}</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-xs text-zinc-500 mb-1">{t("Velocidad")}</div>
            <div className="text-lg font-bold text-zinc-100">{calc.velEfectiva}s</div>
            <div className="text-xs text-zinc-500">{calc.golpesPorSeg} g/s</div>
          </div>
        </Card>
      </div>
    </div>
  );
}

/** Dano por tipo con barras, totales fisico/elemental y la parte especial (solo reducida por PF). */
function DamageByType({ calc }: { calc: WeaponCalcResult }) {
  const t = useT();
  const entries = Object.entries(calc.desglose) as [DamageTypeName, [number, number]][];
  const maxDmg = Math.max(...entries.map(([, [, m]]) => m), 1);
  const isPhysical = (t: DamageTypeName) => PHYSICAL_DAMAGE_TYPES.includes(t);

  const sumRange = (types: DamageTypeName[]) => types.reduce<[number, number]>(
    ([min, max], t) => [min + (calc.desglose[t]?.[0] ?? 0), max + (calc.desglose[t]?.[1] ?? 0)],
    [0, 0],
  );
  const physicalTypes = PHYSICAL_DAMAGE_TYPES.filter((dt) => calc.desglose[dt]);
  const elementalTypes = MAGICAL_DAMAGE_TYPES.filter((dt) => calc.desglose[dt]);
  const [physMin, physMax] = sumRange(physicalTypes);
  const [elemMin, elemMax] = sumRange(elementalTypes);
  const hasSpecial = Object.keys(calc.specialDamagePerType).length > 0;

  return (
    <Card title={t("Daño por tipo")}>
      {physicalTypes.length > 0 && elementalTypes.length > 0 && (
        <div className="flex flex-wrap gap-x-6 gap-y-1 mb-3 text-sm">
          <span><span className="text-zinc-500">{t("Físico")}</span> <span className="font-bold text-orange-400">{Math.round(physMin)} - {Math.round(physMax)}</span></span>
          <span><span className="text-zinc-500">{t("Elemental")}</span> <span className="font-bold text-blue-400">{Math.round(elemMin)} - {Math.round(elemMax)}</span></span>
        </div>
      )}
      <div className="space-y-2.5">
        {entries.map(([tipo, [min, max]]) => {
          const special = calc.specialDamagePerType[tipo];
          return (
            <div key={tipo}>
              <div className="flex items-center justify-between gap-2 text-sm mb-0.5">
                <span className="text-zinc-300">
                  <DamageIcon type={tipo} /> {t(DAMAGE_TYPE_LABELS[tipo] || tipo)}
                  {special != null && (
                    <span
                      className="ml-2 text-[12px] text-purple-400"
                      title={t("Daño especial de gemas y joyería: solo lo reduce el factor de protección (PF), no la armadura")}
                    >
                      +{special} especial · solo PF
                    </span>
                  )}
                </span>
                <span className="text-zinc-400 whitespace-nowrap">
                  {min} - {max}
                  <span className="text-zinc-600 ml-2">prom {Math.round((min + max) / 2)}</span>
                </span>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${isPhysical(tipo) ? 'bg-orange-500' : 'bg-blue-500'}`}
                  style={{ width: `${(max / maxDmg) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      {hasSpecial && (
        <p className="mt-3 text-[12px] text-zinc-500">
          <span className="text-purple-400">{t("Especial")}</span>: {t('daño de gemas y joyería que solo se reduce por el factor de protección (PF).')}
        </p>
      )}
    </Card>
  );
}

/** Una cifra chica con su etiqueta, para la fila de habilidades y velocidad. */
function MiniStat({ label, value, sub, className = 'text-zinc-200' }: { label: string; value: React.ReactNode; sub?: string; className?: string }) {
  return (
    <div>
      <span className="text-xs text-zinc-500 block">{label}</span>
      <span className={`font-semibold ${className}`}>{value}</span>
      {sub && <span className="text-[12px] text-zinc-600 block">{sub}</span>}
    </div>
  );
}

export function BuildDanos() {
  const t = useT();
  const { weapon, secondaryWeapon, hasWeapon, hasArrows, isArquero, isDualMode, calc, dualCalc, secondaryCalc, mainCalc, character } = useBuildDamage();

  if (!hasWeapon) {
    return (
      <p className="text-sm text-zinc-500">
        Configura un arma en la seccion &quot;Arma&quot; para ver el desglose de danos.
      </p>
    );
  }

  if (!calc || !mainCalc) return null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-semibold text-zinc-200">
          {isDualMode && dualCalc ? t("Duales (Combinado)") : calc.nombre || t('Arma del Build')}
        </h4>
        <span className="text-xs text-zinc-500">
          {!isDualMode && <WeaponIcon subcategoria={weapon.subcategoria} />} {isDualMode ? t("Duales") : t(weapon.subcategoria)} &middot; {isDualMode ? `${t("vel.")} ${mainCalc.velEfectiva}s` : t(weapon.velocidad)}
        </span>
        {isArquero && hasArrows && (
          <span className="text-xs text-green-500">{t("+ Flechas")}</span>
        )}
      </div>

      {/* Main stats - combined for dual, or single weapon. En pantallas grandes ya estan en el panel fijo. */}
      <div className="lg:hidden">
        <DamageStatsGrid calc={mainCalc} />
      </div>

      {/* Individual weapon stats for dual mode */}
      {isDualMode && calc && secondaryCalc && (
        <div className="space-y-3">
          <div className="border-t border-zinc-800 pt-3">
            <p className="text-xs text-zinc-500 mb-2">{t("Desglose individual (referencia)")}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Card>
                <div className="text-center">
                  <div className="text-xs text-zinc-500 mb-1">Principal: {weapon.nombre || 'Arma 1'}</div>
                  <div className="text-sm font-bold text-zinc-200">{calc.danoMin} - {calc.danoMax}</div>
                  <div className="text-xs text-zinc-500">prom: {calc.danoPromedio}</div>
                </div>
              </Card>
              <Card>
                <div className="text-center">
                  <div className="text-xs text-zinc-500 mb-1">Secundaria: {secondaryWeapon.nombre || 'Arma 2'}</div>
                  <div className="text-sm font-bold text-zinc-200">{secondaryCalc.danoMin} - {secondaryCalc.danoMax}</div>
                  <div className="text-xs text-zinc-500">prom: {secondaryCalc.danoPromedio}</div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      <DamageByType calc={mainCalc} />

      <Card title={t("Habilidades con esta arma")}>
        <AbilityTable weapon={weapon} calc={mainCalc} subclase={character.subclase} />
      </Card>

      {/* Velocidad */}
      <Card title={t("Velocidad")}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <MiniStat label={t("Vel. base")} value={`${mainCalc.velBase}s`} />
          <MiniStat label={t("Bonus vel. ataque")} value={`${mainCalc.attackSpeedPct}%`} />
          <MiniStat label={t("Bonus vel. invocación")} value={`${mainCalc.castSpeedPct}%`} />
          <MiniStat label={t("Vel. efectiva")} value={`${mainCalc.velEfectiva}s`} sub={t('{n} golpes/seg', { n: mainCalc.golpesPorSeg })} />
        </div>
      </Card>
    </div>
  );
}
