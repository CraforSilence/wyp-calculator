'use client';

import { Card } from '@/components/ui/Card';
import { HelpTip } from '@/components/ui/HelpTip';
import { DAMAGE_TYPE_LABELS, DAMAGE_TYPE_ICONS } from '@/lib/engine/constants';
import type { SimulationResult } from '@/types/simulation';
import type { DamageTypeName } from '@/types/weapon';

interface SimResultadosProps {
  result: SimulationResult;
}

export function SimResultados({ result }: SimResultadosProps) {
  const maxDmg = Math.max(...result.hits.map((h) => h.totalRawDamage), 1);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 stagger-children">
        <Card className="border-amber-800/40">
          <div className="text-center py-1">
            <div className="text-xs text-zinc-500 uppercase tracking-wide">Dano Promedio<HelpTip text="Promedio de dano final por golpe en esta simulacion." /></div>
            <div className="text-4xl font-bold text-amber-400 mt-1">{result.averageDamage}</div>
          </div>
        </Card>
        <Card>
          <div className="text-center py-1">
            <div className="text-xs text-zinc-500 uppercase tracking-wide">Dano Total<HelpTip text="Suma del dano final de todos los golpes." /></div>
            <div className="text-2xl font-bold text-zinc-200 mt-1">{result.totalDamage}</div>
          </div>
        </Card>
        <Card className="border-red-900/40">
          <div className="text-center py-1">
            <div className="text-xs text-zinc-500 uppercase tracking-wide">Criticos<HelpTip text="Golpes criticos obtenidos del total. Critico = dano x1.5." /></div>
            <div className="text-2xl font-bold text-red-400 mt-1">{result.critsLanded}/{result.hits.length}</div>
          </div>
        </Card>
        <Card>
          <div className="text-center py-1">
            <div className="text-xs text-zinc-500 uppercase tracking-wide">Min / Max<HelpTip text="Dano final minimo y maximo en un solo golpe." /></div>
            <div className="text-lg font-bold text-zinc-200 mt-1">
              {Math.min(...result.hits.map((h) => h.finalDamage))} / {Math.max(...result.hits.map((h) => h.finalDamage))}
            </div>
          </div>
        </Card>
      </div>

      {/* Hits visual */}
      <Card title={<span>Golpes<HelpTip text="Barra gris = dano bruto (antes de defensas). Barra color = dano final. Rojo = critico." /></span>}>
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
                    <div
                      className="absolute h-full bg-zinc-700 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
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

      {/* Reduction summary */}
      {(() => {
        const avgRaw = result.hits.reduce((s, h) => s + h.totalRawDamage, 0) / result.hits.length;
        const avgFinal = result.averageDamage;
        const reductionPct = avgRaw > 0 ? ((avgRaw - avgFinal) / avgRaw * 100).toFixed(1) : '0';
        return (
          <div className="text-center text-sm text-zinc-500 -mt-2">
            Reduccion promedio: <span className="text-orange-400 font-semibold">{reductionPct}%</span>
            {' '}({Math.round(avgRaw)} raw &rarr; {avgFinal} final)
          </div>
        );
      })()}

      {/* Per-type damage breakdown */}
      {(() => {
        // Aggregate average final damage per type across all hits
        const typeTotals: Record<string, number> = {};
        for (const hit of result.hits) {
          for (const [type, val] of Object.entries(hit.finalDamagePerType)) {
            typeTotals[type] = (typeTotals[type] || 0) + val;
          }
        }
        const numHits = result.hits.length;
        const types = Object.keys(typeTotals).filter((t) => typeTotals[t] > 0);
        if (types.length === 0) return null;
        const maxVal = Math.max(...types.map((t) => typeTotals[t] / numHits));
        return (
          <Card title={<span>Dano por tipo (promedio)<HelpTip text="Desglose del dano final promedio por tipo de dano. Muestra cuanto dano de cada tipo pasa las defensas enemigas." /></span>}>
            <div className="space-y-1.5">
              {types
                .sort((a, b) => typeTotals[b] - typeTotals[a])
                .map((type) => {
                  const avg = Math.round(typeTotals[type] / numHits);
                  const pct = maxVal > 0 ? (typeTotals[type] / numHits / maxVal) * 100 : 0;
                  const icon = DAMAGE_TYPE_ICONS[type as DamageTypeName] || '';
                  const label = DAMAGE_TYPE_LABELS[type as DamageTypeName] || type;
                  return (
                    <div key={type} className="flex items-center gap-2">
                      <div className="w-24 text-xs text-zinc-400 flex items-center gap-1 shrink-0">
                        <span>{icon}</span>
                        <span>{label}</span>
                      </div>
                      <div className="flex-1 h-5 bg-zinc-800 rounded-full overflow-hidden relative">
                        <div
                          className="absolute h-full bg-amber-600/70 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                        <div className="absolute inset-0 flex items-center px-2 text-xs font-medium text-white">
                          {avg}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card>
        );
      })()}

      {/* Detail table */}
      <Card title={<span>Detalle<HelpTip text="Desglose completo de cada golpe: dano bruto, critico, y cada capa de reduccion aplicada." /></span>}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-left">
                <th className="py-1 px-2">#</th>
                <th className="py-1 px-2 text-right" title="Dano bruto antes de defensas (incluye especial)">Raw</th>
                <th className="py-1 px-2 text-center" title="Golpe critico (x1.5 dano)">Crit</th>
                <th className="py-1 px-2 text-right" title="Dano absorbido por armadura (PBA, CA, calidad)">Proteccion</th>
                <th className="py-1 px-2 text-right" title="Dano reducido por resistencias (general + por tipo)">Resistencia</th>
                <th className="py-1 px-2 text-right" title="Dano absorbido por barrera magica">Barrera</th>
                <th className="py-1 px-2 text-center" title="Se aplico piso minimo de dano (4-8% siempre pasa)">Min?</th>
                <th className="py-1 px-2 text-right font-bold" title="Dano final que recibe el objetivo">Final</th>
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
    </div>
  );
}
