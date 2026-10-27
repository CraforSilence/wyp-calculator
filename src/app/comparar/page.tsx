'use client';

import { useMemo, useRef, useState } from 'react';
import { useCharacter } from '@/hooks/useCharacter';
import { useWeapons } from '@/hooks/useWeapons';
import { useJewelry } from '@/hooks/useJewelry';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { calcWeaponDamage } from '@/lib/engine/damage';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { WeaponPicker } from '@/components/comparison/WeaponPicker';
import { CompareCard, type BestFlags } from '@/components/comparison/CompareCard';
import { WeaponAbility, weaponAbilityKind, weaponAbilityValue } from '@/components/weapons/WeaponAbility';
import { ImportModal } from '@/components/ui/ImportModal';
import { useToast } from '@/components/ui/Toast';
import { useShare } from '@/components/ui/ShareProvider';
import { useShareImport, COMPARE_SELECTED_KEY } from '@/hooks/useShareImport';
import { stripWeapon } from '@/lib/share';
import type { ComparePayload } from '@/lib/share';
import type { WeaponCalcResult } from '@/types/weapon';

const MAX_COMPARE = 5;
const SELECTED_KEY = COMPARE_SELECTED_KEY;

/** Que significa cada dato, para el glosario plegable. */
const GLOSSARY: { term: string; text: string }[] = [
  { term: 'DPS efectivo', text: 'Daño por segundo: daño promedio por golpe × golpes por segundo, con el crítico incluido. Es el mejor número para decidir qué arma rinde más en una pelea.' },
  { term: 'Promedio', text: 'Lo que hace un golpe en promedio, entre el mínimo y el máximo. Sirve para ver qué arma pega más fuerte por golpe.' },
  { term: 's/g y g/s', text: 's/g = segundos por golpe (menos es más rápido). g/s = golpes por segundo (más es más rápido). Incluyen la velocidad de ataque del arma y sus muescas.' },
  { term: 'Crítico', text: 'Chance de pegar crítico y por cuánto multiplica el golpe (x1.5 = 50% más).' },
  { term: 'Especial (esp.)', text: 'Daño de gemas o muescas: el enemigo solo lo reduce con su factor de protección (PF), no con toda la armadura.' },
  { term: 'Habilidad', text: 'Golpe especial de la categoría: Riposte (lanzas), Impacto Vigoroso (mazas y martillos), Cruz del Sur (espadas y hachas). Solo se compara entre armas con la misma habilidad.' },
];

function HowToStep({ n, done, title, text }: { n: number; done: boolean; title: string; text: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className={`shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${done ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'}`}>
        {done ? '✓' : n}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-zinc-200">{title}</p>
        <p className="text-xs text-zinc-400">{text}</p>
      </div>
    </div>
  );
}

export default function CompararPage() {
  const { character } = useCharacter();
  const { weapons } = useWeapons();
  const { jewelry } = useJewelry();
  const [storedIds, setSelectedIds] = useLocalStorage<string[]>(SELECTED_KEY, []);
  // Por defecto arma contra arma, sin joyeria (igual que en /armas)
  const [withJewelry, setWithJewelry] = useLocalStorage<boolean>('regnum-compare-with-jewelry', false);
  const searchRef = useRef<HTMLInputElement>(null);
  const [showImport, setShowImport] = useState(false);
  const { toast } = useToast();
  const { share } = useShare();
  const { importShare } = useShareImport();
  const hasJewelry = Object.values(jewelry).some((p) => p.bonuses.length > 0);
  const applyJewelry = withJewelry && hasJewelry;

  const allResults = useMemo(
    () => weapons.map((w) => ({ weapon: w, result: calcWeaponDamage(w, character, applyJewelry ? jewelry : null) })),
    [weapons, character, applyJewelry, jewelry],
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
  const rankOf = (id: string) => byDps.findIndex((s) => s.weapon.id === id) + 1;
  const dpsDiff = (dps: number) => (bestDps > 0 ? ((dps - bestDps) / bestDps) * 100 : 0);
  const fastest = [...selected].sort((a, b) => b.result.golpesPorSeg - a.result.golpesPorSeg)[0];
  const emptySlots = MAX_COMPARE - selected.length;
  const cell = (on: boolean, off = 'text-zinc-300') => (on ? 'text-emerald-400 font-semibold' : off);

  return (
    <div>
      <PageHeader
        title="Comparar"
        description={`Poné hasta ${MAX_COMPARE} armas lado a lado y mirá cuál rinde más con tu personaje.`}
        actions={
          <div className="flex flex-wrap justify-end gap-2">
            {selected.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>Limpiar</Button>
            )}
            <Button variant="secondary" size="sm" onClick={() => setShowImport(true)}>Importar código</Button>
            {selected.length > 0 && (
              <Button
                size="sm"
                onClick={() => share('compare', {
                  weapons: selected.map((s) => stripWeapon(s.weapon)),
                  character,
                } satisfies ComparePayload)}
              >
                Compartir comparativo
              </Button>
            )}
          </div>
        }
      />

      <ImportModal
        open={showImport}
        onClose={() => setShowImport(false)}
        expectedType="compare"
        onImport={(result) => toast(importShare(result).message, 'success')}
      />

      {/* Como se usa y con que se calcula */}
      <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 space-y-3">
        <div className="grid gap-3 sm:grid-cols-3">
          <HowToStep n={1} done={selected.length >= 2} title="Elegí 2 o más armas" text="Buscalas en la lista de la izquierda y tocá +." />
          <HowToStep n={2} done={false} title="Mirá el veredicto" text="Te dice cuál rinde más por segundo, cuál pega más fuerte y cuál es más rápida." />
          <HowToStep n={3} done={false} title="Revisá el detalle" text="Cada card y el cuadro muestran de dónde sale cada número. En verde, el mejor." />
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 pt-3 border-t border-amber-500/20">
          <span className="text-xs text-zinc-400">Calcular con:</span>
          <div className="inline-flex rounded-md border border-zinc-700 overflow-hidden text-xs">
            <button
              onClick={() => setWithJewelry(false)}
              className={`px-3 py-1.5 transition-colors ${!applyJewelry ? 'bg-amber-600 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              Solo el arma
            </button>
            <button
              onClick={() => setWithJewelry(true)}
              disabled={!hasJewelry}
              title={hasJewelry ? 'Suma los bonus de tus anillos y amuleto del Build' : 'Cargá tu joyería en el Build (paso 2) para usar esta opción'}
              className={`px-3 py-1.5 border-l border-zinc-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${applyJewelry ? 'bg-amber-600 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              Con mi joyería
            </button>
          </div>
          <span className="text-xs text-zinc-500">
            {applyJewelry
              ? 'Incluye los bonus de tu joyería del Build.'
              : hasJewelry
                ? 'Arma contra arma con los stats de tu personaje, sin joyería.'
                : 'Arma contra arma con los stats de tu personaje. No tenés joyería cargada en el Build.'}
          </span>
        </div>
        <details className="group">
          <summary className="cursor-pointer select-none list-none text-xs text-amber-400/90 hover:text-amber-300 inline-flex items-center gap-1">
            <span className="transition-transform group-open:rotate-90">▸</span> ¿Qué significa cada dato?
          </summary>
          <dl className="mt-2 grid gap-x-6 gap-y-1.5 sm:grid-cols-2 text-xs">
            {GLOSSARY.map((g) => (
              <div key={g.term}>
                <dt className="inline font-semibold text-zinc-200">{g.term}: </dt>
                <dd className="inline text-zinc-400">{g.text}</dd>
              </div>
            ))}
          </dl>
        </details>
      </div>

      {/* Veredicto en palabras */}
      {selected.length >= 2 && (() => {
        const top = byDps[0];
        const second = byDps[1];
        const hardest = byProm[0];
        // Mismo % que muestran las cards: cuanto menos rinde la segunda respecto de la mejor
        const lead = Math.abs(dpsDiff(second.result.dpsEfectivo));
        return (
          <div className="mb-4 rounded-lg border border-emerald-700/40 bg-emerald-500/5 px-4 py-3">
            <p className="text-[12px] uppercase tracking-wider text-emerald-400/80 font-semibold mb-1">Veredicto</p>
            <p className="text-sm text-zinc-200">
              🏆 <strong className="text-amber-400">{top.weapon.nombre}</strong> es la que más daño hace por segundo
              {lead !== 0
                ? <> ({top.result.dpsEfectivo} DPS). La sigue {second.weapon.nombre}, que rinde <span className="text-emerald-400">{lead.toFixed(1)}% menos</span>.</>
                : <> (empata con {second.weapon.nombre}).</>}
            </p>
            <ul className="mt-1.5 space-y-0.5 text-xs text-zinc-400">
              {hardest.weapon.id !== top.weapon.id ? (
                <li>💪 <span className="text-zinc-200">{hardest.weapon.nombre}</span> pega más fuerte por golpe (promedio {hardest.result.danoPromedio}), pero rinde menos por segundo: conviene para golpes sueltos o habilidades.</li>
              ) : (
                <li>💪 También es la que pega más fuerte por golpe (promedio {hardest.result.danoPromedio}).</li>
              )}
              <li>⏩ La más rápida es <span className="text-zinc-200">{fastest.weapon.nombre}</span> ({fastest.result.velEfectiva} s por golpe).</li>
            </ul>
          </div>
        );
      })()}

      <div className="grid lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] gap-4 mb-6 items-start lg:items-stretch">
        {/* En pantalla grande el panel toma el alto de las cards de al lado (con un minimo) y la lista scrollea adentro */}
        <div className="lg:relative lg:min-h-[32rem]">
          <div className="lg:absolute lg:inset-0 flex flex-col bg-zinc-900 border border-zinc-800 rounded-lg animate-fade-in-up">
            <div className="px-4 py-3 border-b border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-200">Armas <span className="text-zinc-500 font-normal">({selected.length}/{MAX_COMPARE})</span></h3>
            </div>
            <div className="p-4 flex-1 min-h-0">
              <WeaponPicker
                ref={searchRef}
                items={allResults}
                selectedIds={selectedIds}
                maxSelected={MAX_COMPARE}
                onToggle={toggleWeapon}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {selected.map(({ weapon, result }) => (
            <CompareCard
              key={weapon.id}
              weapon={weapon}
              result={result}
              best={flags.get(weapon.id)!}
              rank={selected.length >= 2 ? rankOf(weapon.id) : undefined}
              dpsDiffPct={dpsDiff(result.dpsEfectivo)}
              onRemove={() => toggleWeapon(weapon.id)}
            />
          ))}
          {selected.length === 0 && allResults.length >= 2 && (() => {
            const top = [...allResults].sort((a, b) => b.result.dpsEfectivo - a.result.dpsEfectivo).slice(0, 3);
            return (
              <div className="sm:col-span-2 xl:col-span-3 rounded-lg border border-amber-600/30 bg-gradient-to-br from-amber-500/10 to-transparent px-4 py-4">
                <p className="text-sm font-medium text-zinc-200">¿No sabés por dónde empezar?</p>
                <p className="text-xs text-zinc-400 mt-0.5">Compará las {top.length} armas con más DPS para tu personaje y después cambiá las que quieras.</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {top.map(({ weapon, result }) => (
                    <span key={weapon.id} className="rounded border border-zinc-700 bg-zinc-900/80 px-2 py-0.5 text-xs text-zinc-300">
                      {weapon.nombre} <span className="text-amber-400 font-semibold">{result.dpsEfectivo}</span>
                    </span>
                  ))}
                </div>
                <Button size="sm" className="mt-3" onClick={() => setSelectedIds(top.map((t) => t.weapon.id))}>
                  Comparar estas {top.length}
                </Button>
              </div>
            );
          })()}
          {emptySlots > 0 && (
            <button
              onClick={() => searchRef.current?.focus()}
              className="min-h-40 rounded-lg border-2 border-dashed border-zinc-800 hover:border-zinc-700 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer flex flex-col items-center justify-center gap-1 text-sm"
            >
              <span className="text-2xl leading-none">+</span>
              <span>Agregar arma</span>
              <span className="text-xs text-zinc-600">
                {selected.length === 0 ? 'Buscá y elegí en la lista' : `Quedan ${emptySlots} lugar${emptySlots === 1 ? '' : 'es'}`}
              </span>
            </button>
          )}
        </div>
      </div>

      {selected.length >= 2 && (
        <>
          <Card title="Cuadro comparativo" className="mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-xs text-zinc-500 text-left">
                    <th className="py-2 px-2">#</th>
                    <th className="py-2 px-2">Arma</th>
                    <th className="py-2 px-2 text-right">Mín</th>
                    <th className="py-2 px-2 text-right">Máx</th>
                    <th className="py-2 px-2 text-right" title="Daño promedio por golpe">Prom.</th>
                    <th className="py-2 px-2 text-right" title="Chance de crítico">Crít. %</th>
                    <th className="py-2 px-2 text-right" title="Multiplicador del crítico">Crít. x</th>
                    <th className="py-2 px-2 text-right" title="Segundos por golpe (base del arma ajustada por vel. ataque del arma y muescas)">s/g</th>
                    <th className="py-2 px-2 text-right" title="Golpes por segundo">g/s</th>
                    <th className="py-2 px-2 text-right font-bold text-amber-500">DPS</th>
                    <th className="py-2 px-2 text-right" title="Diferencia de DPS contra la mejor arma">vs mejor</th>
                    <th className="py-2 px-2 text-right">Habilidad</th>
                  </tr>
                </thead>
                <tbody>
                  {byDps.map(({ weapon, result }) => {
                    const f = flags.get(weapon.id)!;
                    const diff = dpsDiff(result.dpsEfectivo);
                    return (
                      <tr key={weapon.id} className={`border-b border-zinc-800/50 ${f.dps ? 'bg-amber-500/5' : ''}`}>
                        <td className="py-2 px-2 text-zinc-500 tabular-nums">{rankOf(weapon.id)}</td>
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
                          {f.dps ? '🏆 mejor' : diff === 0 ? 'empate' : `${diff.toFixed(1)}%`}
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
            <p className="text-xs text-zinc-600 mt-2">Ordenado por DPS. En verde, el mejor valor de cada columna. <span className="text-zinc-500">s/g</span> = segundos por golpe (menos es mejor), <span className="text-zinc-500">g/s</span> = golpes por segundo.</p>
          </Card>

          <div className="grid sm:grid-cols-2 gap-4">
            <Card title={<span>DPS efectivo <span className="text-xs font-normal text-zinc-500">· daño por segundo, el que más importa en una pelea</span></span>}>
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

            <Card title={<span>Daño promedio <span className="text-xs font-normal text-zinc-500">· lo que hace cada golpe</span></span>}>
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
        <div className="text-center py-6 text-zinc-500 text-sm">Agregá al menos una arma más para ver el veredicto y el cuadro comparativo.</div>
      )}
    </div>
  );
}
