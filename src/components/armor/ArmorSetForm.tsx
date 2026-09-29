'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import {
  ALL_DAMAGE_TYPES, DAMAGE_TYPE_LABELS, DAMAGE_TYPE_ICONS,
  ARMOR_SLOTS_POR_CLASE, ARMOR_SLOT_LABELS, ARMOR_SLOT_ICONS,
  ARMOR_BONUS_TYPES, ARMOR_BONUS_LABELS, SHIELD_ONLY_BONUS_TYPES,
  PHYSICAL_DAMAGE_TYPES, MAGICAL_DAMAGE_TYPES, ARMOR_SLOT_LABEL_OVERRIDES,
  CLASE_SUBCLASES,
} from '@/lib/engine/constants';
import type {
  ArmorSlot, ArmorPiece, ArmorBonus, ArmorUpgrade,
  ProtectionQuality, ArmorBonusType, CatalogArmorSet,
} from '@/types/armor';
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

const DAMAGE_TYPES_PAIRED = PHYSICAL_DAMAGE_TYPES.flatMap((p, i) => [p, MAGICAL_DAMAGE_TYPES[i]]);

interface BonusRow {
  tipo: ArmorBonusType;
  valor: number;
}

interface ArmorSetFormProps {
  onSave: (set: Omit<CatalogArmorSet, 'id' | 'createdAt'>) => void;
  editingSet?: CatalogArmorSet | null;
  onCancel?: () => void;
}

function makeEmptyPiece(slot: ArmorSlot): ArmorPiece {
  const protectionFactors: Partial<Record<DamageTypeName, ProtectionQuality>> = {};
  for (const t of ALL_DAMAGE_TYPES) protectionFactors[t] = 'Normal';
  return { slot, pba: 0, bcmt: 0, protectionFactors, bonusProteccionPct: {}, bonuses: [], upgrades: [] };
}

function initPieces(clase: Clase, existing?: Partial<Record<ArmorSlot, ArmorPiece>>): Record<ArmorSlot, ArmorPiece> {
  const slots = ARMOR_SLOTS_POR_CLASE[clase];
  const result: Record<string, ArmorPiece> = {};
  for (const slot of slots) {
    result[slot] = existing?.[slot] ?? makeEmptyPiece(slot);
  }
  return result as Record<ArmorSlot, ArmorPiece>;
}

export function ArmorSetForm({ onSave, editingSet, onCancel }: ArmorSetFormProps) {
  const [nombre, setNombre] = useState(editingSet?.nombre || '');
  const [clase, setClase] = useState<Clase>(editingSet?.clase || 'Guerrero');
  const [subclase, setSubclase] = useState(editingSet?.subclase || '');
  const [notas, setNotas] = useState(editingSet?.notas || '');

  const [pieces, setPieces] = useState<Record<string, ArmorPiece>>(() =>
    initPieces(editingSet?.clase || 'Guerrero', editingSet?.pieces)
  );

  const [bonusRows, setBonusRows] = useState<BonusRow[]>(() => {
    if (editingSet?.bonusConjunto?.length) {
      return editingSet.bonusConjunto.map((b) => ({ tipo: b.type, valor: b.value }));
    }
    return [];
  });

  const slots = ARMOR_SLOTS_POR_CLASE[clase];

  const handleClaseChange = (newClase: Clase) => {
    setClase(newClase);
    setSubclase('');
    setPieces(initPieces(newClase, pieces));
  };

  const updatePiece = (slot: ArmorSlot, updates: Partial<ArmorPiece>) => {
    setPieces((prev) => ({
      ...prev,
      [slot]: { ...prev[slot], ...updates },
    }));
  };

  const updatePieceBonus = (slot: ArmorSlot, index: number, updates: Partial<ArmorBonus>) => {
    setPieces((prev) => {
      const piece = prev[slot];
      const bonuses = [...piece.bonuses];
      bonuses[index] = { ...bonuses[index], ...updates };
      return { ...prev, [slot]: { ...piece, bonuses } };
    });
  };

  const addPieceBonus = (slot: ArmorSlot) => {
    setPieces((prev) => {
      const piece = prev[slot];
      const availableTypes = ARMOR_BONUS_TYPES.filter((t) =>
        slot === 'escudo' || !SHIELD_ONLY_BONUS_TYPES.includes(t)
      );
      return {
        ...prev,
        [slot]: { ...piece, bonuses: [...piece.bonuses, { type: availableTypes[0], value: 0 }] },
      };
    });
  };

  const removePieceBonus = (slot: ArmorSlot, index: number) => {
    setPieces((prev) => {
      const piece = prev[slot];
      return { ...prev, [slot]: { ...piece, bonuses: piece.bonuses.filter((_, j) => j !== index) } };
    });
  };

  const updatePieceUpgrade = (slot: ArmorSlot, index: number, updates: Partial<ArmorUpgrade>) => {
    setPieces((prev) => {
      const piece = prev[slot];
      const upgrades = [...piece.upgrades];
      upgrades[index] = { ...upgrades[index], ...updates };
      return { ...prev, [slot]: { ...piece, upgrades } };
    });
  };

  const addPieceUpgrade = (slot: ArmorSlot) => {
    setPieces((prev) => {
      const piece = prev[slot];
      return {
        ...prev,
        [slot]: { ...piece, upgrades: [...piece.upgrades, { type: 'cortante' as DamageTypeName, value: 1 }] },
      };
    });
  };

  const removePieceUpgrade = (slot: ArmorSlot, index: number) => {
    setPieces((prev) => {
      const piece = prev[slot];
      return { ...prev, [slot]: { ...piece, upgrades: piece.upgrades.filter((_, j) => j !== index) } };
    });
  };

  const handleSubmit = () => {
    if (!nombre.trim()) return;

    const cleanPieces: Partial<Record<ArmorSlot, ArmorPiece>> = {};
    for (const slot of slots) {
      if (pieces[slot]) cleanPieces[slot] = pieces[slot];
    }

    const bonusConjunto: ArmorBonus[] = bonusRows
      .filter((r) => r.valor !== 0)
      .map((r) => ({ type: r.tipo, value: r.valor }));

    onSave({
      nombre: nombre.trim(),
      clase,
      subclase: subclase || undefined,
      pieces: cleanPieces,
      bonusConjunto,
      notas,
      isDefault: editingSet?.isDefault ?? false,
    });
  };

  const subclaseOptions = CLASE_SUBCLASES[clase].map((sc) => ({ value: sc, label: sc }));
  const availableBonusTypes = (slot: ArmorSlot) =>
    ARMOR_BONUS_TYPES.filter((t) => slot === 'escudo' || !SHIELD_ONLY_BONUS_TYPES.includes(t));

  return (
    <Card title={editingSet ? 'Editar Set de Armadura' : 'Nuevo Set de Armadura'}>
      <div className="space-y-4">
        {/* Basic info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="col-span-2">
            <Input label="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </div>
          <Select
            label="Clase" value={clase}
            onChange={(e) => handleClaseChange(e.target.value as Clase)}
            options={[
              { value: 'Guerrero', label: 'Guerrero' },
              { value: 'Arquero', label: 'Arquero' },
              { value: 'Mago', label: 'Mago' },
            ]}
          />
          <Select
            label="Subclase" value={subclase}
            onChange={(e) => setSubclase(e.target.value)}
            options={[{ value: '', label: '(ninguna)' }, ...subclaseOptions]}
          />
        </div>

        {/* Armor pieces */}
        <div>
          <span className="text-xs font-medium text-zinc-400 mb-2 block">Piezas de Armadura</span>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {slots.map((slot) => {
              const piece = pieces[slot] || makeEmptyPiece(slot);
              const slotLabel = ARMOR_SLOT_LABEL_OVERRIDES[clase]?.[slot] ?? ARMOR_SLOT_LABELS[slot];

              return (
                <div key={slot} className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded border border-zinc-700 bg-zinc-800 p-0.5">
                      <img src={ARMOR_SLOT_ICONS[slot]} alt={slotLabel} className="w-full h-full object-contain" />
                    </span>
                    <span className="text-sm font-medium text-zinc-200">{slotLabel}</span>
                  </div>

                  {/* PBA + BCMT */}
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="PBA" type="number" min={0}
                      value={piece.pba}
                      onChange={(e) => updatePiece(slot, { pba: Number(e.target.value) })}
                    />
                    <Input
                      label="BCMT" type="number" min={0}
                      value={piece.bcmt}
                      onChange={(e) => updatePiece(slot, { bcmt: Number(e.target.value) })}
                    />
                  </div>

                  {/* Protection factors */}
                  <div>
                    <span className="text-[10px] text-zinc-500 mb-1 block">Factor de proteccion</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {DAMAGE_TYPES_PAIRED.map((t) => (
                        <div key={t} className="flex items-center gap-1.5">
                          <span className="text-sm shrink-0" title={DAMAGE_TYPE_LABELS[t]}>{DAMAGE_TYPE_ICONS[t]}</span>
                          <select
                            className="flex-1 min-w-0 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 transition-colors"
                            value={piece.protectionFactors[t] || ''}
                            onChange={(e) => {
                              const val = e.target.value as ProtectionQuality | '';
                              const factors = { ...piece.protectionFactors };
                              if (val) factors[t] = val as ProtectionQuality;
                              else delete factors[t];
                              updatePiece(slot, { protectionFactors: factors });
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

                  {/* Bonus proteccion % */}
                  <div>
                    <span className="text-[10px] text-zinc-500 mb-1 block">Bonus proteccion %</span>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                      {ALL_DAMAGE_TYPES.map((t) => (
                        <Input
                          key={t}
                          label={DAMAGE_TYPE_ICONS[t]}
                          type="number" min={0} max={100}
                          value={piece.bonusProteccionPct[t] ?? 0}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const bpp = { ...piece.bonusProteccionPct };
                            if (val > 0) bpp[t] = val; else delete bpp[t];
                            updatePiece(slot, { bonusProteccionPct: bpp });
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Bonuses */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-zinc-500">Bonuses</span>
                      {piece.bonuses.length < 4 && (
                        <Button size="sm" variant="ghost" onClick={() => addPieceBonus(slot)}>+</Button>
                      )}
                    </div>
                    {piece.bonuses.map((b, i) => (
                      <div key={i} className="flex gap-1.5 items-end mb-1">
                        <Select
                          value={b.type}
                          onChange={(e) => updatePieceBonus(slot, i, { type: e.target.value as ArmorBonusType })}
                          options={availableBonusTypes(slot).map((t) => ({ value: t, label: ARMOR_BONUS_LABELS[t] }))}
                        />
                        <Input
                          type="number" placeholder="Valor"
                          value={b.value || ''} className="w-20"
                          onChange={(e) => updatePieceBonus(slot, i, { value: Number(e.target.value) })}
                        />
                        <Button size="sm" variant="danger" onClick={() => removePieceBonus(slot, i)}>x</Button>
                      </div>
                    ))}
                  </div>

                  {/* Upgrades */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-zinc-500">Upgrades</span>
                      {piece.upgrades.length < 3 && (
                        <Button size="sm" variant="ghost" onClick={() => addPieceUpgrade(slot)}>+</Button>
                      )}
                    </div>
                    {piece.upgrades.map((u, i) => (
                      <div key={i} className="flex gap-1.5 items-end mb-1">
                        <Select
                          value={u.type}
                          onChange={(e) => updatePieceUpgrade(slot, i, { type: e.target.value as DamageTypeName })}
                          options={ALL_DAMAGE_TYPES.map((t) => ({ value: t, label: DAMAGE_TYPE_LABELS[t] }))}
                        />
                        <Select
                          value={String(u.value)}
                          onChange={(e) => updatePieceUpgrade(slot, i, { value: Number(e.target.value) })}
                          options={[{ value: '1', label: '+1' }, { value: '2', label: '+2' }]}
                        />
                        <Button size="sm" variant="danger" onClick={() => removePieceUpgrade(slot, i)}>x</Button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bonus de conjunto */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">Bonus de Conjunto</span>
            {bonusRows.length < 8 && (
              <Button size="sm" variant="ghost" onClick={() => setBonusRows([...bonusRows, { tipo: 'vida', valor: 0 }])}>+ Bonus</Button>
            )}
          </div>
          <div className="space-y-2">
            {bonusRows.map((row, i) => (
              <div key={i} className="flex gap-2 items-end">
                <Select
                  value={row.tipo}
                  onChange={(e) => { const next = [...bonusRows]; next[i].tipo = e.target.value as ArmorBonusType; setBonusRows(next); }}
                  options={ARMOR_BONUS_TYPES.map((t) => ({ value: t, label: ARMOR_BONUS_LABELS[t] }))}
                />
                <Input
                  type="number" placeholder="Valor"
                  value={row.valor || ''} className="w-24"
                  onChange={(e) => { const next = [...bonusRows]; next[i].valor = Number(e.target.value); setBonusRows(next); }}
                />
                <Button size="sm" variant="danger" onClick={() => setBonusRows(bonusRows.filter((_, j) => j !== i))}>x</Button>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-400 font-medium">Notas</label>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-none h-16"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          {onCancel && <Button variant="secondary" onClick={onCancel}>Cancelar</Button>}
          <Button onClick={handleSubmit} disabled={!nombre.trim()}>
            {editingSet ? 'Guardar' : 'Agregar Set'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
