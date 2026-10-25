'use client';

import { useMemo, useRef } from 'react';
import { useCharacter } from '@/hooks/useCharacter';
import { useWeapons } from '@/hooks/useWeapons';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { calcWeaponDamage } from '@/lib/engine/damage';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { WeaponPicker } from '@/components/comparison/WeaponPicker';
import { CompareCard, type BestFlags } from '@/components/comparison/CompareCard';
import { WeaponAbility, weaponAbilityKind, weaponAbilityValue } from '@/components/weapons/WeaponAbility';
import type { WeaponCalcResult } from '@/types/weapon';

const MAX_COMPARE = 5;
const SELECTED_KEY = 'regnum-compare-selected';

export default function CompararPage() {
  const { character } = useCharacter();
  const { weapons } = useWeapons();
  const [storedIds, setSelectedIds] = useLocalStorage<string[]>(SELECTED_KEY, []);
  const searchRef = useRef<HTMLInputElement>(null);

  // Comparacion base: arma vs arma, sin joyeria (igual que en /armas)
  const allResults = useMemo(
    () => weapons.map((w) => ({ weapon: w, result: calcWeaponDamage(w, character, null) })),
    [weapons, character],
  );

  // Respeta el orden en que se agregaron e ignora ids de armas borradas
  const selected = useMemo(
    () => storedIds
      .map((id) => allResults.find((r) => r.weapon.id === id))
      .filter((r): r is (typeof allResults)[number] => Boolean(r))
      .slice(0, MAX_COMPARE),
    [allResults, storedIds],
  );
  const selectedIds = selected.map((s) => s.weapon.id);

  // Los ids de armas ocultas se conservan (vuelven si se desocultan); solo cuentan las visibles para el limite
  const toggleWeapon = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      const visibles = prev.filter((x) => allResults.some((r) => r.weapon.id === x));
      if (visibles.length >= MAX_COMPARE) return prev;
      return [...prev, id];
    });
  };

  const { bestDps, bestProm, flags } = useMemo(() => {
    type Metric = (r: WeaponCalcResult) => number | null;
    const results = selected.map((s) => s.result);
    // La habilidad solo se compara si todas las armas tienen la misma (Riposte vs Riposte, etc.)
    const kinds = new Set(results.map(weaponAbilityKind));
    const abilityComparable = kinds.size === 1 && !kinds.has(null);
    const metrics: Record<keyof BestFlags, Metric> = {
      dps: (r) => r.dpsEfectivo,
      prom: (r) => r.danoPromedio,
      vel: (r) => r.golpesPorSeg,
      crit: (r) => r.critTotalPct,
      ability: (r) => (abilityComparable ? weaponAbilityValue(r) : null),
    };
    const top = {} as Record<keyof BestFlags, number>;
    const allTied = {} as Record<keyof BestFlags, boolean>;
    for (const key of Object.keys(metrics) as (keyof BestFlags)[]) {
      const values = results.map(metrics[key]);
      top[key] = Math.max(...values.map((v) => v ?? -Infinity));
      allTied[key] = values.every((v) => v === top[key]);
    }
    // Solo marcamos "mejor" con al menos 2 armas y si no empatan todas
    const flags = new Map<string, BestFlags>();
    for (const { weapon, result } of selected) {
      const f = {} as BestFlags;
      for (const key of Object.keys(metrics) as (keyof BestFlags)[]) {
        const v = metrics[key](result);
        f[key] = selected.length >= 2 && v !== null && v === top[key] && !allTied[key];
      }
      flags.set(weapon.id, f);
    }
    return { bestDps: top.dps, bestProm: top.prom, flags };
  }, [selected]);

  const byDps = [...selected].sort((a, b) => b.result.dpsEfectivo - a.result.dpsEfectivo);
  const byProm = [...selected].sort((a, b) => b.result.danoPromedio - a.result.danoPromedio);
  const emptySlots = MAX_COMPARE - selected.length;
  const cell = (on: boolean, off = 'text-zinc-300') => (on ? 'text-emerald-400 font-semibold' : off);

  return (
    <div>
      <PageHeader
        title="Comparar"
        description={`Elegi hasta ${MAX_COMPARE} armas para compararlas lado a lado`}
        actions={selected.length > 0 && (
          <Button variant="secondary" size="sm" onClick={() => setSelectedIds([])}>Limpiar</Button>
        )}
      />

      <div className="mb-4 rounded border border-cyan-900/60 bg-cyan-950/30 px-3 py-2 text-xs text-cyan-300/90">
        Comparacion <strong>base</strong>: arma contra arma con los stats de tu personaje, <strong>sin joyeria</strong>.
        La velocidad y el dano solo incluyen lo que aporta el arma (y sus muescas). Para ver el resultado con tu joyeria usa el Build.
      </div>

      <div className="grid lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] gap-4 mb-6 items-start">
        <Card title={<span>Armas <span className="text-zinc-500 font-normal">({selected.length}/{MAX_COMPARE})</span></span>}>
          <WeaponPicker
            ref={searchRef}
            items={allResults}
            selectedIds={selectedIds}
            maxSelected={MAX_COMPARE}
            onToggle={toggleWeapon}
          />
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {selected.map(({ weapon, result }) => (
            <CompareCard
              key={weapon.id}
              weapon={weapon}
              result={result}
              best={flags.get(weapon.id)!}
              onRemove={() => toggleWeapon(weapon.id)}
            />
          ))}
          {emptySlots > 0 && (
            <button
              onClick={() => searchRef.current?.focus()}
              className="min-h-40 rounded-lg border-2 border-dashed border-zinc-800 hover:border-zinc-700 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer flex flex-col items-center justify-center gap-1 text-sm"
            >
              <span className="text-2xl leading-none">+</span>
              <span>Agregar arma</span>
              <span className="text-xs text-zinc-600">
                {selected.length === 0 ? 'Busca y elegi en la lista' : `Quedan ${emptySlots} lugar${emptySlots === 1 ? '' : 'es'}`}
              </span>
            </button>
          )}
        </div>
      </div>

      {selected.length >= 2 && (
        <>
          <Card title="Comparacion" className="mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-xs text-zinc-500 text-left">
                    <th className="py-2 px-2">Nombre</th>
                    <th className="py-2 px-2 text-right">Min</th>
                    <th className="py-2 px-2 text-right">Max</th>
                    <th className="py-2 px-2 text-right">Prom</th>
                    <th className="py-2 px-2 text-right">Crit%</th>
                    <th className="py-2 px-2 text-right">Crit x</th>
                    <th className="py-2 px-2 text-right" title="Segundos por golpe (base del arma ajustada por vel. ataque del arma y muescas)">s/g</th>
                    <th className="py-2 px-2 text-right" title="Golpes por segundo">g/s</th>
                    <th className="py-2 px-2 text-right font-bold text-amber-500">DPS</th>
                    <th className="py-2 px-2 text-right" title="Diferencia de DPS contra la mejor arma">vs mejor</th>
                    <th className="py-2 px-2 text-right">Habilidad</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.map(({ weapon, result }) => {
                    const f = flags.get(weapon.id)!;
                    const diff = bestDps > 0 ? ((result.dpsEfectivo - bestDps) / bestDps) * 100 : 0;
                    return (
                      <tr key={weapon.id} className="border-b border-zinc-800/50">
                        <td className="py-2 px-2 text-zinc-200">{result.nombre}</td>
                        <td className="py-2 px-2 text-right text-zinc-300">{result.danoMin}</td>
                        <td className="py-2 px-2 text-right text-zinc-300">{result.danoMax}</td>
                        <td className={`py-2 px-2 text-right ${cell(f.prom)}`}>{result.danoPromedio}</td>
                        <td className={`py-2 px-2 text-right ${cell(f.crit)}`}>{result.critTotalPct}%</td>
                        <td className="py-2 px-2 text-right text-zinc-400">x{result.critMult}</td>
                        <td className={`py-2 px-2 text-right ${cell(f.vel, 'text-zinc-400')}`}>{result.velEfectiva}</td>
                        <td className={`py-2 px-2 text-right ${cell(f.vel, 'text-zinc-400')}`}>{result.golpesPorSeg}</td>
                        <td className="py-2 px-2 text-right font-bold text-amber-400">{result.dpsEfectivo}</td>
                        <td className={`py-2 px-2 text-right text-xs ${f.dps ? 'text-emerald-400' : 'text-zinc-500'}`}>
                          {f.dps ? 'mejor' : diff === 0 ? 'empate' : `${diff.toFixed(1)}%`}
                        </td>
                        <td className={`py-2 px-2 text-right whitespace-nowrap ${f.ability ? 'font-semibold' : ''}`}>
                          <WeaponAbility result={result} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-zinc-600 mt-2">En verde el mejor valor de cada columna.</p>
          </Card>

          <div className="grid sm:grid-cols-2 gap-4">
            <Card title="DPS Efectivo">
              <div className="space-y-2">
                {byDps.map(({ weapon, result }) => (
                  <div key={weapon.id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-400 truncate mr-2">{weapon.nombre}</span>
                      <span className="text-amber-400 font-semibold">{result.dpsEfectivo}</span>
                    </div>
                    <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-600 rounded-full transition-all"
                        style={{ width: `${bestDps > 0 ? (result.dpsEfectivo / bestDps) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Dano Promedio">
              <div className="space-y-2">
                {byProm.map(({ weapon, result }) => (
                  <div key={weapon.id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-400 truncate mr-2">{weapon.nombre}</span>
                      <span className="text-cyan-400 font-semibold">{result.danoPromedio}</span>
                    </div>
                    <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-600 rounded-full transition-all"
                        style={{ width: `${bestProm > 0 ? (result.danoPromedio / bestProm) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}

      {selected.length === 1 && (
        <div className="text-center py-6 text-zinc-500 text-sm">Agrega al menos una arma mas para ver el cuadro comparativo.</div>
      )}
    </div>
  );
}
