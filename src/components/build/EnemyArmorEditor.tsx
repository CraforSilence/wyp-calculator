'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { HelpTip } from '@/components/ui/HelpTip';
import {
  ALL_DAMAGE_TYPES, DAMAGE_TYPE_LABELS, DAMAGE_TYPE_ICONS, ARMOR_SLOT_LABELS,
  armorSlotsFor, ARMOR_SLOT_ICONS, CLASE_SUBCLASES,
  PHYSICAL_DAMAGE_TYPES, MAGICAL_DAMAGE_TYPES, ARMOR_SLOT_LABEL_OVERRIDES,
} from '@/lib/engine/constants';
import { filterArmorForSubclase, setBonusesFor } from '@/lib/engine/armor';
import { DEFAULT_ARMOR_SETS } from '@/data/default-armor';
import { ArmorPieceSummary, QUALITY_STYLES } from '@/components/armor/ArmorPieceSummary';
import { ArmorModifiersSection } from '@/components/armor/ArmorModifiersSection';
import type { ArmorSet, ArmorSlot, ArmorPiece, ProtectionQuality } from '@/types/armor';
import type { Clase, Subclase } from '@/types/character';
import { useT } from '@/i18n/I18nProvider';

const QUALITY_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'N/A' },
  { value: 'Muy Mala', label: 'Muy Mala' },
  { value: 'Mala', label: 'Mala' },
  { value: 'Normal', label: 'Normal' },
  { value: 'Buena', label: 'Buena' },
  { value: 'Muy Buena', label: 'Muy Buena' },
];

// Orden intercalado: físicos a la izquierda, mágicos a la derecha en grid-cols-2
const DAMAGE_TYPES_PAIRED = PHYSICAL_DAMAGE_TYPES.flatMap((p, i) => [p, MAGICAL_DAMAGE_TYPES[i]]);

const CLASE_OPTIONS: { value: Clase; label: string }[] = [
  { value: 'Guerrero', label: 'Guerrero' },
  { value: 'Arquero', label: 'Arquero' },
  { value: 'Mago', label: 'Mago' },
];

interface EnemyArmorEditorProps {
  armorSet: ArmorSet;
  enemyClase: Clase;
  enemySubclase: Subclase;
  onChangeClase: (clase: Clase) => void;
  onChangeSubclase: (subclase: Subclase) => void;
  onUpdateSlot: (slot: ArmorSlot, updates: Partial<ArmorPiece>) => void;
  onUpdateSet: (updates: Partial<Omit<ArmorSet, 'pieces'>>) => void;
  onLoadPreset?: (armorSet: ArmorSet, clase: Clase, subclase: Subclase) => void;
}

function makeEmptyPiece(slot: ArmorSlot): ArmorPiece {
  const protectionFactors: Record<string, string> = {};
  for (const dt of ALL_DAMAGE_TYPES) protectionFactors[dt] = 'Normal';
  return { slot, pba: 0, bcmt: 0, protectionFactors, bonusProteccionPct: {}, bonuses: [], upgrades: [] };
}

export function EnemyArmorEditor({ armorSet, enemyClase, enemySubclase, onChangeClase, onChangeSubclase, onUpdateSlot, onUpdateSet, onLoadPreset }: EnemyArmorEditorProps) {
  const t = useT();
  const slots = armorSlotsFor(enemyClase, enemySubclase);
  const subclaseOptions = CLASE_SUBCLASES[enemyClase].map((sc) => ({ value: sc, label: sc }));
  // Piezas con el formulario abierto; el resto se ve como resumen
  const [editing, setEditing] = useState<Set<ArmorSlot>>(new Set());
  const setSlotEditing = (slot: ArmorSlot, on: boolean) => setEditing((prev) => {
    const next = new Set(prev);
    if (on) next.add(slot); else next.delete(slot);
    return next;
  });

  return (
    <div className="space-y-3">
      {/* Clase + Subclase + Preset */}
      <div className="flex gap-3 flex-wrap items-end">
        <div className="w-36">
          <Select
            label={t("Clase")}
            tooltip={t("Clase del enemigo. Determina las piezas de armadura disponibles.")}
            value={enemyClase}
            onChange={(e) => onChangeClase(e.target.value as Clase)}
            options={CLASE_OPTIONS}
          />
        </div>
        <div className="w-36">
          <Select
            label={t("Subclase")}
            tooltip={t("Subclase del enemigo. Determina el multiplicador de Clase de Armadura (CA).")}
            value={enemySubclase}
            onChange={(e) => onChangeSubclase(e.target.value as Subclase)}
            options={subclaseOptions}
          />
        </div>
        {onLoadPreset && (() => {
          const filteredSets = DEFAULT_ARMOR_SETS.filter((s) =>
            s.clase === enemyClase && (!s.subclase || s.subclase === enemySubclase)
          );
          return filteredSets.length > 0 ? (
            <div className="flex-1 min-w-[180px]">
              <Select
                label={t("Cargar set")}
                tooltip={t("Carga un set de armadura predefinido para esta subclase.")}
                value=""
                onChange={(e) => {
                  const set = DEFAULT_ARMOR_SETS.find((s) => s.id === e.target.value);
                  if (!set) return;
                  const subclase = (set.subclase || enemySubclase) as Subclase;
                  const armorSet: ArmorSet = filterArmorForSubclase({
                    pieces: { ...set.pieces },
                    bonusArmaduraPct: 0,
                    generalResistance: { fisico: 0, magico: 0 },
                    typeResistance: {},
                    barrierPoints: {},
                    meleeDmgReductionPct: 0,
                    rangedDmgReductionPct: 0,
                    bonusConjunto: setBonusesFor(set, subclase),
                  }, subclase);
                  onLoadPreset(armorSet, set.clase as Clase, subclase);
                }}
                options={[
                  { value: '', label: 'Seleccionar set...' },
                  ...filteredSets.map((s) => ({ value: s.id, label: s.nombre })),
                ]}
              />
            </div>
          ) : null;
        })()}
      </div>

      {/* Piezas de armadura */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {slots.map((slot) => {
          const piece = armorSet.pieces[slot] || makeEmptyPiece(slot);
          const isEmpty = piece.pba === 0;
          const isEditing = editing.has(slot);
          const slotLabel = ARMOR_SLOT_LABEL_OVERRIDES[enemyClase]?.[slot] ?? ARMOR_SLOT_LABELS[slot];

          return (
            <Card key={slot} title={
              <span className="flex items-center justify-between w-full gap-2">
                <span className="flex items-center gap-2 min-w-0">
                  <span className="inline-flex shrink-0 items-center justify-center w-10 h-10 rounded-lg border border-zinc-700 bg-zinc-800 p-1"><img src={ARMOR_SLOT_ICONS[slot]} alt={slotLabel} className="w-full h-full object-contain" /></span>
                  <span className="truncate">{slotLabel}</span>
                </span>
                {!isEmpty && (
                  <button
                    onClick={() => setSlotEditing(slot, !isEditing)}
                    className={`shrink-0 text-xs font-normal px-2 py-1 rounded transition-colors ${isEditing ? 'bg-amber-600 text-white hover:bg-amber-500' : 'text-amber-400 hover:text-amber-300 hover:bg-amber-400/10'}`}
                    title={isEditing ? t("Cerrar el formulario") : t("Editar esta pieza")}
                  >
                    {isEditing ? t("Listo") : t("Editar")}
                  </button>
                )}
              </span>
            } className={isEditing ? 'border-amber-600/60' : isEmpty ? 'border-dashed' : ''}>
              {!isEditing && !isEmpty ? (
                <ArmorPieceSummary piece={piece} />
              ) : !isEditing ? (
                <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
                  <span className="text-xs text-zinc-500">{t("Pieza vacía")}</span>
                  <button
                    onClick={() => setSlotEditing(slot, true)}
                    className="text-xs text-amber-400 hover:text-amber-300 border border-amber-600/50 hover:bg-amber-400/10 px-3 py-1.5 rounded transition-colors"
                  >
                    {t("+ Cargar a mano")}
                  </button>
                </div>
              ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label={t("PBA")} type="number" min={0}
                    tooltip={t("Puntos Base de Armadura. Valor base de la pieza antes de aplicar calidades.")}
                    value={piece.pba}
                    onChange={(e) => onUpdateSlot(slot, { pba: Number(e.target.value) })}
                  />
                  <Input
                    label={t("BCMT")} type="number" min={0}
                    tooltip={t('Bonus Calidad-Material-Tipo. Protección fija adicional que se suma después de los cálculos.')}
                    value={piece.bcmt}
                    onChange={(e) => onUpdateSlot(slot, { bcmt: Number(e.target.value) })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {DAMAGE_TYPES_PAIRED.map((dt) => (
                    <div key={dt} className="flex items-center gap-1.5">
                      <span className="text-sm shrink-0" title={t(DAMAGE_TYPE_LABELS[dt])}>{DAMAGE_TYPE_ICONS[dt]}</span>
                      <select
                        className={`flex-1 min-w-0 rounded border px-2 py-1.5 text-xs focus:outline-none focus:border-amber-500 transition-colors ${piece.protectionFactors[dt] ? QUALITY_STYLES[piece.protectionFactors[dt] as ProtectionQuality] : 'bg-zinc-800 border-zinc-700 text-zinc-100'}`}
                        value={piece.protectionFactors[dt] || ''}
                        title={`${t(DAMAGE_TYPE_LABELS[dt])}: ${t('Factor de protección')}`}
                        onChange={(e) => {
                          const val = e.target.value as ProtectionQuality | '';
                          const factors = { ...piece.protectionFactors };
                          if (val) factors[dt] = val as ProtectionQuality;
                          else delete factors[dt];
                          onUpdateSlot(slot, { protectionFactors: factors });
                        }}
                      >
                        {QUALITY_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value} className="bg-zinc-900 text-zinc-100">{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
                {isEmpty && (
                  <button
                    onClick={() => setSlotEditing(slot, false)}
                    className="w-full text-xs text-zinc-400 hover:text-zinc-200 py-1"
                  >
                    {t("Cancelar")}
                  </button>
                )}
              </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Modificadores enemigos */}
      <ArmorModifiersSection
        title={<span>{t("Modificadores enemigo")}<HelpTip text={t('Bonificadores adicionales del enemigo: resistencias, barrera mágica y reducciones de daño.')} /></span>}
        armorSet={armorSet}
      >
        <div className="space-y-3 mt-3">
          {/* Armadura % + Resistencias generales */}
          <div className="grid grid-cols-3 gap-3">
            <Input
              label={t("Armadura %")} type="number" min={0} max={100}
              tooltip={t('Bonus % de armadura por habilidades. Multiplica la protección total.')}
              value={armorSet.bonusArmaduraPct}
              onChange={(e) => onUpdateSet({ bonusArmaduraPct: Number(e.target.value) })}
            />
            <Input
              label={t('Res. Física %')} type="number" min={0} max={100}
              tooltip={t('Resistencia física general. Reduce TODO el daño físico después de la armadura.')}
              value={armorSet.generalResistance.fisico}
              onChange={(e) => onUpdateSet({ generalResistance: { ...armorSet.generalResistance, fisico: Number(e.target.value) } })}
            />
            <Input
              label={t('Res. Mágica %')} type="number" min={0} max={100}
              tooltip={t('Resistencia mágica general. Reduce TODO el daño mágico después de la armadura.')}
              value={armorSet.generalResistance.magico}
              onChange={(e) => onUpdateSet({ generalResistance: { ...armorSet.generalResistance, magico: Number(e.target.value) } })}
            />
          </div>

          {/* Resistencia por tipo */}
          <div>
            <p className="text-xs text-zinc-500 mb-1">
              {t("Resistencia por tipo %")}
              <HelpTip text={t('Resistencia específica por tipo de daño. Se aplica después de la resistencia general.')} />
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {ALL_DAMAGE_TYPES.map((dt) => (
                <Input
                  key={dt}
                  label={`${DAMAGE_TYPE_ICONS[dt]} ${t(DAMAGE_TYPE_LABELS[dt])}`}
                  type="number" min={0} max={100}
                  value={armorSet.typeResistance[dt] ?? 0}
                  onChange={(e) => onUpdateSet({
                    typeResistance: { ...armorSet.typeResistance, [dt]: Number(e.target.value) },
                  })}
                />
              ))}
            </div>
          </div>

          {/* Barrera magica */}
          <div>
            <p className="text-xs text-zinc-500 mb-1">
              {t('Barrera mágica (puntos)')}
              <HelpTip text={t('Puntos de barrera que absorben daño directamente. Se resta del daño final por tipo.')} />
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {ALL_DAMAGE_TYPES.map((dt) => (
                <Input
                  key={dt}
                  label={`${DAMAGE_TYPE_ICONS[dt]} ${t(DAMAGE_TYPE_LABELS[dt])}`}
                  type="number" min={0}
                  value={armorSet.barrierPoints[dt] ?? 0}
                  onChange={(e) => onUpdateSet({
                    barrierPoints: { ...armorSet.barrierPoints, [dt]: Number(e.target.value) },
                  })}
                />
              ))}
            </div>
          </div>

          {/* Reduccion melee/ranged */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('Reducción Melee %')} type="number" min={0} max={100}
              tooltip={t('Reduce el daño final de ataques cuerpo a cuerpo (espadas, mazas, etc.).')}
              value={armorSet.meleeDmgReductionPct}
              onChange={(e) => onUpdateSet({ meleeDmgReductionPct: Number(e.target.value) })}
            />
            <Input
              label={t('Reducción Rango %')} type="number" min={0} max={100}
              tooltip={t('Reduce el daño final de ataques a distancia (arcos, báculos).')}
              value={armorSet.rangedDmgReductionPct}
              onChange={(e) => onUpdateSet({ rangedDmgReductionPct: Number(e.target.value) })}
            />
          </div>
        </div>
      </ArmorModifiersSection>
    </div>
  );
}
