'use client';

import { useMemo } from 'react';
import { useCharacter } from '@/hooks/useCharacter';
import { useArmor } from '@/hooks/useArmor';
import { calcTotalProtection } from '@/lib/engine/armor';
import {
  ARMOR_CLASSES, ALL_DAMAGE_TYPES, DAMAGE_TYPE_LABELS, DAMAGE_TYPE_ICONS, ARMOR_SLOT_LABELS,
  PHYSICAL_DAMAGE_TYPES, MAGICAL_DAMAGE_TYPES, ARMOR_SLOTS_POR_CLASE, CLASE_SUBCLASES,
  ARMOR_BONUS_TYPES, ARMOR_BONUS_LABELS, ARMOR_SLOT_ICONS, SHIELD_ONLY_BONUS_TYPES,
} from '@/lib/engine/constants';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { HelpPopover } from '@/components/ui/HelpPopover';
import type { ArmorSlot, ArmorBonusType, ArmorBonus, ArmorUpgrade, ProtectionQuality } from '@/types/armor';
import type { DamageTypeName } from '@/types/weapon';
import type { Clase } from '@/types/character';

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

const MAX_BONUSES = 5;

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

export function BuildArmadura() {
  const { character } = useCharacter();
  const { armorSet, updateSlot, updateSet } = useArmor();

  const clase = getClase(character.subclase);
  const slots = ARMOR_SLOTS_POR_CLASE[clase];
  const armorClass = ARMOR_CLASSES[character.subclase];

  const protection = useMemo(() => {
    return calcTotalProtection(armorSet, armorClass);
  }, [armorSet, armorClass]);

  const pieceCount = Object.keys(armorSet.pieces).filter((s) => {
    const p = armorSet.pieces[s as ArmorSlot];
    return p && p.pba > 0;
  }).length;

  const bonusTotals = useMemo(() => aggregateArmorBonuses(armorSet), [armorSet]);
  const hasBonusTotals = Object.values(bonusTotals).some((v) => v && v > 0);

  return (
    <div>
      <p className="text-xs text-zinc-500 mb-4">
        {clase} — {pieceCount} piezas configuradas | Clase de Armadura: {armorClass}
      </p>

      {/* Referencia de siglas */}
      <Card className="mb-4">
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
          <div><span className="text-amber-400 font-semibold">PBA</span> <span className="text-zinc-500">— Puntos Base de Armadura. Valor base mostrado en el tooltip del item.</span></div>
          <div><span className="text-amber-400 font-semibold">BCMT</span> <span className="text-zinc-500">— Bonus Calidad-Material-Tipo. Valor "(+X)" junto al PBA.</span></div>
        </div>
      </Card>

      {/* Armor slot cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-4">
        {slots.map((slot) => {
          const piece = armorSet.pieces[slot];
          const isEmpty = !piece || piece.pba === 0;
          const bonuses: ArmorBonus[] = piece?.bonuses || [];
          const upgrades: ArmorUpgrade[] = piece?.upgrades || [];
          const usedTypes = bonuses.map((b) => b.type);

          return (
            <Card
              key={slot}
              title={
                <span className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-zinc-700 bg-zinc-800 p-1"><img src={ARMOR_SLOT_ICONS[slot]} alt={ARMOR_SLOT_LABELS[slot]} className="w-full h-full object-contain" /></span>
                  {ARMOR_SLOT_LABELS[slot]}
                </span>
              }
              className={isEmpty ? 'opacity-60' : ''}
            >
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="PBA"
                    tooltip="Puntos Base de Armadura"
                    type="number"
                    min={0}
                    value={piece?.pba || 0}
                    onChange={(e) => updateSlot(slot, { pba: Number(e.target.value) })}
                  />
                  <Input
                    label="BCMT"
                    tooltip="Bonus Calidad-Material-Tipo"
                    type="number"
                    min={0}
                    value={piece?.bcmt || 0}
                    onChange={(e) => updateSlot(slot, { bcmt: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <span className="text-xs font-medium text-zinc-500 block mb-1">Calidad de Proteccion</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {DAMAGE_TYPES_PAIRED.map((t) => (
                      <div key={t} className="flex items-center gap-1.5">
                        <span className="text-sm shrink-0" title={DAMAGE_TYPE_LABELS[t]}>{DAMAGE_TYPE_ICONS[t]}</span>
                        <select
                          className="flex-1 min-w-0 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 transition-colors"
                          value={piece?.protectionFactors[t] || ''}
                          title={DAMAGE_TYPE_LABELS[t]}
                          onChange={(e) => {
                            const val = e.target.value as ProtectionQuality | '';
                            const factors = { ...(piece?.protectionFactors || {}) };
                            if (val) factors[t] = val as ProtectionQuality;
                            else delete factors[t];
                            updateSlot(slot, { protectionFactors: factors });
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

                {/* Bonus de pieza */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-zinc-500">Bonus</span>
                    {bonuses.length < MAX_BONUSES && (
                      <button
                        onClick={() => {
                          const slotBonusTypes = ARMOR_BONUS_TYPES.filter(
                            (t) => slot === 'escudo' || !SHIELD_ONLY_BONUS_TYPES.includes(t)
                          );
                          const available = slotBonusTypes.find((t) => !usedTypes.includes(t));
                          if (available) {
                            const newBonuses = [...bonuses, { type: available, value: 0 }];
                            updateSlot(slot, { bonuses: newBonuses });
                          }
                        }}
                        className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
                      >
                        + Bonus
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {bonuses.map((bonus, idx) => {
                      const slotBonusTypes = ARMOR_BONUS_TYPES.filter(
                        (t) => slot === 'escudo' || !SHIELD_ONLY_BONUS_TYPES.includes(t)
                      );
                      const availableTypes = slotBonusTypes.filter(
                        (t) => t === bonus.type || !usedTypes.includes(t)
                      );
                      return (
                        <div key={idx} className="flex items-center gap-1.5">
                          <div className="flex-1 min-w-0">
                            <Select
                              value={bonus.type}
                              onChange={(e) => {
                                const newType = e.target.value as ArmorBonusType;
                                const newBonuses = [...bonuses];
                                newBonuses[idx] = { type: newType, value: 0 };
                                updateSlot(slot, { bonuses: newBonuses });
                              }}
                              options={availableTypes.map((t) => ({ value: t, label: ARMOR_BONUS_LABELS[t] }))}
                            />
                          </div>
                          <div className="w-16 shrink-0">
                            <Input
                              type="number"
                              min={0}
                              value={bonus.value}
                              onChange={(e) => {
                                const newBonuses = [...bonuses];
                                newBonuses[idx] = { ...newBonuses[idx], value: Number(e.target.value) };
                                updateSlot(slot, { bonuses: newBonuses });
                              }}
                            />
                          </div>
                          <button
                            onClick={() => {
                              const newBonuses = bonuses.filter((_, j) => j !== idx);
                              updateSlot(slot, { bonuses: newBonuses });
                            }}
                            className="shrink-0 w-7 h-7 flex items-center justify-center text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors"
                            title="Eliminar bonus"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                    {bonuses.length === 0 && (
                      <p className="text-xs text-zinc-600">Sin bonus</p>
                    )}
                  </div>
                </div>

                {/* Mejoras de armadura */}
                {!isEmpty && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-zinc-500">Mejoras <HelpPopover text="Mejoras de armadura. Cada una agrega Resistir +1% o +2% a un tipo de dano. Maximo 4 por pieza." /></span>
                      {upgrades.length < 4 && (
                        <button
                          onClick={() => {
                            const newUpgrades = [...upgrades, { type: 'punzante' as DamageTypeName, value: 1 }];
                            updateSlot(slot, { upgrades: newUpgrades });
                          }}
                          className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
                        >
                          + Mejora
                        </button>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {upgrades.map((upgrade, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <div className="flex-1 min-w-0">
                            <Select
                              value={upgrade.type}
                              onChange={(e) => {
                                const newUpgrades = [...upgrades];
                                newUpgrades[idx] = { ...newUpgrades[idx], type: e.target.value as DamageTypeName };
                                updateSlot(slot, { upgrades: newUpgrades });
                              }}
                              options={ALL_DAMAGE_TYPES.map((t) => ({ value: t, label: DAMAGE_TYPE_LABELS[t] }))}
                            />
                          </div>
                          <div className="w-16 shrink-0">
                            <Select
                              value={String(upgrade.value)}
                              onChange={(e) => {
                                const newUpgrades = [...upgrades];
                                newUpgrades[idx] = { ...newUpgrades[idx], value: Number(e.target.value) };
                                updateSlot(slot, { upgrades: newUpgrades });
                              }}
                              options={[
                                { value: '1', label: '+1%' },
                                { value: '2', label: '+2%' },
                              ]}
                            />
                          </div>
                          <button
                            onClick={() => {
                              const newUpgrades = upgrades.filter((_, j) => j !== idx);
                              updateSlot(slot, { upgrades: newUpgrades });
                            }}
                            className="shrink-0 w-7 h-7 flex items-center justify-center text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors"
                            title="Eliminar mejora"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Protection Summary */}
      {pieceCount > 0 && (
        <Card title="Proteccion Total" className="mb-4">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {ALL_DAMAGE_TYPES.map((t) => {
              const val = protection.perType[t] || 0;
              const maxProt = Math.max(...Object.values(protection.perType), 1);
              const pct = (val / maxProt) * 100;
              const isPhysical = PHYSICAL_DAMAGE_TYPES.includes(t);
              return (
                <div key={t} className="text-center">
                  <div className="text-xs text-zinc-500 mb-1">{DAMAGE_TYPE_ICONS[t]} {DAMAGE_TYPE_LABELS[t]}</div>
                  <div className={`text-lg font-bold ${val > 0 ? (isPhysical ? 'text-orange-400' : 'text-blue-400') : 'text-zinc-600'}`}>
                    {Math.round(val)}
                  </div>
                  <div className="h-1 bg-zinc-800 rounded-full mt-1 overflow-hidden">
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
      )}

      {/* Bonus totals summary */}
      {hasBonusTotals && (
        <Card title="Bonus Totales de Armadura" className="mb-4">
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
            {ARMOR_BONUS_TYPES.filter((t) => bonusTotals[t]).map((t) => (
              <div key={t}>
                <span className="text-zinc-400">{ARMOR_BONUS_LABELS[t]}:</span>{' '}
                <span className="text-amber-400 font-semibold">+{bonusTotals[t]}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Modificadores */}
      <Card title="Modificadores (habilidades activas)">
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs mb-4">
          <div><span className="text-amber-400 font-semibold">Armadura %</span> <span className="text-zinc-500">— Bonus porcentual global de habilidades/buffs a toda la armadura.</span></div>
          <div><span className="text-amber-400 font-semibold">FP</span> <span className="text-zinc-500">— Factor de Proteccion. Calidad de la pieza contra cada tipo de dano.</span></div>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Armadura %"
              tooltip="Bonus porcentual global de habilidades/buffs"
              type="number"
              min={0}
              max={100}
              value={armorSet.bonusArmaduraPct}
              onChange={(e) => updateSet({ bonusArmaduraPct: Number(e.target.value) })}
            />
            <Input
              label="Resistencia Fisica %"
              tooltip="Reduccion porcentual general a TODO el dano fisico, despues de la armadura."
              type="number"
              min={0}
              max={100}
              value={armorSet.generalResistance.fisico}
              onChange={(e) => updateSet({ generalResistance: { ...armorSet.generalResistance, fisico: Number(e.target.value) } })}
            />
            <Input
              label="Resistencia Magica %"
              tooltip="Reduccion porcentual general a TODO el dano magico, despues de la armadura."
              type="number"
              min={0}
              max={100}
              value={armorSet.generalResistance.magico}
              onChange={(e) => updateSet({ generalResistance: { ...armorSet.generalResistance, magico: Number(e.target.value) } })}
            />
          </div>

          <div>
            <span className="text-xs font-medium text-zinc-400 block mb-2">Resistencia por Tipo % <HelpPopover text="Reduccion porcentual especifica por tipo de dano. Se aplica despues de la proteccion de armadura." /></span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {ALL_DAMAGE_TYPES.map((t) => (
                <Input
                  key={t}
                  label={DAMAGE_TYPE_LABELS[t]}
                  type="number"
                  min={0}
                  max={100}
                  value={armorSet.typeResistance[t] || 0}
                  onChange={(e) => updateSet({ typeResistance: { ...armorSet.typeResistance, [t]: Number(e.target.value) } })}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Reduccion Melee %"
              tooltip="Reduce el dano final de ataques cuerpo a cuerpo (espadas, mazas, hachas, etc.)."
              type="number"
              min={0}
              max={100}
              value={armorSet.meleeDmgReductionPct}
              onChange={(e) => updateSet({ meleeDmgReductionPct: Number(e.target.value) })}
            />
            <Input
              label="Reduccion Rango %"
              tooltip="Reduce el dano final de ataques a distancia (arcos, baculos, etc.)."
              type="number"
              min={0}
              max={100}
              value={armorSet.rangedDmgReductionPct}
              onChange={(e) => updateSet({ rangedDmgReductionPct: Number(e.target.value) })}
            />
          </div>

          <div>
            <span className="text-xs font-medium text-zinc-400 block mb-2">Barrera Magica por Tipo <HelpPopover text="Puntos de barrera magica que absorben dano de ese tipo antes de que llegue a tu vida. Se consumen con cada golpe." /></span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {ALL_DAMAGE_TYPES.map((t) => (
                <Input
                  key={t}
                  label={DAMAGE_TYPE_LABELS[t]}
                  type="number"
                  min={0}
                  value={armorSet.barrierPoints[t] || 0}
                  onChange={(e) => updateSet({ barrierPoints: { ...armorSet.barrierPoints, [t]: Number(e.target.value) } })}
                />
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
