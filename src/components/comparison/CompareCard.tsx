'use client';

import { Badge, rarezaToBadgeVariant } from '@/components/ui/Badge';
import { WeaponAbility } from '@/components/weapons/WeaponAbility';
import { DAMAGE_TYPE_LABELS, DAMAGE_TYPE_ICONS, MUESCA_TYPE_LABELS, PHYSICAL_DAMAGE_TYPES } from '@/lib/engine/constants';
import { isMuescaSpeedType } from '@/lib/engine/constants';
import { bonusIcon } from '@/lib/bonusDisplay';
import type { DamageTypeName, MuescaType, Weapon, WeaponAttr, WeaponCalcResult } from '@/types/weapon';
import { getWeaponAttributes, WEAPON_ATTR_LABELS } from '@/lib/weaponAttributes';
import { useT } from '@/i18n/I18nProvider';

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
  /** Puesto por DPS entre las armas elegidas (1 = la mejor); sin puesto si hay una sola */
  rank?: number;
  /** Diferencia de DPS contra la mejor, en %; 0 para la mejor */
  dpsDiffPct?: number;
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

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="pt-2 mt-2 border-t border-zinc-800">
      <div className="text-[11px] uppercase tracking-wider text-zinc-600 mb-1" title={hint}>{title}</div>
      {children}
    </div>
  );
}

const fmtPct = (n: number) => `${n > 0 ? '+' : ''}${n}%`;

const RANK_STYLES = ['bg-amber-500 text-zinc-950', 'bg-zinc-300 text-zinc-900', 'bg-orange-800 text-orange-100'];

export function CompareCard({ weapon, result, best, rank, dpsDiffPct = 0, onRemove }: CompareCardProps) {
  const t = useT();
  const { arma, muescas } = result.attackSpeedSources;
  // Las muescas de velocidad ya se muestran en la seccion Velocidad
  const attrEntries = (Object.entries(getWeaponAttributes(weapon)) as [WeaponAttr, number][]).filter(([, v]) => v);
  const muescaEntries = Object.entries(weapon.muescas).filter(([dt, v]) => v && !isMuescaSpeedType(dt)) as [MuescaType, number][];

  return (
    <div className={`bg-zinc-900 border rounded-lg p-4 flex flex-col animate-fade-in-up ${best.dps ? 'border-amber-600/60' : 'border-zinc-800'}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex items-start gap-2">
          {rank !== undefined && (
            <span
              className={`shrink-0 mt-0.5 inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${RANK_STYLES[rank - 1] ?? 'bg-zinc-800 text-zinc-400'}`}
              title={t('Puesto {n} por DPS', { n: rank })}
            >
              {rank}
            </span>
          )}
          <div className="min-w-0">
          <h3 className="text-sm font-semibold text-zinc-100 leading-snug break-words">{weapon.nombre}</h3>
          <div className="flex items-center gap-1.5 flex-wrap mt-1">
            <Badge variant={rarezaToBadgeVariant(weapon.rareza)}>{t(weapon.rareza)}</Badge>
            <span className="text-xs text-zinc-500">{t(weapon.subcategoria)} &middot; {t(weapon.velocidad)}</span>
          </div>
          </div>
        </div>
        <button
          onClick={onRemove}
          title={t('Quitar de la comparación')}
          className="shrink-0 w-6 h-6 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          &times;
        </button>
      </div>

      {/* DPS destacado */}
      <div
        className={`mt-3 rounded border px-3 py-2 ${best.dps ? 'bg-amber-500/10 border-amber-600/40' : 'bg-zinc-950/60 border-zinc-800'}`}
        title={t("Daño por segundo: promedio por golpe × golpes por segundo, con el crítico incluido")}
      >
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-zinc-500">{t("DPS efectivo")}</span>
          <span className="text-xl font-bold text-amber-400 tabular-nums">{result.dpsEfectivo}</span>
        </div>
        {rank !== undefined && (
          <div className={`text-right text-[12px] ${best.dps ? 'text-amber-500' : 'text-zinc-500'}`}>
            {best.dps ? t("🏆 la mejor") : dpsDiffPct === 0 ? t("empata con la mejor") : t('{pct}% vs la mejor', { pct: dpsDiffPct.toFixed(1) })}
          </div>
        )}
      </div>

      <Section title={t("Daño por golpe")} hint={t("Lo que hace cada golpe, antes de la armadura del enemigo")}>
        <Row label={t("Mín – Máx")}>{result.danoMin} – {result.danoMax}</Row>
        <Row label={t("Promedio")} highlight={best.prom}>{result.danoPromedio}</Row>
        {Object.entries(result.desglose).map(([tipo, [min, max]]) => {
          const special = result.specialDamagePerType[tipo] || 0;
          const label = DAMAGE_TYPE_LABELS[tipo as DamageTypeName] || tipo;
          const isPhysical = PHYSICAL_DAMAGE_TYPES.includes(tipo as DamageTypeName);
          return (
            <Row key={tipo} label={
              <span className="pl-2 inline-flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${isPhysical ? 'bg-orange-500' : 'bg-blue-500'}`} />
                {DAMAGE_TYPE_ICONS[tipo as DamageTypeName]} {t(label)}
              </span>
            }>
              <span className="text-zinc-400">
                {min === max ? min : `${min}-${max}`}
                {special > 0 && <span className="text-purple-400/80 text-xs" title={t("Daño especial de gemas: solo lo reduce el factor de protección (PF)")}> +{special} {t('esp.')}</span>}
              </span>
            </Row>
          );
        })}
      </Section>

      <Section title={t("Velocidad")} hint={t("s/g = segundos por golpe (menos es mejor) · g/s = golpes por segundo")}>
        <Row label={t("Base")}>{result.velBase.toFixed(2)} s/g</Row>
        {arma !== 0 && <Row label={t("Arma")}>{fmtPct(arma)}</Row>}
        {muescas !== 0 && <Row label={t("Muescas")}>{fmtPct(muescas)}</Row>}
        <Row label={t("Efectiva")} highlight={best.vel}>
          {result.velEfectiva} s/g <span className="text-zinc-500 text-xs">({result.golpesPorSeg} g/s)</span>
        </Row>
      </Section>

      <Section title={t("Crítico")} hint={t("Chance de pegar crítico y cuánto multiplica el daño")}>
        <Row label={t("Chance")} highlight={best.crit}>
          {result.critTotalPct}%
          {weapon.critChanceExtra !== 0 && <span className="text-zinc-500 text-xs"> ({fmtPct(weapon.critChanceExtra)})</span>}
        </Row>
        <Row label={t("Multiplicador")}>x{result.critMult}</Row>
      </Section>

      {(weapon.bonusAtributo !== 0 || attrEntries.length > 0 || weapon.atributoClasePct !== 0 || muescaEntries.length > 0) && (
        <Section title={t("Bonus del arma")}>
          {weapon.bonusAtributo !== 0 && <Row label={t("Atributo")}>+{weapon.bonusAtributo}</Row>}
          {attrEntries.map(([attr, valor]) => (
            <Row key={attr} label={`${bonusIcon(attr)} ${t(WEAPON_ATTR_LABELS[attr])}`}>+{valor}</Row>
          ))}
          {weapon.atributoClasePct !== 0 && <Row label={t("Atributo de clase")}>{fmtPct(weapon.atributoClasePct)}</Row>}
          {muescaEntries.map(([tipo, valor]) => (
            <Row key={tipo} label={`${bonusIcon(tipo)} ${t('Muesca {tipo}', { tipo: t(MUESCA_TYPE_LABELS[tipo] || tipo) })}`}>+{valor}</Row>
          ))}
        </Section>
      )}

      <Section title={t("Habilidad")} hint={t("Golpe especial de la categoría del arma (Riposte en lanzas, Impacto Vigoroso en mazas, etc.)")}>
        <div className={`text-sm ${best.ability ? 'font-semibold' : ''}`}>
          <WeaponAbility result={result} fallback={<span className="text-zinc-600 text-xs">{t("Sin habilidad propia")}</span>} />
        </div>
      </Section>
    </div>
  );
}
