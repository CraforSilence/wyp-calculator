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
  for (const t of ALL_DAMAGE_TYPES) protectionFactors[t] = 'Normal';
  return { slot, pba: 0, bcmt: 0, protectionFactors, bonusProteccionPct: {}, bonuses: [], upgrades: [] };
}

export function EnemyArmorEditor({ armorSet, enemyClase, enemySubclase, onChangeClase, onChangeSubclase, onUpdateSlot, onUpdateSet, onLoadPreset }: EnemyArmorEditorProps) {
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
            label="Clase"
            tooltip="Clase del enemigo. Determina las piezas de armadura disponibles."
            value={enemyClase}
            onChange={(e) => onChangeClase(e.target.value as Clase)}
            options={CLASE_OPTIONS}
          />
        </div>
        <div className="w-36">
          <Select
            label="Subclase"
            tooltip="Subclase del enemigo. Determina el multiplicador de Clase de Armadura (CA)."
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
                label="Cargar set"
                tooltip="Carga un set de armadura predefinido para esta subclase."
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
                    title={isEditing ? 'Cerrar el formulario' : 'Editar esta pieza'}
                  >
                    {isEditing ? 'Listo' : 'Editar'}
                  </button>
                )}
              </span>
            } className={isEditing ? 'border-amber-600/60' : isEmpty ? 'border-dashed' : ''}>
              {!isEditing && !isEmpty ? (
                <ArmorPieceSummary piece={piece} />
              ) : !isEditing ? (
                <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
                  <span className="text-xs text-zinc-500">Pieza vacía</span>
                  <button
                    onClick={() => setSlotEditing(slot, true)}
                    className="text-xs text-amber-400 hover:text-amber-300 border border-amber-600/50 hover:bg-amber-400/10 px-3 py-1.5 rounded transition-colors"
                  >
                    + Cargar a mano
                  </button>
                </div>
              ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="PBA" type="number" min={0}
                    tooltip="Puntos Base de Armadura. Valor base de la pieza antes de aplicar calidades."
                    value={piece.pba}
                    onChange={(e) => onUpdateSlot(slot, { pba: Number(e.target.value) })}
                  />
                  <Input
                    label="BCMT" type="number" min={0}
                    tooltip="Bonus Calidad-Material-Tipo. Proteccion fija adicional que se suma despues de los calculos."
                    value={piece.bcmt}
                    onChange={(e) => onUpdateSlot(slot, { bcmt: Number(e.target.value) })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {DAMAGE_TYPES_PAIRED.map((t) => (
                    <div key={t} className="flex items-center gap-1.5">
                      <span className="text-sm shrink-0" title={DAMAGE_TYPE_LABELS[t]}>{DAMAGE_TYPE_ICONS[t]}</span>
                      <select
                        className={`flex-1 min-w-0 rounded border px-2 py-1.5 text-xs focus:outline-none focus:border-amber-500 transition-colors ${piece.protectionFactors[t] ? QUALITY_STYLES[piece.protectionFactors[t] as ProtectionQuality] : 'bg-zinc-800 border-zinc-700 text-zinc-100'}`}
                        value={piece.protectionFactors[t] || ''}
                        title={`${DAMAGE_TYPE_LABELS[t]}: Factor de proteccion`}
                        onChange={(e) => {
                          const val = e.target.value as ProtectionQuality | '';
                          const factors = { ...piece.protectionFactors };
                          if (val) factors[t] = val as ProtectionQuality;
                          else delete factors[t];
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
                    Cancelar
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
        title={<span>Modificadores enemigo<HelpTip text="Bonificadores adicionales del enemigo: resistencias, barrera magica y reducciones de dano." /></span>}
        armorSet={armorSet}
      >
        <div className="space-y-3 mt-3">
          {/* Armadura % + Resistencias generales */}
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Armadura %" type="number" min={0} max={100}
              tooltip="Bonus % de armadura por habilidades. Multiplica la proteccion total."
              value={armorSet.bonusArmaduraPct}
              onChange={(e) => onUpdateSet({ bonusArmaduraPct: Number(e.target.value) })}
            />
            <Input
              label="Res. Fisica %" type="number" min={0} max={100}
              tooltip="Resistencia fisica general. Reduce TODO el dano fisico despues de armadura."
              value={armorSet.generalResistance.fisico}
              onChange={(e) => onUpdateSet({ generalResistance: { ...armorSet.generalResistance, fisico: Number(e.target.value) } })}
            />
            <Input
              label="Res. Magica %" type="number" min={0} max={100}
              tooltip="Resistencia magica general. Reduce TODO el dano magico despues de armadura."
              value={armorSet.generalResistance.magico}
              onChange={(e) => onUpdateSet({ generalResistance: { ...armorSet.generalResistance, magico: Number(e.target.value) } })}
            />
          </div>

          {/* Resistencia por tipo */}
          <div>
            <p className="text-xs text-zinc-500 mb-1">
              Resistencia por tipo %
              <HelpTip text="Resistencia especifica por tipo de dano. Se aplica despues de la resistencia general." />
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {ALL_DAMAGE_TYPES.map((t) => (
                <Input
                  key={t}
                  label={`${DAMAGE_TYPE_ICONS[t]} ${DAMAGE_TYPE_LABELS[t]}`}
                  type="number" min={0} max={100}
                  value={armorSet.typeResistance[t] ?? 0}
                  onChange={(e) => onUpdateSet({
                    typeResistance: { ...armorSet.typeResistance, [t]: Number(e.target.value) },
                  })}
                />
              ))}
            </div>
          </div>

          {/* Barrera magica */}
          <div>
            <p className="text-xs text-zinc-500 mb-1">
              Barrera magica (puntos)
              <HelpTip text="Puntos de barrera que absorben dano directamente. Se resta del dano final por tipo." />
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {ALL_DAMAGE_TYPES.map((t) => (
                <Input
                  key={t}
                  label={`${DAMAGE_TYPE_ICONS[t]} ${DAMAGE_TYPE_LABELS[t]}`}
                  type="number" min={0}
                  value={armorSet.barrierPoints[t] ?? 0}
                  onChange={(e) => onUpdateSet({
                    barrierPoints: { ...armorSet.barrierPoints, [t]: Number(e.target.value) },
                  })}
                />
              ))}
            </div>
          </div>

          {/* Reduccion melee/ranged */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Reduccion Melee %" type="number" min={0} max={100}
              tooltip="Reduce el dano final de ataques cuerpo a cuerpo (espadas, mazas, etc.)."
              value={armorSet.meleeDmgReductionPct}
              onChange={(e) => onUpdateSet({ meleeDmgReductionPct: Number(e.target.value) })}
            />
            <Input
              label="Reduccion Ranged %" type="number" min={0} max={100}
              tooltip="Reduce el dano final de ataques a distancia (arcos, baculos)."
              value={armorSet.rangedDmgReductionPct}
              onChange={(e) => onUpdateSet({ rangedDmgReductionPct: Number(e.target.value) })}
            />
          </div>
        </div>
      </ArmorModifiersSection>
    </div>
  );
}
