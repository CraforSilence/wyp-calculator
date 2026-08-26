'use client';

import { useJewelry, aggregateJewelryBonuses } from '@/hooks/useJewelry';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { JEWELRY_BONUS_TYPES, JEWELRY_BONUS_LABELS, JEWELRY_BONUS_CATEGORIES, JEWELRY_ICONS } from '@/lib/engine/constants';
import { HelpPopover } from '@/components/ui/HelpPopover';
import type { JewelrySlot, JewelryBonusType } from '@/types/jewelry';

const SLOT_LABELS: Record<JewelrySlot, string> = {
  anillo1: 'Anillo 1',
  anillo2: 'Anillo 2',
  amuleto: 'Amuleto',
};

const MAX_BONUSES = 5;

export function BuildJoyeria() {
  const { jewelry, addBonus, removeBonus, updateBonus } = useJewelry();
  const totals = aggregateJewelryBonuses(jewelry);

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-3">
        {(['anillo1', 'anillo2', 'amuleto'] as JewelrySlot[]).map((slot) => {
          const piece = jewelry[slot];
          const usedTypes = piece.bonuses.map((b) => b.type);

          return (
            <Card key={slot} title={
              <span className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-zinc-700 bg-zinc-800 p-1"><img src={JEWELRY_ICONS[slot]} alt={SLOT_LABELS[slot]} className="w-full h-full object-contain" /></span>
                {SLOT_LABELS[slot]}
              </span>
            }>
              <div className="flex flex-col gap-2">
                {piece.bonuses.map((bonus, idx) => {
                  const availableTypes = JEWELRY_BONUS_TYPES.filter(
                    (t) => t === bonus.type || !usedTypes.includes(t)
                  );
                  const typeOptions = availableTypes.map((t) => ({
                    value: t,
                    label: JEWELRY_BONUS_LABELS[t],
                  }));

                  return (
                    <div key={idx} className="flex items-end gap-2">
                      <div className="flex-1">
                        <Select
                          label={idx === 0 ? 'Tipo' : undefined}
                          tooltip={idx === 0 ? 'Tipo de bonus: atributo, resistencia, critico, dano extra, etc. Se suman al total del personaje.' : undefined}
                          value={bonus.type}
                          onChange={(e) =>
                            updateBonus(slot, idx, {
                              type: e.target.value as JewelryBonusType,
                              value: bonus.value,
                            })
                          }
                          options={typeOptions}
                        />
                      </div>
                      <div className="w-24">
                        <Input
                          label={idx === 0 ? 'Valor' : undefined}
                          tooltip={idx === 0 ? 'Valor numerico del bonus tal como aparece en el tooltip del item.' : undefined}
                          type="number"
                          min={0}
                          max={999}
                          value={bonus.value}
                          onChange={(e) =>
                            updateBonus(slot, idx, {
                              type: bonus.type,
                              value: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                      <button
                        onClick={() => removeBonus(slot, idx)}
                        className="px-2 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors"
                        title="Eliminar bonus"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}

                {piece.bonuses.length < MAX_BONUSES && (
                  <button
                    onClick={() => {
                      const available = JEWELRY_BONUS_TYPES.find((t) => !usedTypes.includes(t));
                      if (available) addBonus(slot, { type: available, value: 0 });
                    }}
                    className="text-sm text-amber-400 hover:text-amber-300 py-1 transition-colors text-left"
                  >
                    + Agregar bonus
                  </button>
                )}

                {piece.bonuses.length === 0 && (
                  <p className="text-xs text-zinc-500">Sin bonus configurados</p>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {Object.keys(totals).length > 0 && (
        <Card title="Resumen" className="mt-4">
          <div className="flex flex-col gap-3">
            {Object.entries(JEWELRY_BONUS_CATEGORIES).map(([catName, catTypes]) => {
              const catEntries = catTypes.filter((t) => totals[t]);
              if (catEntries.length === 0) return null;
              return (
                <div key={catName}>
                  <p className="text-xs text-zinc-500 mb-1">{catName}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    {catEntries.map((t) => (
                      <div key={t}>
                        <span className="text-zinc-400">{JEWELRY_BONUS_LABELS[t]}:</span>{' '}
                        <span className="text-amber-400 font-semibold">+{totals[t]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
