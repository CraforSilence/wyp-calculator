'use client';

import { useBuildDamage } from '@/hooks/useBuildDamage';
import { useCharacter } from '@/hooks/useCharacter';
import { aggregateJewelryBonuses } from '@/hooks/useJewelry';
import {
  DAMAGE_TYPE_LABELS, DAMAGE_TYPE_ICONS, PHYSICAL_DAMAGE_TYPES, JEWELRY_BONUS_LABELS, JEWELRY_BONUS_TYPES, CRIT_BASE,
} from '@/lib/engine/constants';
import type { DamageTypeName } from '@/types/weapon';

const MAIN_STAT_LABELS = { STR: 'Fuerza', DXT: 'Destreza', INT: 'Inteligencia' } as const;

function Row({ label, value, className = 'text-zinc-200' }: { label: React.ReactNode; value: React.ReactNode; className?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1 border-b border-dashed border-zinc-800 last:border-0">
      <span className="text-zinc-400">{label}</span>
      <span className={`font-mono tabular-nums ${className}`}>{value}</span>
    </div>
  );
}

/** Panel fijo al costado con el dano del arma: se actualiza mientras se edita el arma o la joyeria. */
export function WeaponDamagePanel() {
  const { hasWeapon, mainCalc, jewelry, isDualMode } = useBuildDamage();
  const { character } = useCharacter();

  if (!hasWeapon || !mainCalc) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-700 bg-zinc-900/60 p-4 text-center">
        <p className="text-[12px] uppercase tracking-wider text-zinc-500 mb-1">Daño por golpe</p>
        <p className="text-sm text-zinc-400">Cargá un arma y acá vas a ver tu daño en vivo.</p>
      </div>
    );
  }

  const c = mainCalc;
  const p = c.pasos;
  const jBonus = aggregateJewelryBonuses(jewelry);
  const jewelryEntries = JEWELRY_BONUS_TYPES.filter((t) => jBonus[t]);
  const types = Object.entries(c.desglose) as [DamageTypeName, [number, number]][];
  // El "Chance de critico %" de arma y joyeria multiplica el critico base de la subclase
  const critBase = CRIT_BASE[character.subclase];
  const critBonusPct = c.critBonusPct;

  return (
    <div className="rounded-lg border border-amber-700/40 bg-zinc-900 shadow-lg shadow-black/30 overflow-hidden">
      <div className="px-4 pt-3 pb-3 bg-gradient-to-b from-amber-500/10 to-transparent">
        <p className="text-[12px] uppercase tracking-wider text-amber-500/80 font-semibold">Daño por golpe</p>
        <p className="text-xs text-zinc-400 truncate" title={c.nombre}>{isDualMode ? 'Duales (combinado)' : c.nombre || 'Arma del Build'}</p>
        <p className="mt-1 text-3xl font-bold text-zinc-50 tabular-nums">
          {c.danoMin} <span className="text-zinc-500">–</span> {c.danoMax}
          <span className="ml-2 text-xs font-normal text-zinc-500">mín – máx</span>
        </p>
      </div>

      <div className="px-4 pb-4 space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-md bg-zinc-800/60 px-2.5 py-1.5">
            <p className="text-[12px] text-zinc-500">Promedio</p>
            <p className="font-semibold text-zinc-100 tabular-nums">{c.danoPromedio}</p>
          </div>
          <div className="rounded-md bg-amber-500/10 border border-amber-600/30 px-2.5 py-1.5">
            <p className="text-[12px] text-amber-500/80">DPS efectivo</p>
            <p className="font-semibold text-amber-400 tabular-nums">{c.dpsEfectivo}</p>
          </div>
          <div
            className="rounded-md bg-zinc-800/60 px-2.5 py-1.5"
            title={`Crítico base de ${character.subclase}: ${critBase}%. El "Chance de crítico %" del arma y la joyería (+${critBonusPct}%) se aplica sobre esa base: ${critBase}% × ${(1 + critBonusPct / 100).toFixed(2)} = ${c.critTotalPct}%.`}
          >
            <p className="text-[12px] text-zinc-500">Crítico</p>
            <p className="font-semibold text-zinc-100 tabular-nums">{c.critTotalPct}% <span className="text-xs font-normal text-zinc-500">x{c.critMult}</span></p>
            {critBonusPct > 0 && (
              <p className="text-[11px] text-zinc-500 tabular-nums">{critBase}% base <span className="text-amber-400/80">+{critBonusPct}%</span></p>
            )}
          </div>
          <div className="rounded-md bg-zinc-800/60 px-2.5 py-1.5">
            <p className="text-[12px] text-zinc-500">Velocidad</p>
            <p className="font-semibold text-zinc-100 tabular-nums">{c.velEfectiva}s <span className="text-xs font-normal text-zinc-500">{c.golpesPorSeg} g/s</span></p>
          </div>
        </div>

        <div>
          <p className="text-[12px] uppercase tracking-wider text-zinc-500 mb-1">Por tipo</p>
          {types.map(([t, [min, max]]) => (
            <div key={t} className="flex items-center justify-between gap-2 py-0.5">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <span className={`w-1.5 h-1.5 rounded-full ${PHYSICAL_DAMAGE_TYPES.includes(t) ? 'bg-orange-500' : 'bg-blue-500'}`} />
                {DAMAGE_TYPE_ICONS[t]} {DAMAGE_TYPE_LABELS[t] || t}
                {c.specialDamagePerType[t] != null && (
                  <span className="text-[11px] text-purple-400" title="Daño especial: solo lo reduce el factor de protección (PF)">+{c.specialDamagePerType[t]} esp.</span>
                )}
              </span>
              <span className="tabular-nums text-zinc-200">{min} – {max}</span>
            </div>
          ))}
        </div>

        {jewelryEntries.length > 0 && (
          <div>
            <p className="text-[12px] uppercase tracking-wider text-zinc-500 mb-1">Joyería aplicada</p>
            <div className="flex flex-wrap gap-1">
              {jewelryEntries.map((t) => (
                <span key={t} className="rounded border border-zinc-700 bg-zinc-800/60 px-1.5 py-0.5 text-[12px] text-zinc-300">
                  {JEWELRY_BONUS_LABELS[t]} <span className="text-amber-400 font-semibold">+{jBonus[t]}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        <details className="group rounded-md border border-zinc-800 bg-zinc-950/40">
          <summary className="cursor-pointer select-none px-2.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 list-none flex items-center justify-between">
            Ver cálculo
            <span className="transition-transform group-open:rotate-180">▾</span>
          </summary>
          <div className="px-2.5 pb-2 text-xs">
            <Row label={`${MAIN_STAT_LABELS[p.mainStat]} efectiva`} value={p.statEfectivo} />
            <Row label="Daño base del arma" value={`${p.danoBase[0]} – ${p.danoBase[1]}`} />
            <Row label="+ Bonus de atributo" value={`+${p.bonusAtributo}`} className="text-zinc-300" />
            {p.bonusPlano > 0 && <Row label="+ Daño del arma (+X)" value={`+${p.bonusPlano}`} className="text-zinc-300" />}
            {p.especial > 0 && <Row label={<>+ Especial <span className="text-zinc-600">(gemas y joyería)</span></>} value={`+${p.especial}`} className="text-purple-400" />}
            <Row label={<span className="text-zinc-200 font-semibold">= Daño final</span>} value={`${c.danoMin} – ${c.danoMax}`} className="text-zinc-50 font-semibold" />
            <p className="mt-1.5 text-[12px] text-zinc-600">
              Bonus de atributo = ({MAIN_STAT_LABELS[p.mainStat].toLowerCase()} − 20) × {p.attributeMultiplier} + Stat Base del arma. Se reparte entre los tipos según su daño máximo.
            </p>
          </div>
        </details>
      </div>
    </div>
  );
}
