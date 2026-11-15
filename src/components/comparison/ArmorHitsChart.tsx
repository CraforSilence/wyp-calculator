'use client';

import { Button } from '@/components/ui/Button';
import type { SimulationResult } from '@/types/simulation';
import { useT } from '@/i18n/I18nProvider';

export interface HitsEntry {
  id: string;
  nombre: string;
  color: string;
  sim: SimulationResult;
}

interface ArmorHitsChartProps {
  entries: HitsEntry[];
  onReroll: () => void;
}

/**
 * Los mismos golpes contra cada set: una fila por golpe y una barra por set.
 * Las barras arrancan en 0 para que el largo sea proporcional al daño.
 */
export function ArmorHitsChart({ entries, onReroll }: ArmorHitsChartProps) {
  const t = useT();
  if (entries.length === 0) return null;

  const hitCount = entries[0].sim.hits.length;
  const maxHit = Math.max(...entries.flatMap((e) => e.sim.hits.map((h) => h.finalDamage)), 1);
  const totals = entries.map((e) => e.sim.totalDamage);
  const minTotal = Math.min(...totals);
  const maxTotal = Math.max(...totals, 1);
  const allTied = totals.every((v) => v === minTotal);
  // El bruto es el mismo para todos los sets (mismas tiradas): se toma del primero
  const rawTotal = entries[0].sim.hits.reduce((s, h) => s + h.totalRawDamage, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Leyenda: color = set (no depende del orden) */}
        <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
          {entries.map((e) => (
            <li key={e.id} className="flex items-center gap-1.5 text-zinc-300">
              <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: e.color }} aria-hidden />
              {e.nombre}
            </li>
          ))}
        </ul>
        <Button size="sm" variant="secondary" onClick={onReroll}>🎲 {t("Tirar de nuevo")}</Button>
      </div>

      <div className="space-y-1" role="table" aria-label={t("Daño recibido por golpe")}>
        {Array.from({ length: hitCount }, (_, i) => {
          const crit = entries[0].sim.hits[i].isCrit;
          return (
            <div key={i} role="row" className="flex items-center gap-3 rounded px-1.5 py-1 hover:bg-zinc-800/40 transition-colors">
              <div role="rowheader" className="w-12 shrink-0 text-xs text-zinc-500 tabular-nums">
                #{i + 1}
                {crit && <span className="block text-[11px] font-semibold text-amber-400" title={t("Golpe crítico")}>💥 {t("crít.")}</span>}
              </div>
              <div className="flex-1 min-w-0 space-y-0.5">
                {entries.map((e) => {
                  const hit = e.sim.hits[i];
                  const absorbed = hit.totalRawDamage > 0 ? (1 - hit.finalDamage / hit.totalRawDamage) * 100 : 0;
                  return (
                    <div
                      key={e.id}
                      role="cell"
                      className="flex items-center gap-2"
                      title={t('{set}: recibe {final} de {bruto} ({pct}% absorbido)', {
                        set: e.nombre, final: hit.finalDamage, bruto: hit.totalRawDamage, pct: absorbed.toFixed(0),
                      })}
                    >
                      <div className="flex-1 h-2">
                        <div
                          className="h-full rounded-r transition-[width] duration-300"
                          style={{ width: `${Math.max(1, (hit.finalDamage / maxHit) * 100)}%`, backgroundColor: e.color }}
                        />
                      </div>
                      <span className="w-10 text-right text-[11px] text-zinc-400 tabular-nums">{hit.finalDamage}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Total de los golpes: menos es mejor */}
      <div className="pt-4 border-t border-zinc-800">
        <p className="text-xs text-zinc-500 mb-2">
          {t('Daño total recibido en {n} golpes', { n: hitCount })} · <span className="text-zinc-400">{t('bruto {n}', { n: rawTotal })}</span> · {t("menos es mejor")}
        </p>
        <div className="space-y-2">
          {[...entries].sort((a, b) => a.sim.totalDamage - b.sim.totalDamage).map((e) => {
            const best = !allTied && e.sim.totalDamage === minTotal;
            const absorbed = rawTotal > 0 ? (1 - e.sim.totalDamage / rawTotal) * 100 : 0;
            return (
              <div key={e.id}>
                <div className="flex justify-between gap-2 text-xs mb-1">
                  <span className="text-zinc-300 truncate flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: e.color }} aria-hidden />
                    {e.nombre}
                  </span>
                  <span className="shrink-0 tabular-nums">
                    <span className={best ? 'text-emerald-400 font-semibold' : 'text-zinc-200 font-semibold'}>{e.sim.totalDamage}</span>
                    <span className="text-zinc-500"> · {t('absorbe {pct}%', { pct: absorbed.toFixed(1) })}</span>
                    {best && <span className="text-emerald-400"> · 🏆</span>}
                  </span>
                </div>
                <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-[width] duration-300"
                    style={{ width: `${(e.sim.totalDamage / maxTotal) * 100}%`, backgroundColor: e.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
