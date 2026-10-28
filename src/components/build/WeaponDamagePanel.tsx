'use client';

import { useBuildDamage } from '@/hooks/useBuildDamage';
import { useCharacter } from '@/hooks/useCharacter';
import { aggregateJewelryBonuses } from '@/hooks/useJewelry';
import {
  DAMAGE_TYPE_LABELS, PHYSICAL_DAMAGE_TYPES, JEWELRY_BONUS_LABELS, JEWELRY_BONUS_TYPES, CRIT_BASE,
} from '@/lib/engine/constants';
import type { DamageTypeName, WeaponCalcResult } from '@/types/weapon';
import type { Subclase } from '@/types/character';
import type { JewelrySet } from '@/types/jewelry';
import { useT } from '@/i18n/I18nProvider';
import { DamageIcon } from '@/components/icons/StatIcons';

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
  const t = useT();
  const { hasWeapon, mainCalc, jewelry, isDualMode } = useBuildDamage();
  const { character } = useCharacter();

  if (!hasWeapon || !mainCalc) return <EmptyDamagePanel text={t("Cargá un arma y acá vas a ver tu daño en vivo.")} />;
  return <DamagePanel calc={mainCalc} subclase={character.subclase} jewelry={jewelry} title={isDualMode ? t("Duales (combinado)") : mainCalc.nombre || t('Arma del Build')} />;
}

export function EmptyDamagePanel({ text }: { text: string }) {
  const t = useT();
  return (
    <div className="rounded-lg border border-dashed border-zinc-700 bg-zinc-900/60 p-4 text-center">
      <p className="text-[12px] uppercase tracking-wider text-zinc-500 mb-1">{t("Daño por golpe")}</p>
      <p className="text-sm text-zinc-400">{text}</p>
    </div>
  );
}

/** El panel de daño de un cálculo cualquiera (el del Build o el arma que se está editando). */
export function DamagePanel({ calc: c, subclase, jewelry = null, title }: {
  calc: WeaponCalcResult;
  subclase: Subclase;
  jewelry?: JewelrySet | null;
  title: string;
}) {
  const t = useT();
  const p = c.pasos;
  const jBonus = jewelry ? aggregateJewelryBonuses(jewelry) : {};
  const jewelryEntries = JEWELRY_BONUS_TYPES.filter((dt) => jBonus[dt]);
  const types = Object.entries(c.desglose) as [DamageTypeName, [number, number]][];
  // El "Chance de critico %" de arma y joyeria multiplica el critico base de la subclase
  const critBase = CRIT_BASE[subclase];
  const critBonusPct = c.critBonusPct;

  return (
    <div className="rounded-lg border border-amber-700/40 bg-zinc-900 shadow-lg shadow-black/30 overflow-hidden">
      <div className="px-4 pt-3 pb-3 bg-gradient-to-b from-amber-500/10 to-transparent">
        <p className="text-[12px] uppercase tracking-wider text-amber-500/80 font-semibold">{t("Daño por golpe")}</p>
        <p className="text-xs text-zinc-400 truncate" title={title}>{title}</p>
        <p className="mt-1 text-3xl font-bold text-zinc-50 tabular-nums">
          {c.danoMin} <span className="text-zinc-500">–</span> {c.danoMax}
          <span className="ml-2 text-xs font-normal text-zinc-500">{t("mín – máx")}</span>
        </p>
      </div>

      <div className="px-4 pb-4 space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-md bg-zinc-800/60 px-2.5 py-1.5">
            <p className="text-[12px] text-zinc-500">{t("Promedio")}</p>
            <p className="font-semibold text-zinc-100 tabular-nums">{c.danoPromedio}</p>
          </div>
          <div className="rounded-md bg-amber-500/10 border border-amber-600/30 px-2.5 py-1.5">
            <p className="text-[12px] text-amber-500/80">{t("DPS efectivo")}</p>
            <p className="font-semibold text-amber-400 tabular-nums">{c.dpsEfectivo}</p>
          </div>
          <div
            className="rounded-md bg-zinc-800/60 px-2.5 py-1.5"
            title={t('Crítico base de {subclase}: {base}%. El "Chance de crítico %" del arma y la joyería (+{bonus}%) se aplica sobre esa base: {base}% × {mult} = {total}%.', { subclase: t(subclase), base: critBase, bonus: critBonusPct, mult: (1 + critBonusPct / 100).toFixed(2), total: c.critTotalPct })}
          >
            <p className="text-[12px] text-zinc-500">{t("Crítico")}</p>
            <p className="font-semibold text-zinc-100 tabular-nums">{c.critTotalPct}% <span className="text-xs font-normal text-zinc-500">x{c.critMult}</span></p>
            {critBonusPct > 0 && (
              <p className="text-[11px] text-zinc-500 tabular-nums">{critBase}% base <span className="text-amber-400/80">+{critBonusPct}%</span></p>
            )}
          </div>
          <div className="rounded-md bg-zinc-800/60 px-2.5 py-1.5">
            <p className="text-[12px] text-zinc-500">{t("Velocidad")}</p>
            <p className="font-semibold text-zinc-100 tabular-nums">{c.velEfectiva}s <span className="text-xs font-normal text-zinc-500">{c.golpesPorSeg} g/s</span></p>
          </div>
        </div>

        <div>
          <p className="text-[12px] uppercase tracking-wider text-zinc-500 mb-1">{t("Por tipo")}</p>
          {types.map(([dt, [min, max]]) => (
            <div key={dt} className="flex items-center justify-between gap-2 py-0.5">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <span className={`w-1.5 h-1.5 rounded-full ${PHYSICAL_DAMAGE_TYPES.includes(dt) ? 'bg-orange-500' : 'bg-blue-500'}`} />
                <DamageIcon type={dt} /> {t(DAMAGE_TYPE_LABELS[dt] || dt)}
                {c.specialDamagePerType[dt] != null && (
                  <span className="text-[11px] text-purple-400" title={t("Daño especial: solo lo reduce el factor de protección (PF)")}>+{c.specialDamagePerType[dt]} {t('esp.')}</span>
                )}
              </span>
              <span className="tabular-nums text-zinc-200">{min} – {max}</span>
            </div>
          ))}
        </div>

        {jewelryEntries.length > 0 && (
          <div>
            <p className="text-[12px] uppercase tracking-wider text-zinc-500 mb-1">{t("Joyería aplicada")}</p>
            <div className="flex flex-wrap gap-1">
              {jewelryEntries.map((dt) => (
                <span key={dt} className="rounded border border-zinc-700 bg-zinc-800/60 px-1.5 py-0.5 text-[12px] text-zinc-300">
                  {t(JEWELRY_BONUS_LABELS[dt])} <span className="text-amber-400 font-semibold">+{jBonus[dt]}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        <details className="group rounded-md border border-zinc-800 bg-zinc-950/40">
          <summary className="cursor-pointer select-none px-2.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 list-none flex items-center justify-between">
            {t("Ver cálculo")}
            <span className="transition-transform group-open:rotate-180">▾</span>
          </summary>
          <div className="px-2.5 pb-2 text-xs">
            <Row label={t('{stat} efectiva', { stat: t(MAIN_STAT_LABELS[p.mainStat]) })} value={p.statEfectivo} />
            <Row label={t("Daño base del arma")} value={`${p.danoBase[0]} – ${p.danoBase[1]}`} />
            <Row label={t("+ Bonus de atributo")} value={`+${p.bonusAtributo}`} className="text-zinc-300" />
            {p.bonusPlano > 0 && <Row label={t("+ Daño del arma (+X)")} value={`+${p.bonusPlano}`} className="text-zinc-300" />}
            {p.especial > 0 && <Row label={<>{t("+ Especial")} <span className="text-zinc-600">{t("(gemas y joyería)")}</span></>} value={`+${p.especial}`} className="text-purple-400" />}
            <Row label={<span className="text-zinc-200 font-semibold">{t("= Daño final")}</span>} value={`${c.danoMin} – ${c.danoMax}`} className="text-zinc-50 font-semibold" />
            <p className="mt-1.5 text-[12px] text-zinc-600">
              {t('Bonus de atributo = ({stat} − 20) × {mult} + Stat Base del arma. Se reparte entre los tipos según su daño máximo.', { stat: t(MAIN_STAT_LABELS[p.mainStat]).toLowerCase(), mult: p.attributeMultiplier })}
            </p>
          </div>
        </details>
      </div>
    </div>
  );
}
