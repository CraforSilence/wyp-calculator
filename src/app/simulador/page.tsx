'use client';

import { useState, useMemo } from 'react';
import { useCharacter } from '@/hooks/useCharacter';
import { useWeapons } from '@/hooks/useWeapons';
import { useJewelry } from '@/hooks/useJewelry';
import { useArmor } from '@/hooks/useArmor';
import { simulateHits } from '@/lib/engine/simulation';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import type { SimulationResult } from '@/types/simulation';

export default function SimuladorPage() {
  const { character } = useCharacter();
  const { weapons } = useWeapons();
  const { jewelry } = useJewelry();
  const { armorSet } = useArmor();
  const [selectedWeaponId, setSelectedWeaponId] = useState('');
  const [result, setResult] = useState<SimulationResult | null>(null);

  const weaponOptions = useMemo(() => {
    return weapons.map((w) => ({ value: w.id, label: w.nombre }));
  }, [weapons]);

  const handleSimulate = () => {
    const weapon = weapons.find((w) => w.id === selectedWeaponId);
    if (!weapon) return;
    const sim = simulateHits(weapon, character, jewelry, armorSet, 10);
    setResult(sim);
  };

  const maxDmg = result ? Math.max(...result.hits.map((h) => h.totalRawDamage), 1) : 1;

  return (
    <div>
      <PageHeader
        title="Simulador de Dano"
        description="Selecciona un arma y simula 10 golpes contra tu set de armadura"
      />

      <Card title="Configuracion" className="mb-6">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Select
              label="Arma"
              value={selectedWeaponId}
              onChange={(e) => setSelectedWeaponId(e.target.value)}
              options={[{ value: '', label: 'Seleccionar arma...' }, ...weaponOptions]}
            />
          </div>
          <div className="text-sm text-zinc-400 py-1.5">
            vs {Object.keys(armorSet.pieces).length > 0 ? `${Object.keys(armorSet.pieces).length} piezas de armadura` : 'Sin armadura'}
          </div>
          <Button onClick={handleSimulate} disabled={!selectedWeaponId}>
            Simular
          </Button>
        </div>
      </Card>

      {result && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <Card>
              <div className="text-center">
                <div className="text-xs text-zinc-500">Dano Promedio</div>
                <div className="text-2xl font-bold text-amber-400">{result.averageDamage}</div>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-xs text-zinc-500">Dano Total</div>
                <div className="text-2xl font-bold text-zinc-200">{result.totalDamage}</div>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-xs text-zinc-500">Criticos</div>
                <div className="text-2xl font-bold text-red-400">{result.critsLanded}/10</div>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-xs text-zinc-500">Min / Max</div>
                <div className="text-lg font-bold text-zinc-200">
                  {Math.min(...result.hits.map((h) => h.finalDamage))} / {Math.max(...result.hits.map((h) => h.finalDamage))}
                </div>
              </div>
            </Card>
          </div>

          {/* Hits visual */}
          <Card title="Golpes" className="mb-6">
            <div className="space-y-2">
              {result.hits.map((hit) => {
                const pct = (hit.totalRawDamage / maxDmg) * 100;
                const reducPct = hit.totalRawDamage > 0
                  ? ((hit.totalRawDamage - hit.finalDamage) / hit.totalRawDamage * 100).toFixed(0)
                  : '0';
                return (
                  <div key={hit.hitNumber} className="flex items-center gap-3">
                    <div className="w-6 text-xs text-zinc-500 text-right">{hit.hitNumber}</div>
                    <div className="flex-1">
                      <div className="h-6 bg-zinc-800 rounded-full overflow-hidden relative">
                        {/* Raw damage bar */}
                        <div
                          className="absolute h-full bg-zinc-700 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                        {/* Final damage bar */}
                        <div
                          className={`absolute h-full rounded-full ${hit.isCrit ? 'bg-red-600' : 'bg-amber-600'}`}
                          style={{ width: `${(hit.finalDamage / maxDmg) * 100}%` }}
                        />
                        <div className="absolute inset-0 flex items-center px-2 text-xs font-medium text-white">
                          {hit.finalDamage}
                          {hit.isCrit && <span className="ml-1 text-red-300">CRIT</span>}
                        </div>
                      </div>
                    </div>
                    <div className="w-20 text-right text-xs">
                      <span className="text-zinc-500">raw:</span>{' '}
                      <span className="text-zinc-400">{Math.round(hit.totalRawDamage)}</span>
                    </div>
                    <div className="w-16 text-right text-xs text-zinc-500">
                      -{reducPct}%
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Detailed table */}
          <Card title="Detalle">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-left">
                    <th className="py-1 px-2">#</th>
                    <th className="py-1 px-2 text-right">Raw</th>
                    <th className="py-1 px-2 text-center">Crit</th>
                    <th className="py-1 px-2 text-right">Proteccion</th>
                    <th className="py-1 px-2 text-right">Resistencia</th>
                    <th className="py-1 px-2 text-right">Barrera</th>
                    <th className="py-1 px-2 text-center">Min?</th>
                    <th className="py-1 px-2 text-right font-bold">Final</th>
                  </tr>
                </thead>
                <tbody>
                  {result.hits.map((hit) => (
                    <tr key={hit.hitNumber} className={`border-b border-zinc-800/50 ${hit.isCrit ? 'bg-red-950/20' : ''}`}>
                      <td className="py-1 px-2 text-zinc-500">{hit.hitNumber}</td>
                      <td className="py-1 px-2 text-right text-zinc-300">{Math.round(hit.totalRawDamage)}</td>
                      <td className="py-1 px-2 text-center">{hit.isCrit ? <span className="text-red-400">Si</span> : <span className="text-zinc-600">-</span>}</td>
                      <td className="py-1 px-2 text-right text-orange-400">
                        {Math.round(Object.values(hit.protectionApplied).reduce((s, v) => s + v, 0))}
                      </td>
                      <td className="py-1 px-2 text-right text-blue-400">
                        {Math.round(Object.values(hit.resistanceApplied).reduce((s, v) => s + v, 0))}
                      </td>
                      <td className="py-1 px-2 text-right text-purple-400">
                        {hit.barrierReduction > 0 ? hit.barrierReduction : '-'}
                      </td>
                      <td className="py-1 px-2 text-center">
                        {hit.minimumDamageEnforced ? <span className="text-yellow-400">Si</span> : <span className="text-zinc-600">-</span>}
                      </td>
                      <td className="py-1 px-2 text-right font-bold text-amber-400">{hit.finalDamage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {!result && (
        <div className="text-center py-12 text-zinc-500">
          Selecciona un arma y presiona Simular para ver los resultados.
        </div>
      )}
    </div>
  );
}
