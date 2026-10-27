'use client';

import { useState } from 'react';
import type { ArmorSet } from '@/types/armor';
import { useT } from '@/i18n/I18nProvider';

/** Cuantos modificadores del set tienen un valor distinto de 0. */
export function countActiveModifiers(armorSet: ArmorSet): number {
  const values = [
    armorSet.bonusArmaduraPct,
    armorSet.generalResistance.fisico,
    armorSet.generalResistance.magico,
    armorSet.meleeDmgReductionPct,
    armorSet.rangedDmgReductionPct,
    ...Object.values(armorSet.typeResistance),
    ...Object.values(armorSet.barrierPoints),
  ];
  return values.filter((v) => Number(v) > 0).length;
}

interface ArmorModifiersSectionProps {
  title: React.ReactNode;
  armorSet: ArmorSet;
  children: React.ReactNode;
  className?: string;
}

/**
 * Modificadores de armadura (buffs, resistencias, barrera) plegados por defecto: casi nadie
 * los usa y son muchos campos. Arranca abierto si ya hay alguno cargado.
 */
export function ArmorModifiersSection({ title, armorSet, children, className = '' }: ArmorModifiersSectionProps) {
  const t = useT();
  const active = countActiveModifiers(armorSet);
  const [open, setOpen] = useState(active > 0);

  return (
    <div className={`bg-zinc-900 border border-zinc-800 rounded-lg ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-zinc-800/50 transition-colors rounded-lg"
      >
        <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 min-w-0">
          <span className="text-sm font-semibold text-zinc-200">{title}</span>
          <span className="text-[12px] uppercase tracking-wider text-zinc-500">{t("Avanzado")}</span>
          {active > 0 ? (
            <span className="rounded-full bg-amber-500/15 border border-amber-600/40 px-2 py-0.5 text-[12px] text-amber-400">
              {active} {active === 1 ? t("activo") : t("activos")}
            </span>
          ) : (
            <span className="text-[12px] text-zinc-600">{t("sin cambios")}</span>
          )}
        </span>
        <svg
          className={`w-4 h-4 shrink-0 text-zinc-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className={`grid transition-[grid-template-rows] duration-200 ease-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden min-h-0">
          <div className="px-4 pb-4 pt-1 border-t border-zinc-800">{children}</div>
        </div>
      </div>
    </div>
  );
}
