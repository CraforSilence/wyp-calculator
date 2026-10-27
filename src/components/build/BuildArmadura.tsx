'use client';

import { useMemo, useState } from 'react';
import { useCharacter } from '@/hooks/useCharacter';
import { useArmor } from '@/hooks/useArmor';
import { calcTotalProtection, filterArmorForSubclase, allArmorBonuses } from '@/lib/engine/armor';
import { useActiveArmorPreset } from '@/hooks/useActiveArmorPreset';
import {
  ARMOR_CLASSES, ALL_DAMAGE_TYPES, DAMAGE_TYPE_LABELS, DAMAGE_TYPE_ICONS, ARMOR_SLOT_LABELS,
  PHYSICAL_DAMAGE_TYPES, MAGICAL_DAMAGE_TYPES, armorSlotsFor, CLASE_SUBCLASES,
  ARMOR_BONUS_TYPES, ARMOR_BONUS_LABELS, ARMOR_SLOT_ICONS,
  ARMOR_SLOT_LABEL_OVERRIDES, pieceRareza, ITEM_DISTRIBUTION,
} from '@/lib/engine/constants';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { HelpPopover } from '@/components/ui/HelpPopover';
import { Badge, rarezaToBadgeVariant } from '@/components/ui/Badge';
import { ArmorPieceSummary, QUALITY_STYLES } from '@/components/armor/ArmorPieceSummary';
import { ArmorModifiersSection } from '@/components/armor/ArmorModifiersSection';
import { DEFAULT_ARMOR_SETS } from '@/data/default-armor';
import { ArmorBonusSlots, ArmorRarezaSelect, armorBonusLimitLabel } from '@/components/armor/ArmorBonusSlots';
import { useArmorSets } from '@/hooks/useArmorSets';
import type { ArmorSlot, ArmorBonusType, ArmorBonus, ArmorUpgrade, ProtectionQuality } from '@/types/armor';
import type { DamageTypeName } from '@/types/weapon';
import type { Clase } from '@/types/character';

const QUALITY_OPTIONS: { value: string; label: string }[] = [
  { value: 'Muy Mala', label: 'Muy Mala' },
  { value: 'Mala', label: 'Mala' },
  { value: 'Normal', label: 'Normal' },
  { value: 'Buena', label: 'Buena' },
  { value: 'Muy Buena', label: 'Muy Buena' },
];

// Orden intercalado: físicos a la izquierda, mágicos a la derecha en grid-cols-2
const DAMAGE_TYPES_PAIRED = PHYSICAL_DAMAGE_TYPES.flatMap((p, i) => [p, MAGICAL_DAMAGE_TYPES[i]]);

function getClase(subclase: string): Clase {
  for (const [clase, subs] of Object.entries(CLASE_SUBCLASES)) {
    if ((subs as string[]).includes(subclase)) return clase as Clase;
  }
  return 'Guerrero';
}

/** Suma de los bonus de las piezas y del conjunto, por tipo. */
function aggregateAllBonuses(armorSet: ReturnType<typeof useArmor>['armorSet']): Partial<Record<ArmorBonusType, number>> {
  const totals: Partial<Record<ArmorBonusType, number>> = {};
  for (const bonus of allArmorBonuses(armorSet)) {
    totals[bonus.type] = (totals[bonus.type] || 0) + bonus.value;
  }
  return totals;
}

export function BuildArmadura() {
  const { character } = useCharacter();
  const { armorSet: storedArmorSet, updateSlot, updateSet, loadPieces, clearSlot, clearAll } = useArmor();
  const { sets: savedSets } = useArmorSets();
  const { activePreset, setActivePresetId } = useActiveArmorPreset();

  // Piezas con el formulario abierto; el resto se muestra como resumen
  const [editing, setEditing] = useState<Set<ArmorSlot>>(new Set());
  const setSlotEditing = (slot: ArmorSlot, open: boolean) => setEditing((prev) => {
    const next = new Set(prev);
    if (open) next.add(slot); else next.delete(slot);
    return next;
  });

  const clase = getClase(character.subclase);
  const slots = armorSlotsFor(clase, character.subclase);
  // Ignora piezas que la subclase no usa (ej. escudo guardado de cuando era Caballero)
  const armorSet = useMemo(() => filterArmorForSubclase(storedArmorSet, character.subclase), [storedArmorSet, character.subclase]);
  const armorClass = ARMOR_CLASSES[character.subclase];

  const protection = useMemo(() => {
    return calcTotalProtection(armorSet, armorClass);
  }, [armorSet, armorClass]);

  const pieceCount = Object.keys(armorSet.pieces).filter((s) => {
    const p = armorSet.pieces[s as ArmorSlot];
    return p && p.pba > 0;
  }).length;

  const bonusTotals = useMemo(() => aggregateAllBonuses(armorSet), [armorSet]);
  const hasBonusTotals = Object.values(bonusTotals).some((v) => v && v > 0);

  const totalResistances = useMemo(() => {
    const res: Partial<Record<DamageTypeName, number>> = {};
    for (const t of ALL_DAMAGE_TYPES) {
      let total = (armorSet.typeResistance[t] ?? 0);
      for (const piece of Object.values(armorSet.pieces)) {
        if (!piece?.upgrades) continue;
        for (const upgrade of piece.upgrades) {
          if (upgrade.type === t) total += upgrade.value;
        }
      }
      if (total > 0) res[t] = total;
    }
    return res;
  }, [armorSet]);
  const hasResistances = Object.values(totalResistances).some((v) => v && v > 0)
    || armorSet.generalResistance.fisico > 0
    || armorSet.generalResistance.magico > 0;

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-4">
        <p className="text-xs text-zinc-500">
          {clase} — {pieceCount} piezas configuradas | Clase de Armadura: {armorClass}
        </p>
        <button
          onClick={() => { clearAll(); setActivePresetId(''); }}
          className="text-xs text-red-400 hover:text-red-300 hover:bg-red-400/10 px-2 py-1 rounded transition-colors"
          title="Borrar todas las piezas y modificadores"
        >
          Limpiar armadura
        </button>
      </div>

      {/* Referencia de siglas */}
      <Card className="mb-4">
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
          <div><span className="text-amber-400 font-semibold">PBA</span> <span className="text-zinc-500">— Puntos Base de Armadura. Valor base mostrado en el tooltip del item.</span></div>
          <div><span className="text-amber-400 font-semibold">BCMT</span> <span className="text-zinc-500">— Bonus Calidad-Material-Tipo. Valor "(+X)" junto al PBA.</span></div>
        </div>
      </Card>

      {/* Precargar set */}
      {(() => {
        const defaultOptions = DEFAULT_ARMOR_SETS.filter((s) => s.clase === clase && (!s.subclase || s.subclase === character.subclase));
        const customOptions = savedSets.filter((s) => !s.isDefault && s.clase === clase && (!s.subclase || s.subclase === character.subclase));
        if (defaultOptions.length === 0 && customOptions.length === 0) return null;
        return (
          <Card className="mb-4">
            <label className="text-xs text-zinc-400 font-medium mb-1 block">Precargar set de armadura</label>
            <select
              value={activePreset?.id || ''}
              onChange={(e) => {
                const found = savedSets.find((s) => s.id === e.target.value)
                  || DEFAULT_ARMOR_SETS.find((s) => s.id === e.target.value);
                if (found) {
                  // Cada pieza se lleva la rareza del set, salvo que tenga una propia
                  const presetPieces = filterArmorForSubclase(found, character.subclase).pieces;
                  const withRareza = Object.fromEntries(
                    Object.entries(presetPieces).map(([k, p]) => [k, p && { ...p, rareza: p.rareza ?? found.rareza }]),
                  ) as typeof presetPieces;
                  loadPieces(withRareza);
                  setActivePresetId(found.id);
                  setEditing(new Set());
                }
              }}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
            >
              <option value="" disabled>Elegir set para cargar...</option>
              {customOptions.length > 0 && (
                <optgroup label="Mis sets">
                  {customOptions.map((s) => (
                    <option key={s.id} value={s.id}>{s.nombre}</option>
                  ))}
                </optgroup>
              )}
              {defaultOptions.length > 0 && (
                <optgroup label="Sets base">
                  {defaultOptions.map((s) => (
                    <option key={s.id} value={s.id}>{s.nombre}</option>
                  ))}
                </optgroup>
              )}
            </select>
            {activePreset?.rareza === 'Artesano' && (
              <p className="text-[12px] text-zinc-500 mt-1.5">
                <Badge variant="info" className="mr-1.5">Artesano</Badge>
                Los bonus de cada pieza vienen fijos con el set; solo podés ajustar PBA, calidades y mejoras.
              </p>
            )}
          </Card>
        );
      })()}

      {/* Calidad para todas las piezas a la vez */}
      {pieceCount > 0 && (
        <Card className="mb-4">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 mb-2">
            <span className="text-xs font-medium text-zinc-300">Calidad para todas las piezas</span>
            <span className="text-[12px] text-zinc-500">Cambia ese tipo en todas las piezas cargadas a la vez.</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {ALL_DAMAGE_TYPES.map((t) => {
              const loaded = slots.map((s) => armorSet.pieces[s]).filter((p): p is NonNullable<typeof p> => !!p && p.pba > 0);
              const qualities = new Set(loaded.map((p) => p.protectionFactors[t] || 'Normal'));
              const shared = qualities.size === 1 ? [...qualities][0] : '';
              return (
                <label key={t} className="flex flex-col gap-0.5">
                  <span className="text-[12px] text-zinc-500">{DAMAGE_TYPE_ICONS[t]} {DAMAGE_TYPE_LABELS[t]}</span>
                  <select
                    value={shared}
                    onChange={(e) => {
                      const val = e.target.value as ProtectionQuality;
                      for (const p of loaded) updateSlot(p.slot, { protectionFactors: { ...p.protectionFactors, [t]: val } });
                    }}
                    className={`w-full rounded border px-1.5 py-1 text-xs focus:outline-none focus:border-amber-500 ${shared ? QUALITY_STYLES[shared] : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}
                  >
                    {!shared && <option value="" disabled>Mixta</option>}
                    {QUALITY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-zinc-900 text-zinc-100">{opt.label}</option>
                    ))}
                  </select>
                </label>
              );
            })}
          </div>
        </Card>
      )}

      {/* Armor slot cards */}
      <div className="grid gap-4 sm:grid-cols-2 mb-4">
        {slots.map((slot) => {
          const piece = armorSet.pieces[slot];
          const isEmpty = !piece || piece.pba === 0;
          const bonuses: ArmorBonus[] = piece?.bonuses || [];
          const upgrades: ArmorUpgrade[] = piece?.upgrades || [];
          const rareza = pieceRareza(piece, activePreset?.rareza);
          const isEditing = editing.has(slot);
          const slotLabel = ARMOR_SLOT_LABEL_OVERRIDES[clase]?.[slot] ?? ARMOR_SLOT_LABELS[slot];

          return (
            <Card
              key={slot}
              title={
                <span className="flex items-center justify-between w-full gap-2">
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="inline-flex shrink-0 items-center justify-center w-10 h-10 rounded-lg border border-zinc-700 bg-zinc-800 p-1"><img src={ARMOR_SLOT_ICONS[slot]} alt={slotLabel} className="w-full h-full object-contain" /></span>
                    <span className="flex flex-col items-start gap-0.5 min-w-0">
                      <span>
                        {slotLabel}
                        <span className="ml-1.5 text-[12px] font-normal text-zinc-500" title="Parte del cuerpo que cubre: su peso en la protección total">
                          {Math.round((ITEM_DISTRIBUTION[slot] ?? 0) * 100)}%
                        </span>
                      </span>
                      {!isEmpty && <Badge variant={rarezaToBadgeVariant(rareza)} className="!text-[11px] !px-1.5 !py-0">{rareza}</Badge>}
                    </span>
                  </span>
                  <span className="flex items-center gap-1 shrink-0">
                    {!isEmpty && (
                      <button
                        onClick={() => setSlotEditing(slot, !isEditing)}
                        className={`text-xs font-normal px-2 py-1 rounded transition-colors ${isEditing ? 'bg-amber-600 text-white hover:bg-amber-500' : 'text-amber-400 hover:text-amber-300 hover:bg-amber-400/10'}`}
                        title={isEditing ? 'Cerrar el formulario' : 'Editar esta pieza'}
                      >
                        {isEditing ? 'Listo' : 'Editar'}
                      </button>
                    )}
                    {piece && (
                      <button
                        onClick={() => { clearSlot(slot); setSlotEditing(slot, false); }}
                        className="text-xs font-normal text-red-400 hover:text-red-300 hover:bg-red-400/10 px-2 py-1 rounded transition-colors"
                        title="Borrar esta pieza"
                      >
                        Limpiar
                      </button>
                    )}
                  </span>
                </span>
              }
              className={isEditing ? 'border-amber-600/60' : isEmpty ? 'border-dashed' : ''}
            >
              {!isEditing && piece && !isEmpty ? (
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
                          className={`flex-1 min-w-0 rounded border px-2 py-1.5 text-xs focus:outline-none focus:border-amber-500 transition-colors ${QUALITY_STYLES[piece?.protectionFactors[t] || 'Normal']}`}
                          value={piece?.protectionFactors[t] || 'Normal'}
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
                            <option key={opt.value} value={opt.value} className="bg-zinc-900 text-zinc-100">{opt.label}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bonus de pieza: los slots dependen de la rareza */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-medium text-zinc-500">
                      Bonus <span className="font-normal text-zinc-600">· {armorBonusLimitLabel(rareza)}</span>
                    </span>
                    <ArmorRarezaSelect value={rareza} onChange={(r) => updateSlot(slot, { rareza: r })} />
                  </div>
                  <ArmorBonusSlots
                    bonuses={bonuses}
                    slot={slot}
                    rareza={rareza}
                    onChange={(next) => updateSlot(slot, { bonuses: next })}
                    lockArtesano
                  />
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

      {/* Resistencias Totales */}
      {hasResistances && (
        <Card title="Resistencias Totales (post-armadura)" className="mb-4">
          {(armorSet.generalResistance.fisico > 0 || armorSet.generalResistance.magico > 0) && (
            <div className="flex gap-6 mb-3 text-sm">
              {armorSet.generalResistance.fisico > 0 && (
                <div><span className="text-zinc-400">Fisica general:</span> <span className="text-orange-400 font-semibold">{armorSet.generalResistance.fisico}%</span></div>
              )}
              {armorSet.generalResistance.magico > 0 && (
                <div><span className="text-zinc-400">Magica general:</span> <span className="text-blue-400 font-semibold">{armorSet.generalResistance.magico}%</span></div>
              )}
            </div>
          )}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {ALL_DAMAGE_TYPES.map((t) => {
              const val = totalResistances[t] || 0;
              const isPhysical = PHYSICAL_DAMAGE_TYPES.includes(t);
              const baseRes = armorSet.typeResistance[t] ?? 0;
              const upgradeRes = val - baseRes;
              return (
                <div key={t} className="text-center">
                  <div className="text-xs text-zinc-500 mb-1">{DAMAGE_TYPE_ICONS[t]} {DAMAGE_TYPE_LABELS[t]}</div>
                  <div className={`text-lg font-bold ${val > 0 ? (isPhysical ? 'text-orange-400' : 'text-blue-400') : 'text-zinc-600'}`}>
                    {val}%
                  </div>
                  {upgradeRes > 0 && (
                    <div className="text-xs text-zinc-500">
                      {baseRes > 0 && <span>{baseRes}% base</span>}
                      {baseRes > 0 && ' + '}<span className="text-amber-400">+{upgradeRes}% mejoras</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Bonus totals summary (pieces + set) */}
      {hasBonusTotals && (
        <Card
          title={
            <span className="flex items-center gap-2">
              Bonus Totales de Armadura
              {activePreset && <span className="text-xs text-zinc-500 font-normal">(piezas + conjunto: {activePreset.nombre})</span>}
            </span>
          }
          className="mb-4"
        >
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
      <ArmorModifiersSection title="Modificadores (habilidades activas)" armorSet={armorSet}>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs mb-4 mt-3">
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
      </ArmorModifiersSection>
    </div>
  );
}
