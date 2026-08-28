'use client';

import { useState, useMemo } from 'react';
import { useCharacter } from '@/hooks/useCharacter';
import { useWeapons } from '@/hooks/useWeapons';
import { useJewelry } from '@/hooks/useJewelry';
import { calcWeaponDamage } from '@/lib/engine/damage';
import { PageHeader } from '@/components/layout/PageHeader';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Badge, rarezaToBadgeVariant } from '@/components/ui/Badge';
import { SUBCATEGORIAS_POR_CLASE, DAMAGE_TYPE_LABELS } from '@/lib/engine/constants';
import type { WeaponCalcResult, DamageTypeName } from '@/types/weapon';
import type { Clase } from '@/types/character';

export default function RankingsPage() {
  const { character } = useCharacter();
  const { weapons } = useWeapons();
  const { jewelry } = useJewelry();
  const [filterClase, setFilterClase] = useState<string>('Todas');
  const [filterSubcat, setFilterSubcat] = useState<string>('Todas');
  const [selectedDetail, setSelectedDetail] = useState<{ weapon: (typeof weapons)[0]; result: WeaponCalcResult } | null>(null);

  const results = useMemo(() => {
    return weapons
      .filter((w) => {
        if (filterClase !== 'Todas' && w.clase !== filterClase) return false;
        if (filterSubcat !== 'Todas' && w.subcategoria !== filterSubcat) return false;
        return true;
      })
      .map((w) => ({ weapon: w, result: calcWeaponDamage(w, character, jewelry) }))
      .sort((a, b) => b.result.dpsEfectivo - a.result.dpsEfectivo);
  }, [weapons, character, jewelry, filterClase, filterSubcat]);

  const subcatOptions = filterClase !== 'Todas'
    ? SUBCATEGORIAS_POR_CLASE[filterClase as Clase] || []
    : [];

  return (
    <div>
      <PageHeader title="Rankings" description="Ranking de armas por DPS efectivo" />

      <div className="flex gap-3 mb-4">
        <Select
          label="Clase"
          value={filterClase}
          onChange={(e) => { setFilterClase(e.target.value); setFilterSubcat('Todas'); }}
          options={[{ value: 'Todas', label: 'Todas' }, { value: 'Guerrero', label: 'Guerrero' }, { value: 'Arquero', label: 'Arquero' }, { value: 'Mago', label: 'Mago' }]}
        />
        {subcatOptions.length > 0 && (
          <Select
            label="Subcategoria"
            value={filterSubcat}
            onChange={(e) => setFilterSubcat(e.target.value)}
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
                  <span className="text-sm font-medium text-zinc-200 truncate">{result.nombre}</span>
                </div>
                <Badge variant={rarezaToBadgeVariant(weapon.rareza)} className="mt-1">{weapon.rareza}</Badge>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs text-zinc-500">DPS</div>
                <div className="text-base font-bold text-amber-400">{result.dpsEfectivo}</div>
              </div>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-center">
              <div>
                <div className="text-zinc-500">Dano</div>
                <div className="text-zinc-300">{result.danoMin}-{result.danoMax}</div>
              </div>
              <div>
                <div className="text-zinc-500">Crit</div>
                <div className="text-zinc-300">{result.critTotalPct}%</div>
              </div>
              <div>
                <div className="text-zinc-500">Vel</div>
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
              <th className="py-2 px-2">Nombre</th>
              <th className="py-2 px-2 text-right">Dano</th>
              <th className="py-2 px-2 text-right">Prom</th>
              <th className="py-2 px-2 text-right">Crit%</th>
              <th className="py-2 px-2 text-right">s/g</th>
              <th className="py-2 px-2 text-right">g/s</th>
              <th className="py-2 px-2 text-right font-bold text-amber-500">DPS</th>
              <th className="py-2 px-2 text-right">Riposte</th>
              <th className="py-2 px-2 text-right">Impacto</th>
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
                    <span className="text-zinc-200">{result.nombre}</span>
                    <Badge variant={rarezaToBadgeVariant(weapon.rareza)} className="hidden sm:inline-flex">{weapon.rareza}</Badge>
                  </div>
                </td>
                <td className="py-2 px-2 text-right text-zinc-300">{result.danoMin}-{result.danoMax}</td>
                <td className="py-2 px-2 text-right text-zinc-300">{result.danoPromedio}</td>
                <td className="py-2 px-2 text-right text-zinc-300">{result.critTotalPct}%</td>
                <td className="py-2 px-2 text-right text-zinc-400">{result.velEfectiva}</td>
                <td className="py-2 px-2 text-right text-zinc-400">{result.golpesPorSeg}</td>
                <td className="py-2 px-2 text-right font-bold text-amber-400">{result.dpsEfectivo}</td>
                <td className="py-2 px-2 text-right text-red-400">{result.riposteDmg ?? '-'}</td>
                <td className="py-2 px-2 text-right text-orange-400">
                  {result.impactoVigoroso ? `${result.impactoVigoroso.min}-${result.impactoVigoroso.max}` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {results.length === 0 && (
        <div className="text-center py-12 text-zinc-500">No hay armas que coincidan con el filtro.</div>
      )}

      <Modal
        open={!!selectedDetail}
        onClose={() => setSelectedDetail(null)}
        title={selectedDetail?.result.nombre || ''}
      >
        {selectedDetail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-zinc-500">Clase:</span> {selectedDetail.weapon.clase}</div>
              <div><span className="text-zinc-500">Subcategoria:</span> {selectedDetail.weapon.subcategoria}</div>
              <div><span className="text-zinc-500">Velocidad:</span> {selectedDetail.weapon.velocidad}</div>
              <div><span className="text-zinc-500">Rareza:</span> {selectedDetail.weapon.rareza}</div>
              <div><span className="text-zinc-500">Bonus Stat:</span> +{selectedDetail.weapon.bonusStat}</div>
              <div><span className="text-zinc-500">Bonus Atributo:</span> +{selectedDetail.weapon.bonusAtributo}</div>
            </div>

            <div>
              <h4 className="text-xs font-medium text-zinc-400 mb-2">Calculo</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-zinc-500">Dano:</span> <span className="text-zinc-200">{selectedDetail.result.danoMin}-{selectedDetail.result.danoMax}</span></div>
                <div><span className="text-zinc-500">Promedio:</span> <span className="text-zinc-200">{selectedDetail.result.danoPromedio}</span></div>
                <div><span className="text-zinc-500">DPS:</span> <span className="text-amber-400 font-bold">{selectedDetail.result.dpsEfectivo}</span></div>
                <div><span className="text-zinc-500">Crit:</span> <span className="text-zinc-200">{selectedDetail.result.critTotalPct}% (x{selectedDetail.result.critMult})</span></div>
                <div><span className="text-zinc-500">Velocidad:</span> <span className="text-zinc-200">{selectedDetail.result.velEfectiva}s ({selectedDetail.result.golpesPorSeg} g/s)</span></div>
                {selectedDetail.result.riposteDmg && <div><span className="text-zinc-500">Riposte:</span> <span className="text-red-400 font-bold">{selectedDetail.result.riposteDmg}</span></div>}
                {selectedDetail.result.impactoVigoroso && <div><span className="text-zinc-500">Impacto:</span> <span className="text-orange-400 font-bold">{selectedDetail.result.impactoVigoroso.min}-{selectedDetail.result.impactoVigoroso.max}</span></div>}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-medium text-zinc-400 mb-2">Desglose por tipo</h4>
              <div className="space-y-1">
                {Object.entries(selectedDetail.result.desglose).map(([tipo, [min, max]]) => (
                  <div key={tipo} className="flex justify-between text-sm">
                    <span className="text-zinc-400">{DAMAGE_TYPE_LABELS[tipo as DamageTypeName] || tipo}</span>
                    <span className="text-zinc-200">{min} - {max}</span>
                  </div>
                ))}
              </div>
            </div>

            {selectedDetail.weapon.notas && (
              <div>
                <h4 className="text-xs font-medium text-zinc-400 mb-1">Notas</h4>
                <p className="text-sm text-zinc-300">{selectedDetail.weapon.notas}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
