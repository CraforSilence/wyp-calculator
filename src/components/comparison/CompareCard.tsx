'use client';

import { Badge, rarezaToBadgeVariant } from '@/components/ui/Badge';
import { WeaponAbility } from '@/components/weapons/WeaponAbility';
import { DAMAGE_TYPE_LABELS, MUESCA_TYPE_LABELS } from '@/lib/engine/constants';
import { isMuescaSpeedType } from '@/lib/engine/constants';
import type { DamageTypeName, MuescaType, Weapon, WeaponCalcResult } from '@/types/weapon';

export interface BestFlags {
  dps: boolean;
  prom: boolean;
  vel: boolean;
  crit: boolean;
  ability: boolean;
}

interface CompareCardProps {
  weapon: Weapon;
  result: WeaponCalcResult;
  best: BestFlags;
  onRemove: () => void;
}

function Row({ label, children, highlight }: { label: React.ReactNode; children: React.ReactNode; highlight?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-2 py-0.5">
      <span className="text-xs text-zinc-500">{label}</span>
      <span className={`text-sm text-right ${highlight ? 'text-emerald-400 font-semibold' : 'text-zinc-200'}`}>{children}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="pt-2 mt-2 border-t border-zinc-800">
      <div className="text-[10px] uppercase tracking-wider text-zinc-600 mb-1">{title}</div>
      {children}
    </div>
  );
}

const fmtPct = (n: number) => `${n > 0 ? '+' : ''}${n}%`;

export function CompareCard({ weapon, result, best, onRemove }: CompareCardProps) {
  const { arma, muescas } = result.attackSpeedSources;
  // Las muescas de velocidad ya se muestran en la seccion Velocidad
  const muescaEntries = Object.entries(weapon.muescas).filter(([t, v]) => v && !isMuescaSpeedType(t)) as [MuescaType, number][];

  return (
    <div className={`bg-zinc-900 border rounded-lg p-4 flex flex-col animate-fade-in-up ${best.dps ? 'border-amber-600/60' : 'border-zinc-800'}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-zinc-100 leading-snug break-words">{weapon.nombre}</h3>
          <div className="flex items-center gap-1.5 flex-wrap mt-1">
            <Badge variant={rarezaToBadgeVariant(weapon.rareza)}>{weapon.rareza}</Badge>
            <span className="text-xs text-zinc-500">{weapon.subcategoria} &middot; {weapon.velocidad}</span>
          </div>
        </div>
        <button
          onClick={onRemove}
          title="Quitar de la comparacion"
          className="shrink-0 w-6 h-6 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          &times;
        </button>
      </div>

      {/* DPS destacado */}
      <div className="mt-3 rounded bg-zinc-950/60 border border-zinc-800 px-3 py-2 flex items-baseline justify-between">
        <span className="text-xs text-zinc-500">DPS</span>
        <span className="flex items-baseline gap-2">
          {best.dps && <span className="text-[10px] uppercase tracking-wider text-amber-500">mejor</span>}
          <span className="text-xl font-bold text-amber-400">{result.dpsEfectivo}</span>
        </span>
      </div>

      <Section title="Dano">
        <Row label="Min - Max">{result.danoMin} - {result.danoMax}</Row>
        <Row label="Promedio" highlight={best.prom}>{result.danoPromedio}</Row>
        {Object.entries(result.desglose).map(([tipo, [min, max]]) => {
          const special = result.specialDamagePerType[tipo] || 0;
          const label = DAMAGE_TYPE_LABELS[tipo as DamageTypeName] || tipo;
          return (
            <Row key={tipo} label={<span className="pl-2">{label}</span>}>
              <span className="text-zinc-400">
                {min === max ? min : `${min}-${max}`}
                {special > 0 && <span className="text-zinc-600"> (+{special} gema)</span>}
              </span>
            </Row>
          );
        })}
      </Section>

      <Section title="Velocidad">
        <Row label="Base">{result.velBase.toFixed(2)} s/g</Row>
        {arma !== 0 && <Row label="Arma">{fmtPct(arma)}</Row>}
        {muescas !== 0 && <Row label="Muescas">{fmtPct(muescas)}</Row>}
        <Row label="Efectiva" highlight={best.vel}>
          {result.velEfectiva} s/g <span className="text-zinc-500 text-xs">({result.golpesPorSeg} g/s)</span>
        </Row>
      </Section>

      <Section title="Critico">
        <Row label="Chance" highlight={best.crit}>
          {result.critTotalPct}%
          {weapon.critChanceExtra !== 0 && <span className="text-zinc-500 text-xs"> ({fmtPct(weapon.critChanceExtra)})</span>}
        </Row>
        <Row label="Multiplicador">x{result.critMult}</Row>
      </Section>

      {(weapon.bonusAtributo !== 0 || weapon.bonusStat !== 0 || weapon.atributoClasePct !== 0 || muescaEntries.length > 0) && (
        <Section title="Bonus del arma">
          {weapon.bonusAtributo !== 0 && <Row label="Atributo">+{weapon.bonusAtributo}</Row>}
          {weapon.bonusStat !== 0 && <Row label="Stat principal">+{weapon.bonusStat}</Row>}
          {weapon.atributoClasePct !== 0 && <Row label="Atributo de clase">{fmtPct(weapon.atributoClasePct)}</Row>}
          {muescaEntries.map(([tipo, valor]) => (
            <Row key={tipo} label={`Muesca ${MUESCA_TYPE_LABELS[tipo] || tipo}`}>+{valor}</Row>
          ))}
        </Section>
      )}

      <Section title="Habilidad">
        <div className={`text-sm ${best.ability ? 'font-semibold' : ''}`}>
          <WeaponAbility result={result} fallback={<span className="text-zinc-600 text-xs">Sin habilidad propia</span>} />
        </div>
      </Section>
    </div>
  );
}
