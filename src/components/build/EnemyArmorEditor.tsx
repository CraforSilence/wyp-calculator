'use client';

import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import {
  ALL_DAMAGE_TYPES, DAMAGE_TYPE_LABELS, ARMOR_SLOT_LABELS,
  ARMOR_SLOTS_POR_CLASE, ARMOR_SLOT_ICONS,
} from '@/lib/engine/constants';
import type { ArmorSet, ArmorSlot, ArmorPiece, ProtectionQuality } from '@/types/armor';
import type { Clase } from '@/types/character';

const QUALITY_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'N/A' },
  { value: 'Muy Mala', label: 'Muy Mala' },
  { value: 'Mala', label: 'Mala' },
  { value: 'Normal', label: 'Normal' },
  { value: 'Buena', label: 'Buena' },
  { value: 'Muy Buena', label: 'Muy Buena' },
];

const CLASE_OPTIONS: { value: Clase; label: string }[] = [
  { value: 'Guerrero', label: 'Guerrero' },
  { value: 'Arquero', label: 'Arquero' },
  { value: 'Mago', label: 'Mago' },
];

interface EnemyArmorEditorProps {
  armorSet: ArmorSet;
  enemyClase: Clase;
  onChangeClase: (clase: Clase) => void;
  onUpdateSlot: (slot: ArmorSlot, updates: Partial<ArmorPiece>) => void;
  onUpdateSet: (updates: Partial<Omit<ArmorSet, 'pieces'>>) => void;
}

function makeEmptyPiece(slot: ArmorSlot): ArmorPiece {
  return { slot, pba: 0, bcmt: 0, protectionFactors: {}, bonusProteccionPct: {}, bonuses: [] };
}

export function EnemyArmorEditor({ armorSet, enemyClase, onChangeClase, onUpdateSlot, onUpdateSet }: EnemyArmorEditorProps) {
  const slots = ARMOR_SLOTS_POR_CLASE[enemyClase];

  return (
    <div className="space-y-3">
      <div className="w-40">
        <Select
          label="Clase enemigo"
          value={enemyClase}
          onChange={(e) => onChangeClase(e.target.value as Clase)}
          options={CLASE_OPTIONS}
        />
      </div>

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
                    value={piece.pba}
                    onChange={(e) => onUpdateSlot(slot, { pba: Number(e.target.value) })}
                  />
                  <Input
                    label="BCMT" type="number" min={0}
                    value={piece.bcmt}
                    onChange={(e) => onUpdateSlot(slot, { bcmt: Number(e.target.value) })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {ALL_DAMAGE_TYPES.map((t) => (
                    <Select
                      key={t}
                      label={DAMAGE_TYPE_LABELS[t]}
                      value={piece.protectionFactors[t] || ''}
                      onChange={(e) => {
                        const val = e.target.value as ProtectionQuality | '';
                        const factors = { ...piece.protectionFactors };
                        if (val) factors[t] = val as ProtectionQuality;
                        else delete factors[t];
                        onUpdateSlot(slot, { protectionFactors: factors });
                      }}
                      options={QUALITY_OPTIONS}
                    />
                  ))}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modificadores enemigos */}
      <Card title="Modificadores enemigo">
        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Armadura %" type="number" min={0} max={100}
            value={armorSet.bonusArmaduraPct}
            onChange={(e) => onUpdateSet({ bonusArmaduraPct: Number(e.target.value) })}
          />
          <Input
            label="Res. Fisica %" type="number" min={0} max={100}
            value={armorSet.generalResistance.fisico}
            onChange={(e) => onUpdateSet({ generalResistance: { ...armorSet.generalResistance, fisico: Number(e.target.value) } })}
          />
          <Input
            label="Res. Magica %" type="number" min={0} max={100}
            value={armorSet.generalResistance.magico}
            onChange={(e) => onUpdateSet({ generalResistance: { ...armorSet.generalResistance, magico: Number(e.target.value) } })}
          />
        </div>
      </Card>
    </div>
  );
}
