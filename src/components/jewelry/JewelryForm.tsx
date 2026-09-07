'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { JEWELRY_BONUS_TYPES, JEWELRY_BONUS_LABELS } from '@/lib/engine/constants';
import type { JewelryItem, JewelryItemSlot, JewelryBonusType, JewelryBonus } from '@/types/jewelry';

const MAX_BONUSES = 5;

const SLOT_OPTIONS: { value: string; label: string }[] = [
  { value: 'anillo', label: 'Anillo' },
  { value: 'amuleto', label: 'Amuleto' },
];

interface JewelryFormProps {
  onSave: (item: Omit<JewelryItem, 'id' | 'createdAt'>) => void;
  editingItem?: JewelryItem | null;
  onCancel?: () => void;
}

export function JewelryForm({ onSave, editingItem, onCancel }: JewelryFormProps) {
  const [nombre, setNombre] = useState(editingItem?.nombre ?? '');
  const [slot, setSlot] = useState<JewelryItemSlot>(editingItem?.slot ?? 'anillo');
  const [bonuses, setBonuses] = useState<JewelryBonus[]>(editingItem?.bonuses ?? []);
  const [notas, setNotas] = useState(editingItem?.notas ?? '');

  const usedTypes = bonuses.map((b) => b.type);

  const handleAddBonus = () => {
    const available = JEWELRY_BONUS_TYPES.find((t) => !usedTypes.includes(t));
    if (available && bonuses.length < MAX_BONUSES) {
      setBonuses([...bonuses, { type: available, value: 0 }]);
    }
  };

  const handleRemoveBonus = (idx: number) => {
    setBonuses(bonuses.filter((_, i) => i !== idx));
  };

  const handleUpdateBonus = (idx: number, field: 'type' | 'value', val: string | number) => {
    const updated = [...bonuses];
    if (field === 'type') {
      updated[idx] = { ...updated[idx], type: val as JewelryBonusType };
    } else {
      updated[idx] = { ...updated[idx], value: Number(val) };
    }
    setBonuses(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    onSave({
      nombre: nombre.trim(),
      slot,
      bonuses: bonuses.filter((b) => b.value > 0),
      notas: notas.trim(),
      isDefault: editingItem?.isDefault ?? false,
    });
  };

  return (
    <Card title={editingItem ? 'Editar joya' : 'Nueva joya'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <Input
              label="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Anillo de Fuego +10"
              required
            />
          </div>
          <Select
            label="Tipo"
            value={slot}
            onChange={(e) => setSlot(e.target.value as JewelryItemSlot)}
            options={SLOT_OPTIONS}
          />
        </div>

        <div>
          <p className="text-xs text-zinc-400 font-medium mb-2">Bonuses ({bonuses.length}/{MAX_BONUSES})</p>
          <div className="flex flex-col gap-2">
            {bonuses.map((bonus, idx) => {
              const availableTypes = JEWELRY_BONUS_TYPES.filter(
                (t) => t === bonus.type || !usedTypes.includes(t)
              );
              return (
                <div key={idx} className="flex items-end gap-2">
                  <div className="flex-1">
                    <Select
                      value={bonus.type}
                      onChange={(e) => handleUpdateBonus(idx, 'type', e.target.value)}
                      options={availableTypes.map((t) => ({ value: t, label: JEWELRY_BONUS_LABELS[t] }))}
                    />
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      min={0}
                      max={999}
                      value={bonus.value}
                      onChange={(e) => handleUpdateBonus(idx, 'value', e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveBonus(idx)}
                    className="px-2 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
            {bonuses.length < MAX_BONUSES && (
              <button
                type="button"
                onClick={handleAddBonus}
                className="text-sm text-amber-400 hover:text-amber-300 py-1 transition-colors text-left"
              >
                + Agregar bonus
              </button>
            )}
          </div>
        </div>

        <Input
          label="Notas"
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          placeholder="Opcional"
        />

        <div className="flex gap-2 pt-2">
          <Button type="submit">{editingItem ? 'Guardar' : 'Crear'}</Button>
          {onCancel && (
            <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
          )}
        </div>
      </form>
    </Card>
  );
}
