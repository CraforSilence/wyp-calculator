'use client';

import { useMemo } from 'react';
import { useCharacter } from '@/hooks/useCharacter';
import { useJewelry } from '@/hooks/useJewelry';
import { useBuildWeapon } from '@/hooks/useBuildWeapon';
import { calcWeaponDamage, calcDualDamage } from '@/lib/engine/damage';
import { DAMAGE_TYPE_LABELS } from '@/lib/engine/constants';
import { Card } from '@/components/ui/Card';
import type { DamageTypeName, WeaponCalcResult } from '@/types/weapon';

function DamageStatsGrid({ calc, label }: { calc: WeaponCalcResult; label?: string }) {
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
            <div className="text-xs text-zinc-500 mb-1">Dano</div>
            <div className="text-lg font-bold text-zinc-100">{calc.danoMin} - {calc.danoMax}</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-xs text-zinc-500 mb-1">Promedio</div>
            <div className="text-lg font-bold text-zinc-100">{calc.danoPromedio}</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-xs text-zinc-500 mb-1">DPS Efectivo</div>
            <div className="text-lg font-bold text-amber-400">{calc.dpsEfectivo}</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-xs text-zinc-500 mb-1">Critico</div>
            <div className="text-lg font-bold text-zinc-100">{calc.critTotalPct}%</div>
            <div className="text-xs text-zinc-500">x{calc.critMult}</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-xs text-zinc-500 mb-1">Velocidad</div>
            <div className="text-lg font-bold text-zinc-100">{calc.velEfectiva}s</div>
            <div className="text-xs text-zinc-500">{calc.golpesPorSeg} g/s</div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function DamageBreakdown({ calc }: { calc: WeaponCalcResult }) {
  return (
    <Card title="Desglose por Tipo de Dano">
      <div className="space-y-2">
        {Object.entries(calc.desglose).map(([tipo, [min, max]]) => {
          const prom = (min + max) / 2;
          const maxDmg = Math.max(...Object.values(calc.desglose).map(([, m]) => m), 1);
          const pct = (max / maxDmg) * 100;
          const label = DAMAGE_TYPE_LABELS[tipo as DamageTypeName] || tipo;
          const isPhysical = ['punzante', 'aplastante', 'cortante'].includes(tipo);

          return (
            <div key={tipo}>
              <div className="flex items-center justify-between text-sm mb-0.5">
                <span className="text-zinc-300">{label}</span>
                <span className="text-zinc-400">
                  {min} - {max}
                  <span className="text-zinc-600 ml-2">(prom: {Math.round(prom)})</span>
                </span>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${isPhysical ? 'bg-orange-500' : 'bg-blue-500'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export function BuildDanos() {
  const { character } = useCharacter();
  const { jewelry } = useJewelry();
  const { weapon, hasWeapon, weaponMode, secondaryWeapon, hasSecondaryWeapon, arrows, hasArrows } = useBuildWeapon();

  const isBarbaro = character.subclase === 'Bárbaro';
  const isArquero = character.clase === 'Arquero';
  const isDualMode = isBarbaro && weaponMode === 'duales';

  const calc = useMemo(() => {
    if (!hasWeapon) return null;
    const arrowsToUse = isArquero && hasArrows ? arrows : null;
    return calcWeaponDamage(weapon, character, jewelry, arrowsToUse);
  }, [weapon, character, jewelry, hasWeapon, isArquero, hasArrows, arrows]);

  const dualCalc = useMemo(() => {
    if (!isDualMode || !hasWeapon || !hasSecondaryWeapon) return null;
    return calcDualDamage(weapon, secondaryWeapon, character, jewelry);
  }, [isDualMode, weapon, secondaryWeapon, character, jewelry, hasWeapon, hasSecondaryWeapon]);

  const secondaryCalc = useMemo(() => {
    if (!isDualMode || !hasSecondaryWeapon) return null;
    return calcWeaponDamage(secondaryWeapon, character, jewelry);
  }, [isDualMode, secondaryWeapon, character, jewelry, hasSecondaryWeapon]);

  if (!hasWeapon) {
    return (
      <p className="text-sm text-zinc-500">
        Configura un arma en la seccion &quot;Arma&quot; para ver el desglose de danos.
      </p>
    );
  }

  if (!calc) return null;

  // Determine which result to show as primary
  const mainCalc = isDualMode && dualCalc ? dualCalc : calc;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-semibold text-zinc-200">
          {isDualMode && dualCalc ? 'Duales (Combinado)' : calc.nombre || 'Arma del Build'}
        </h4>
        <span className="text-xs text-zinc-500">
          {isDualMode ? 'Duales' : weapon.subcategoria} &middot; {isDualMode ? `vel. ${mainCalc.velEfectiva}s` : weapon.velocidad}
        </span>
        {isArquero && hasArrows && (
          <span className="text-xs text-green-500">+ Flechas</span>
        )}
      </div>

      {/* Main stats - combined for dual, or single weapon */}
      <DamageStatsGrid calc={mainCalc} />

      {/* Individual weapon stats for dual mode */}
      {isDualMode && calc && secondaryCalc && (
        <div className="space-y-3">
          <div className="border-t border-zinc-800 pt-3">
            <p className="text-xs text-zinc-500 mb-2">Desglose individual (referencia)</p>
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

      {/* Damage breakdown */}
      <DamageBreakdown calc={mainCalc} />

      {/* Habilidades especiales */}
      {(mainCalc.riposteDmg || mainCalc.impactoVigoroso) && (
        <Card title="Habilidades Especiales">
          <div className="flex flex-wrap gap-6">
            {mainCalc.riposteDmg && (
              <div>
                <div className="text-xs text-zinc-500 mb-1">Riposte</div>
                <div className="text-lg font-bold text-red-400">{mainCalc.riposteDmg}</div>
                <div className="text-xs text-zinc-600">prom x2.7 + 75</div>
              </div>
            )}
            {mainCalc.impactoVigoroso && (
              <div>
                <div className="text-xs text-zinc-500 mb-1">Impacto Vigoroso</div>
                <div className="text-lg font-bold text-orange-400">
                  {mainCalc.impactoVigoroso.min} - {mainCalc.impactoVigoroso.max}
                </div>
                <div className="text-xs text-zinc-600">prom: {mainCalc.impactoVigoroso.prom}</div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Detalle de combate */}
      <Card title="Detalle de Combate">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-xs text-zinc-500 block">Vel. Base</span>
            <span className="text-zinc-200">{mainCalc.velBase}s</span>
          </div>
          <div>
            <span className="text-xs text-zinc-500 block">Bonus Vel. Ataque</span>
            <span className="text-zinc-200">{mainCalc.attackSpeedPct}%</span>
          </div>
          <div>
            <span className="text-xs text-zinc-500 block">Vel. Efectiva</span>
            <span className="text-zinc-200">{mainCalc.velEfectiva}s</span>
          </div>
          <div>
            <span className="text-xs text-zinc-500 block">Golpes/seg</span>
            <span className="text-zinc-200">{mainCalc.golpesPorSeg}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
