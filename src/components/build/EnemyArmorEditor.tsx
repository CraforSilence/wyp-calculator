'use client';

import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { HelpTip } from '@/components/ui/HelpTip';
import {
  ALL_DAMAGE_TYPES, DAMAGE_TYPE_LABELS, DAMAGE_TYPE_ICONS, ARMOR_SLOT_LABELS,
  ARMOR_SLOTS_POR_CLASE, ARMOR_SLOT_ICONS, CLASE_SUBCLASES,
  PHYSICAL_DAMAGE_TYPES, MAGICAL_DAMAGE_TYPES,
} from '@/lib/engine/constants';
import { ARMOR_PRESETS } from '@/data/armor-presets';
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
  const slots = ARMOR_SLOTS_POR_CLASE[enemyClase];
  const subclaseOptions = CLASE_SUBCLASES[enemyClase].map((sc) => ({ value: sc, label: sc }));

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
        {ARMOR_PRESETS.length > 0 && onLoadPreset && (
          <div className="flex-1 min-w-[180px]">
            <Select
              label="Cargar precargado"
              tooltip="Carga una configuracion de armadura predefinida."
              value=""
              onChange={(e) => {
                const preset = ARMOR_PRESETS.find((p) => p.id === e.target.value);
                if (preset) onLoadPreset(preset.armorSet, preset.clase, preset.subclase);
              }}
              options={[
                { value: '', label: 'Seleccionar...' },
                ...ARMOR_PRESETS.map((p) => ({ value: p.id, label: `${p.nombre} (${p.subclase})` })),
              ]}
            />
          </div>
        )}
      </div>

      {/* Piezas de armadura */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {slots.map((slot) => {
          const piece = armorSet.pieces[slot] || makeEmptyPiece(slot);
          const isEmpty = piece.pba === 0;

          return (
            <Card key={slot} title={
              <span className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-zinc-700 bg-zinc-800 p-1"><img src={ARMOR_SLOT_ICONS[slot]} alt={ARMOR_SLOT_LABELS[slot]} className="w-full h-full object-contain" /></span>
                {ARMOR_SLOT_LABELS[slot]}
              </span>
            } className={isEmpty ? 'opacity-60' : ''}>
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
                        className="flex-1 min-w-0 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 transition-colors"
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
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modificadores enemigos */}
      <Card title={<span>Modificadores enemigo<HelpTip text="Bonificadores adicionales del enemigo: resistencias, barrera magica y reducciones de dano." /></span>}>
        <div className="space-y-3">
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
      </Card>
    </div>
  );
}
