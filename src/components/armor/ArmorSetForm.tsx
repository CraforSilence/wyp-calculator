'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import {
  ALL_DAMAGE_TYPES, DAMAGE_TYPE_LABELS, DAMAGE_TYPE_ICONS,
  ARMOR_SLOTS_POR_CLASE, armorSlotsFor, ARMOR_SLOT_LABELS, ARMOR_SLOT_ICONS,
  ARMOR_BONUS_TYPES, ARMOR_BONUS_LABELS,
  PHYSICAL_DAMAGE_TYPES, MAGICAL_DAMAGE_TYPES, ARMOR_SLOT_LABEL_OVERRIDES,
  CLASE_SUBCLASES, ARMOR_RAREZAS,
} from '@/lib/engine/constants';
import { QUALITY_STYLES } from '@/components/armor/ArmorPieceSummary';
import { ArmorBonusSlots, armorBonusLimitLabel } from './ArmorBonusSlots';
import type {
  ArmorSlot, ArmorPiece, ArmorBonus, ArmorUpgrade,
  ProtectionQuality, ArmorBonusType, CatalogArmorSet, ArmorRareza,
} from '@/types/armor';
import type { DamageTypeName } from '@/types/weapon';
import type { Clase } from '@/types/character';
import { useT } from '@/i18n/I18nProvider';

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
  for (const dt of ALL_DAMAGE_TYPES) protectionFactors[dt] = 'Normal';
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
  const t = useT();
  const [nombre, setNombre] = useState(editingSet?.nombre || '');
  const [clase, setClase] = useState<Clase>(editingSet?.clase || 'Guerrero');
  const [subclase, setSubclase] = useState(editingSet?.subclase || '');
  const [notas, setNotas] = useState(editingSet?.notas || '');
  // En el catalogo la rareza se define para todo el set
  const [rareza, setRareza] = useState<ArmorRareza>(editingSet?.rareza ?? 'Legendaria');

  const [pieces, setPieces] = useState<Record<string, ArmorPiece>>(() =>
    initPieces(editingSet?.clase || 'Guerrero', editingSet?.pieces)
  );

  const [bonusRows, setBonusRows] = useState<BonusRow[]>(() => {
    if (editingSet?.bonusConjunto?.length) {
      return editingSet.bonusConjunto.map((b) => ({ tipo: b.type, valor: b.value }));
    }
    return [];
  });

  const slots = armorSlotsFor(clase, subclase);

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
      // La rareza de cada pieza sale del set
      if (pieces[slot]) cleanPieces[slot] = { ...pieces[slot], rareza: undefined };
    }

    const bonusConjunto: ArmorBonus[] = bonusRows
      .filter((r) => r.valor !== 0)
      .map((r) => ({ type: r.tipo, value: r.valor }));

    onSave({
      nombre: nombre.trim(),
      clase,
      subclase: subclase || undefined,
      pieces: cleanPieces,
      rareza,
      bonusConjunto,
      notas,
      isDefault: editingSet?.isDefault ?? false,
    });
  };

  const subclaseOptions = CLASE_SUBCLASES[clase].map((sc) => ({ value: sc, label: sc }));

  return (
    <Card title={editingSet ? t("Editar Set de Armadura") : t("Nuevo Set de Armadura")}>
      <div className="space-y-4">
        {/* Basic info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="col-span-2">
            <Input label={t("Nombre")} value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </div>
          <Select
            label={t("Clase")} value={clase}
            onChange={(e) => handleClaseChange(e.target.value as Clase)}
            options={[
              { value: 'Guerrero', label: 'Guerrero' },
              { value: 'Arquero', label: 'Arquero' },
              { value: 'Mago', label: 'Mago' },
            ]}
          />
          <Select
            label={t("Subclase")} value={subclase}
            onChange={(e) => setSubclase(e.target.value)}
            options={[{ value: '', label: '(ninguna)' }, ...subclaseOptions]}
          />
          <Select
            label={t("Rareza")}
            tooltip={t('Define cuántos bonus puede tener cada pieza. Artesano (Magnanitas, Champion) trae bonus fijos: definilos acá.')}
            value={rareza}
            onChange={(e) => setRareza(e.target.value as ArmorRareza)}
            options={ARMOR_RAREZAS.map((r) => ({ value: r, label: r }))}
          />
        </div>

        {/* Armor pieces */}
        <div>
          <span className="text-xs font-medium text-zinc-400 mb-2 block">{t("Piezas de Armadura")}</span>
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
                      label={t("PBA")} type="number" min={0}
                      value={piece.pba}
                      onChange={(e) => updatePiece(slot, { pba: Number(e.target.value) })}
                    />
                    <Input
                      label={t("BCMT")} type="number" min={0}
                      value={piece.bcmt}
                      onChange={(e) => updatePiece(slot, { bcmt: Number(e.target.value) })}
                    />
                  </div>

                  {/* Protection factors */}
                  <div>
                    <span className="text-[11px] text-zinc-500 mb-1 block">{t('Factor de protección')}</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {DAMAGE_TYPES_PAIRED.map((dt) => (
                        <div key={dt} className="flex items-center gap-1.5">
                          <span className="text-sm shrink-0" title={t(DAMAGE_TYPE_LABELS[dt])}>{DAMAGE_TYPE_ICONS[dt]}</span>
                          <select
                            className={`flex-1 min-w-0 rounded border px-2 py-1.5 text-xs focus:outline-none focus:border-amber-500 transition-colors ${QUALITY_STYLES[piece.protectionFactors[dt] || 'Normal']}`}
                            value={piece.protectionFactors[dt] || ''}
                            onChange={(e) => {
                              const val = e.target.value as ProtectionQuality | '';
                              const factors = { ...piece.protectionFactors };
                              if (val) factors[dt] = val as ProtectionQuality;
                              else delete factors[dt];
                              updatePiece(slot, { protectionFactors: factors });
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

                  {/* Bonuses: los slots dependen de la rareza del set */}
                  <div>
                    <span className="text-[11px] text-zinc-500 mb-1 block">Bonuses · {armorBonusLimitLabel(rareza, t)}</span>
                    <ArmorBonusSlots
                      bonuses={piece.bonuses}
                      slot={slot}
                      rareza={rareza}
                      onChange={(next) => updatePiece(slot, { bonuses: next })}
                    />
                  </div>

                  {/* Upgrades */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-zinc-500">{t("Upgrades")}</span>
                      {piece.upgrades.length < 3 && (
                        <Button size="sm" variant="ghost" onClick={() => addPieceUpgrade(slot)}>+</Button>
                      )}
                    </div>
                    {piece.upgrades.map((u, i) => (
                      <div key={i} className="flex gap-1.5 items-end mb-1">
                        <Select
                          value={u.type}
                          onChange={(e) => updatePieceUpgrade(slot, i, { type: e.target.value as DamageTypeName })}
                          options={ALL_DAMAGE_TYPES.map((dt) => ({ value: dt, label: DAMAGE_TYPE_LABELS[dt] }))}
                        />
                        <Select
                          value={String(u.value)}
                          onChange={(e) => updatePieceUpgrade(slot, i, { value: Number(e.target.value) })}
                          options={[{ value: '1', label: '+1' }, { value: '2', label: '+2' }]}
                        />
                        <Button size="sm" variant="danger-ghost" onClick={() => removePieceUpgrade(slot, i)}>x</Button>
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
            <span className="text-xs font-medium text-zinc-400">{t("Bonus de Conjunto")}</span>
            {bonusRows.length < 8 && (
              <Button size="sm" variant="ghost" onClick={() => setBonusRows([...bonusRows, { tipo: 'vida', valor: 0 }])}>{t("+ Bonus")}</Button>
            )}
          </div>
          <div className="space-y-2">
            {bonusRows.map((row, i) => (
              <div key={i} className="flex gap-2 items-end">
                <Select
                  value={row.tipo}
                  onChange={(e) => { const next = [...bonusRows]; next[i].tipo = e.target.value as ArmorBonusType; setBonusRows(next); }}
                  options={ARMOR_BONUS_TYPES.map((dt) => ({ value: dt, label: ARMOR_BONUS_LABELS[dt] }))}
                />
                <Input
                  type="number" placeholder={t("Valor")}
                  value={row.valor || ''} className="w-24"
                  onChange={(e) => { const next = [...bonusRows]; next[i].valor = Number(e.target.value); setBonusRows(next); }}
                />
                <Button size="sm" variant="danger-ghost" onClick={() => setBonusRows(bonusRows.filter((_, j) => j !== i))}>x</Button>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-400 font-medium">{t("Notas")}</label>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-none h-16"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          {onCancel && <Button variant="secondary" onClick={onCancel}>{t("Cancelar")}</Button>}
          <Button onClick={handleSubmit} disabled={!nombre.trim()}>
            {editingSet ? t("Guardar") : t("Agregar Set")}
          </Button>
        </div>
      </div>
    </Card>
  );
}
