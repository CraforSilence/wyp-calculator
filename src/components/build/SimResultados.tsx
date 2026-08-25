'use client';

import { Card } from '@/components/ui/Card';
import { HelpTip } from '@/components/ui/HelpTip';
import type { SimulationResult } from '@/types/simulation';

interface SimResultadosProps {
  result: SimulationResult;
}

export function SimResultados({ result }: SimResultadosProps) {
  const maxDmg = Math.max(...result.hits.map((h) => h.totalRawDamage), 1);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <div className="text-center">
            <div className="text-xs text-zinc-500">Dano Promedio<HelpTip text="Promedio de dano final por golpe en esta simulacion." /></div>
            <div className="text-2xl font-bold text-amber-400">{result.averageDamage}</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-xs text-zinc-500">Dano Total<HelpTip text="Suma del dano final de todos los golpes." /></div>
            <div className="text-2xl font-bold text-zinc-200">{result.totalDamage}</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-xs text-zinc-500">Criticos<HelpTip text="Golpes criticos obtenidos del total. Critico = dano x1.5." /></div>
            <div className="text-2xl font-bold text-red-400">{result.critsLanded}/{result.hits.length}</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-xs text-zinc-500">Min / Max<HelpTip text="Dano final minimo y maximo en un solo golpe." /></div>
            <div className="text-lg font-bold text-zinc-200">
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
