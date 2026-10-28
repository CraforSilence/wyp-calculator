'use client';

import { useMemo } from 'react';
import { useCharacter } from '@/hooks/useCharacter';
import { useArmor } from '@/hooks/useArmor';
import { calcTotalProtection, filterArmorForSubclase } from '@/lib/engine/armor';
import {
  ARMOR_CLASSES, ALL_DAMAGE_TYPES, DAMAGE_TYPE_LABELS,
  PHYSICAL_DAMAGE_TYPES, ARMOR_SLOT_LABELS, CLASE_SUBCLASES,
  ARMOR_BONUS_TYPES, ARMOR_BONUS_LABELS, ARMOR_SLOT_LABEL_OVERRIDES,
} from '@/lib/engine/constants';
import { Card } from '@/components/ui/Card';
import type { ArmorSlot, ArmorBonusType } from '@/types/armor';
import type { Clase } from '@/types/character';
import { useT } from '@/i18n/I18nProvider';
import { DamageIcon } from '@/components/icons/StatIcons';

function getClase(subclase: string): Clase {
  for (const [clase, subs] of Object.entries(CLASE_SUBCLASES)) {
    if ((subs as string[]).includes(subclase)) return clase as Clase;
  }
  return 'Guerrero';
}

function aggregateArmorBonuses(armorSet: ReturnType<typeof useArmor>['armorSet']): Partial<Record<ArmorBonusType, number>> {
  const totals: Partial<Record<ArmorBonusType, number>> = {};
  for (const piece of Object.values(armorSet.pieces)) {
    if (!piece) continue;
    for (const bonus of piece.bonuses || []) {
      totals[bonus.type] = (totals[bonus.type] || 0) + bonus.value;
    }
  }
  return totals;
}

export function BuildProtecciones() {
  const t = useT();
  const { character } = useCharacter();
  const { armorSet: storedArmorSet } = useArmor();

  const clase = getClase(character.subclase);
  const armorClass = ARMOR_CLASSES[character.subclase];
  const armorSet = useMemo(() => filterArmorForSubclase(storedArmorSet, character.subclase), [storedArmorSet, character.subclase]);

  const protection = useMemo(() => {
    return calcTotalProtection(armorSet, armorClass);
  }, [armorSet, armorClass]);

  const pieceCount = Object.keys(armorSet.pieces).filter((s) => {
    const p = armorSet.pieces[s as ArmorSlot];
    return p && p.pba > 0;
  }).length;

  const bonusTotals = useMemo(() => aggregateArmorBonuses(armorSet), [armorSet]);
  const hasBonusTotals = Object.values(bonusTotals).some((v) => v && v > 0);

  if (pieceCount === 0) {
    return (
      <p className="text-sm text-zinc-500">
        Configura piezas de armadura en la seccion &quot;Armadura&quot; para ver las protecciones.
      </p>
    );
  }

  const maxProt = Math.max(...Object.values(protection.perType), 1);

  return (
    <div className="space-y-4">
      {/* Header info */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-zinc-200 font-semibold">{clase}</span>
        <span className="text-zinc-600">&middot;</span>
        <span className="text-zinc-400">{t(character.subclase)}</span>
        <span className="text-zinc-600">&middot;</span>
        <span className="text-zinc-500">{pieceCount} piezas</span>
        <span className="text-zinc-600">&middot;</span>
        <span className="text-zinc-500">CA: {armorClass}</span>
      </div>

      {/* Proteccion por tipo de dano. En pantallas grandes ya esta en el panel fijo. */}
      <Card title={t('Protección por Tipo de Daño')} className="lg:hidden">
        <div className="space-y-3">
          {ALL_DAMAGE_TYPES.map((dt) => {
            const val = protection.perType[dt] || 0;
            const pct = (val / maxProt) * 100;
            const isPhysical = PHYSICAL_DAMAGE_TYPES.includes(dt);

            return (
              <div key={dt}>
                <div className="flex items-center justify-between text-sm mb-0.5">
                  <span className="text-zinc-300"><DamageIcon type={dt} /> {t(DAMAGE_TYPE_LABELS[dt])}</span>
                  <span className={`font-bold ${val > 0 ? (isPhysical ? 'text-orange-400' : 'text-blue-400') : 'text-zinc-600'}`}>
                    {Math.round(val)}
                  </span>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isPhysical ? 'bg-orange-600' : 'bg-blue-600'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Proteccion por pieza */}
      <Card title={t("Detalle por Pieza")}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-zinc-500 border-b border-zinc-800">
                <th className="text-left py-1.5 pr-2 font-medium">{t("Pieza")}</th>
                {ALL_DAMAGE_TYPES.map((dt) => (
                  <th key={dt} className="text-right py-1.5 px-1 font-medium" title={t(DAMAGE_TYPE_LABELS[dt])}><DamageIcon type={dt} title={t(DAMAGE_TYPE_LABELS[dt])} /></th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(protection.perPiece).map(([slot, values]) => (
                <tr key={slot} className="border-b border-zinc-800/50">
                  <td className="py-1.5 pr-2 text-zinc-300">{ARMOR_SLOT_LABEL_OVERRIDES[clase]?.[slot as ArmorSlot] ?? ARMOR_SLOT_LABELS[slot as ArmorSlot] ?? slot}</td>
                  {ALL_DAMAGE_TYPES.map((dt) => {
                    const v = values[dt] || 0;
                    const isPhysical = PHYSICAL_DAMAGE_TYPES.includes(dt);
                    return (
                      <td key={dt} className={`text-right py-1.5 px-1 ${v > 0 ? (isPhysical ? 'text-orange-400' : 'text-blue-400') : 'text-zinc-700'}`}>
                        {v > 0 ? Math.round(v) : '-'}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr className="font-semibold">
                <td className="py-1.5 pr-2 text-zinc-200">{t("Total")}</td>
                {ALL_DAMAGE_TYPES.map((dt) => {
                  const v = protection.perType[dt] || 0;
                  const isPhysical = PHYSICAL_DAMAGE_TYPES.includes(dt);
                  return (
                    <td key={dt} className={`text-right py-1.5 px-1 ${v > 0 ? (isPhysical ? 'text-orange-400' : 'text-blue-400') : 'text-zinc-700'}`}>
                      {Math.round(v)}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Resistencias y reducciones */}
      <Card title={t("Resistencias y Reducciones")}>
        <div className="space-y-3">
          {/* Generales */}
          <div>
            <p className="text-xs text-zinc-500 mb-1">{t("Generales")}</p>
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
              {armorSet.bonusArmaduraPct > 0 && (
                <div>
                  <span className="text-zinc-400">{t("Armadura %:")}</span>{' '}
                  <span className="text-amber-400 font-semibold">+{armorSet.bonusArmaduraPct}%</span>
                </div>
              )}
              {armorSet.generalResistance.fisico > 0 && (
                <div>
                  <span className="text-zinc-400">{t('Res. Física:')}</span>{' '}
                  <span className="text-orange-400 font-semibold">{armorSet.generalResistance.fisico}%</span>
                </div>
              )}
              {armorSet.generalResistance.magico > 0 && (
                <div>
                  <span className="text-zinc-400">{t('Res. Mágica:')}</span>{' '}
                  <span className="text-blue-400 font-semibold">{armorSet.generalResistance.magico}%</span>
                </div>
              )}
              {armorSet.meleeDmgReductionPct > 0 && (
                <div>
                  <span className="text-zinc-400">{t("Red. Melee:")}</span>{' '}
                  <span className="text-amber-400 font-semibold">{armorSet.meleeDmgReductionPct}%</span>
                </div>
              )}
              {armorSet.rangedDmgReductionPct > 0 && (
                <div>
                  <span className="text-zinc-400">{t("Red. Rango:")}</span>{' '}
                  <span className="text-amber-400 font-semibold">{armorSet.rangedDmgReductionPct}%</span>
                </div>
              )}
              {armorSet.bonusArmaduraPct === 0
                && armorSet.generalResistance.fisico === 0
                && armorSet.generalResistance.magico === 0
                && armorSet.meleeDmgReductionPct === 0
                && armorSet.rangedDmgReductionPct === 0 && (
                <span className="text-xs text-zinc-600">{t("Sin modificadores generales configurados")}</span>
              )}
            </div>
          </div>

          {/* Resistencia por tipo */}
          {Object.values(armorSet.typeResistance).some((v) => v && v > 0) && (
            <div>
              <p className="text-xs text-zinc-500 mb-1">{t("Resistencia por Tipo")}</p>
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
                {ALL_DAMAGE_TYPES.filter((dt) => (armorSet.typeResistance[dt] || 0) > 0).map((dt) => {
                  const isPhysical = PHYSICAL_DAMAGE_TYPES.includes(dt);
                  return (
                    <div key={dt}>
                      <span className="text-zinc-400">{t(DAMAGE_TYPE_LABELS[dt])}:</span>{' '}
                      <span className={`font-semibold ${isPhysical ? 'text-orange-400' : 'text-blue-400'}`}>
                        {armorSet.typeResistance[dt]}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Barrera magica */}
          {Object.values(armorSet.barrierPoints).some((v) => v && v > 0) && (
            <div>
              <p className="text-xs text-zinc-500 mb-1">{t('Barrera Mágica')}</p>
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
                {ALL_DAMAGE_TYPES.filter((dt) => (armorSet.barrierPoints[dt] || 0) > 0).map((dt) => (
                  <div key={dt}>
                    <span className="text-zinc-400">{t(DAMAGE_TYPE_LABELS[dt])}:</span>{' '}
                    <span className="text-purple-400 font-semibold">{armorSet.barrierPoints[dt]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Bonus totales de armadura */}
      {hasBonusTotals && (
        <Card title={t("Bonus Totales de Armadura")}>
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
            {ARMOR_BONUS_TYPES.filter((dt) => bonusTotals[dt]).map((dt) => (
              <div key={dt}>
                <span className="text-zinc-400">{t(ARMOR_BONUS_LABELS[dt])}:</span>{' '}
                <span className="text-amber-400 font-semibold">+{bonusTotals[dt]}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
