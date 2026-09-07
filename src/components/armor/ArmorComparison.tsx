'use client';

import { useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { DAMAGE_TYPE_LABELS, ALL_DAMAGE_TYPES, ARMOR_BONUS_LABELS } from '@/lib/engine/constants';
import { calcTotalProtection } from '@/lib/engine/armor';
import type { CatalogArmorSet, ArmorBonus } from '@/types/armor';

interface ArmorComparisonProps {
  sets: CatalogArmorSet[];
  armorClass: number;
}

export function ArmorComparison({ sets, armorClass }: ArmorComparisonProps) {
  const results = useMemo(() => {
    return sets.map((set) => {
      const fakeArmorSet = {
        pieces: set.pieces,
        bonusArmaduraPct: 0,
        generalResistance: { fisico: 0, magico: 0 } as Record<string, number>,
        typeResistance: {},
        barrierPoints: {},
        meleeDmgReductionPct: 0,
        rangedDmgReductionPct: 0,
      };
      const prot = calcTotalProtection(fakeArmorSet, armorClass);
      const totalProt = Object.values(prot.perType).reduce((a, b) => a + b, 0);
      return { set, prot, totalProt };
    });
  }, [sets, armorClass]);

  const maxTotal = Math.max(...results.map((r) => r.totalProt), 1);
  const maxPerType = useMemo(() => {
    const m: Record<string, number> = {};
    for (const t of ALL_DAMAGE_TYPES) {
      m[t] = Math.max(...results.map((r) => r.prot.perType[t] || 0), 1);
    }
    return m;
  }, [results]);

  // Collect all unique bonus types across selected sets
  const allBonusTypes = useMemo(() => {
    const types = new Set<string>();
    for (const r of results) {
      for (const b of r.set.bonusConjunto) types.add(b.type);
    }
    return Array.from(types);
  }, [results]);

  const getBonusValue = (bonuses: ArmorBonus[], type: string) => {
    const b = bonuses.find((x) => x.type === type);
    return b ? b.value : 0;
  };

  return (
    <div className="space-y-4">
      {/* Protection comparison table */}
      <Card title="Proteccion por tipo de dano">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-xs text-zinc-500 text-left">
                <th className="py-2 px-2">Set</th>
                {ALL_DAMAGE_TYPES.map((t) => (
                  <th key={t} className="py-2 px-2 text-right">{DAMAGE_TYPE_LABELS[t]}</th>
                ))}
                <th className="py-2 px-2 text-right font-bold text-amber-500">Total</th>
              </tr>
            </thead>
            <tbody>
              {results.map(({ set, prot, totalProt }) => {
                const isBest = totalProt === maxTotal && results.length > 1;
                return (
                  <tr key={set.id} className="border-b border-zinc-800/50">
                    <td className="py-2 px-2 text-zinc-200 max-w-48 truncate">{set.nombre}</td>
                    {ALL_DAMAGE_TYPES.map((t) => {
                      const val = Math.round(prot.perType[t] || 0);
                      const isTypeBest = val === Math.round(maxPerType[t]) && results.length > 1;
                      return (
                        <td key={t} className={`py-2 px-2 text-right tabular-nums ${isTypeBest ? 'text-green-400 font-medium' : 'text-zinc-300'}`}>
                          {val}
                        </td>
                      );
                    })}
                    <td className={`py-2 px-2 text-right tabular-nums font-bold ${isBest ? 'text-green-400' : 'text-amber-400'}`}>
                      {Math.round(totalProt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Bar charts */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card title="Proteccion Total">
          <div className="space-y-2">
            {results
              .sort((a, b) => b.totalProt - a.totalProt)
              .map(({ set, totalProt }) => (
                <div key={set.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-zinc-400 truncate mr-2">{set.nombre}</span>
                    <span className="text-amber-400 font-semibold">{Math.round(totalProt)}</span>
                  </div>
                  <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-600 rounded-full transition-all"
                      style={{ width: `${(totalProt / maxTotal) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </Card>

        {allBonusTypes.length > 0 && (
          <Card title="Bonus de Conjunto">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-xs text-zinc-500 text-left">
                    <th className="py-1 px-2">Set</th>
                    {allBonusTypes.map((t) => (
                      <th key={t} className="py-1 px-2 text-right">{ARMOR_BONUS_LABELS[t as keyof typeof ARMOR_BONUS_LABELS] ?? t}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map(({ set }) => (
                    <tr key={set.id} className="border-b border-zinc-800/50">
                      <td className="py-1 px-2 text-zinc-200 truncate max-w-32">{set.nombre}</td>
                      {allBonusTypes.map((t) => {
                        const val = getBonusValue(set.bonusConjunto, t);
                        return (
                          <td key={t} className={`py-1 px-2 text-right tabular-nums ${val > 0 ? 'text-amber-400' : 'text-zinc-600'}`}>
                            {val > 0 ? `+${val}` : '-'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Per damage type bars */}
      <Card title="Proteccion por tipo">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ALL_DAMAGE_TYPES.map((t) => (
            <div key={t}>
              <p className="text-xs text-zinc-500 mb-2">{DAMAGE_TYPE_LABELS[t]}</p>
              <div className="space-y-1.5">
                {results
                  .sort((a, b) => (b.prot.perType[t] || 0) - (a.prot.perType[t] || 0))
                  .map(({ set, prot }) => {
                    const val = Math.round(prot.perType[t] || 0);
                    return (
                      <div key={set.id}>
                        <div className="flex justify-between text-xs mb-0.5">
                          <span className="text-zinc-400 truncate mr-2">{set.nombre}</span>
                          <span className="text-zinc-300 font-medium">{val}</span>
                        </div>
                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-cyan-600 rounded-full transition-all"
                            style={{ width: `${maxPerType[t] > 0 ? (val / maxPerType[t]) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
