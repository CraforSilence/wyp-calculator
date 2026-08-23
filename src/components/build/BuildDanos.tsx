'use client';

import { useMemo } from 'react';
import { useCharacter } from '@/hooks/useCharacter';
import { useJewelry } from '@/hooks/useJewelry';
import { useBuildWeapon } from '@/hooks/useBuildWeapon';
import { calcWeaponDamage } from '@/lib/engine/damage';
import { DAMAGE_TYPE_LABELS } from '@/lib/engine/constants';
import { Card } from '@/components/ui/Card';
import type { DamageTypeName } from '@/types/weapon';

export function BuildDanos() {
  const { character } = useCharacter();
  const { jewelry } = useJewelry();
  const { weapon, hasWeapon } = useBuildWeapon();

  const calc = useMemo(() => {
    if (!hasWeapon) return null;
    return calcWeaponDamage(weapon, character, jewelry);
  }, [weapon, character, jewelry, hasWeapon]);

  if (!hasWeapon) {
    return (
      <p className="text-sm text-zinc-500">
        Configura un arma en la seccion &quot;Arma&quot; para ver el desglose de danos.
      </p>
    );
  }

  if (!calc) return null;

  return (
    <div className="space-y-4">
      {/* Header con nombre */}
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-semibold text-zinc-200">{calc.nombre || 'Arma del Build'}</h4>
        <span className="text-xs text-zinc-500">{weapon.subcategoria} &middot; {weapon.velocidad}</span>
      </div>

      {/* Stats principales */}
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

      {/* Desglose por tipo de dano */}
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

      {/* Habilidades especiales */}
      {(calc.riposteDmg || calc.impactoVigoroso) && (
        <Card title="Habilidades Especiales">
          <div className="flex flex-wrap gap-6">
            {calc.riposteDmg && (
              <div>
                <div className="text-xs text-zinc-500 mb-1">Riposte</div>
                <div className="text-lg font-bold text-red-400">{calc.riposteDmg}</div>
                <div className="text-xs text-zinc-600">prom x2.7 + 75</div>
              </div>
            )}
            {calc.impactoVigoroso && (
              <div>
                <div className="text-xs text-zinc-500 mb-1">Impacto Vigoroso</div>
                <div className="text-lg font-bold text-orange-400">
                  {calc.impactoVigoroso.min} - {calc.impactoVigoroso.max}
                </div>
                <div className="text-xs text-zinc-600">prom: {calc.impactoVigoroso.prom}</div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Detalle de velocidad y crit */}
      <Card title="Detalle de Combate">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-xs text-zinc-500 block">Vel. Base</span>
            <span className="text-zinc-200">{calc.velBase}s</span>
          </div>
          <div>
            <span className="text-xs text-zinc-500 block">Bonus Vel. Ataque</span>
            <span className="text-zinc-200">{calc.attackSpeedPct}%</span>
          </div>
          <div>
            <span className="text-xs text-zinc-500 block">Vel. Efectiva</span>
            <span className="text-zinc-200">{calc.velEfectiva}s</span>
          </div>
          <div>
            <span className="text-xs text-zinc-500 block">Golpes/seg</span>
            <span className="text-zinc-200">{calc.golpesPorSeg}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
