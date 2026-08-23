'use client';

import { useState, useMemo } from 'react';
import { useCharacter } from '@/hooks/useCharacter';
import { useWeapons } from '@/hooks/useWeapons';
import { useJewelry } from '@/hooks/useJewelry';
import { calcWeaponDamage } from '@/lib/engine/damage';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';

export default function CompararPage() {
  const { character } = useCharacter();
  const { weapons } = useWeapons();
  const { jewelry } = useJewelry();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const allResults = useMemo(() => {
    return weapons.map((w) => ({ weapon: w, result: calcWeaponDamage(w, character, jewelry) }));
  }, [weapons, character, jewelry]);

  const selected = useMemo(() => {
    return allResults.filter((r) => selectedIds.includes(r.weapon.id));
  }, [allResults, selectedIds]);

  const toggleWeapon = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const maxDps = selected.length > 0 ? Math.max(...selected.map((s) => s.result.dpsEfectivo)) : 0;
  const maxProm = selected.length > 0 ? Math.max(...selected.map((s) => s.result.danoPromedio)) : 0;

  return (
    <div>
      <PageHeader title="Comparar" description="Selecciona 2 o mas armas para comparar" />

      {/* Weapon selector */}
      <Card title="Seleccionar Armas" className="mb-6">
        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
          {allResults.map(({ weapon }) => (
            <button
              key={weapon.id}
              onClick={() => toggleWeapon(weapon.id)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                selectedIds.includes(weapon.id)
                  ? 'bg-amber-600/20 text-amber-400 border border-amber-600'
                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-600'
              }`}
            >
              {weapon.nombre}
            </button>
          ))}
        </div>
      </Card>

      {selected.length >= 2 && (
        <>
          {/* Comparison table */}
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
                    <th className="py-2 px-2 text-right">s/g</th>
                    <th className="py-2 px-2 text-right">g/s</th>
                    <th className="py-2 px-2 text-right font-bold text-amber-500">DPS</th>
                    <th className="py-2 px-2 text-right">Riposte</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.map(({ weapon, result }) => (
                    <tr key={weapon.id} className="border-b border-zinc-800/50">
                      <td className="py-2 px-2 text-zinc-200">{result.nombre}</td>
                      <td className="py-2 px-2 text-right text-zinc-300">{result.danoMin}</td>
                      <td className="py-2 px-2 text-right text-zinc-300">{result.danoMax}</td>
                      <td className="py-2 px-2 text-right text-zinc-300">{result.danoPromedio}</td>
                      <td className="py-2 px-2 text-right text-zinc-300">{result.critTotalPct}%</td>
                      <td className="py-2 px-2 text-right text-zinc-400">x{result.critMult}</td>
                      <td className="py-2 px-2 text-right text-zinc-400">{result.velEfectiva}</td>
                      <td className="py-2 px-2 text-right text-zinc-400">{result.golpesPorSeg}</td>
                      <td className="py-2 px-2 text-right font-bold text-amber-400">{result.dpsEfectivo}</td>
                      <td className="py-2 px-2 text-right text-red-400">{result.riposteDmg ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Bar charts */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Card title="DPS Efectivo">
              <div className="space-y-2">
                {selected
                  .sort((a, b) => b.result.dpsEfectivo - a.result.dpsEfectivo)
                  .map(({ weapon, result }) => (
                    <div key={weapon.id}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-zinc-400 truncate mr-2">{weapon.nombre}</span>
                        <span className="text-amber-400 font-semibold">{result.dpsEfectivo}</span>
                      </div>
                      <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-600 rounded-full transition-all"
                          style={{ width: `${maxDps > 0 ? (result.dpsEfectivo / maxDps) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </Card>

            <Card title="Dano Promedio">
              <div className="space-y-2">
                {selected
                  .sort((a, b) => b.result.danoPromedio - a.result.danoPromedio)
                  .map(({ weapon, result }) => (
                    <div key={weapon.id}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-zinc-400 truncate mr-2">{weapon.nombre}</span>
                        <span className="text-cyan-400 font-semibold">{result.danoPromedio}</span>
                      </div>
                      <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-600 rounded-full transition-all"
                          style={{ width: `${maxProm > 0 ? (result.danoPromedio / maxProm) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </Card>
          </div>
        </>
      )}

      {selected.length < 2 && selected.length > 0 && (
        <div className="text-center py-8 text-zinc-500">Selecciona al menos una arma mas para comparar.</div>
      )}
    </div>
  );
}
