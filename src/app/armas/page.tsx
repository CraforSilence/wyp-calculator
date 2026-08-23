'use client';

import { useState, useMemo } from 'react';
import { useCharacter } from '@/hooks/useCharacter';
import { useWeapons } from '@/hooks/useWeapons';
import { calcWeaponDamage } from '@/lib/engine/damage';
import { WeaponForm } from '@/components/weapons/WeaponForm';
import { WeaponCard } from '@/components/weapons/WeaponCard';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DEFAULT_WEAPONS } from '@/data/default-weapons';
import type { Weapon } from '@/types/weapon';

export default function ArmasPage() {
  const { character } = useCharacter();
  const {
    weapons, addWeapon, updateWeapon, deleteWeapon,
    hideWeapon, showWeapon, resetWeapon, resetAll,
    duplicateAsTemp, isModified, hiddenIds, hiddenCount,
  } = useWeapons();
  const [showForm, setShowForm] = useState(false);
  const [editingWeapon, setEditingWeapon] = useState<Weapon | null>(null);
  const [showHidden, setShowHidden] = useState(false);

  const calcResults = useMemo(() => {
    return weapons.map((w) => ({
      weapon: w,
      result: calcWeaponDamage(w, character, null),
    }));
  }, [weapons, character]);

  // Group by clase -> subcategoria
  const grouped = useMemo(() => {
    const map = new Map<string, Map<string, typeof calcResults>>();
    for (const item of calcResults) {
      const { clase, subcategoria } = item.weapon;
      if (!map.has(clase)) map.set(clase, new Map());
      const subMap = map.get(clase)!;
      if (!subMap.has(subcategoria)) subMap.set(subcategoria, []);
      subMap.get(subcategoria)!.push(item);
    }
    return map;
  }, [calcResults]);

  const handleSave = (weaponData: Omit<Weapon, 'id' | 'createdAt'>) => {
    if (editingWeapon) {
      updateWeapon(editingWeapon.id, weaponData);
    } else {
      addWeapon(weaponData);
    }
    setShowForm(false);
    setEditingWeapon(null);
  };

  const handleEdit = (weapon: Weapon) => {
    setEditingWeapon(weapon);
    setShowForm(true);
  };

  const tempCount = weapons.filter((w) => !w.isDefault).length;
  const defaultCount = weapons.filter((w) => w.isDefault).length;

  return (
    <div>
      <PageHeader
        title="Armas"
        description={`${defaultCount} precargadas, ${tempCount} temporales${hiddenCount > 0 ? `, ${hiddenCount} ocultas` : ''}`}
        actions={
          <div className="flex gap-2">
            {hiddenCount > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setShowHidden(!showHidden)}>
                {showHidden ? 'Cerrar ocultas' : `Ocultas (${hiddenCount})`}
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={resetAll}>Reset todo</Button>
            <Button size="sm" onClick={() => { setEditingWeapon(null); setShowForm(!showForm); }}>
              {showForm ? 'Cerrar' : '+ Arma temporal'}
            </Button>
          </div>
        }
      />

      {/* Hidden weapons panel */}
      {showHidden && hiddenCount > 0 && (
        <div className="mb-6 bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-zinc-400 mb-2">Armas ocultas</h3>
          <div className="flex flex-wrap gap-2">
            {hiddenIds.map((id) => {
              const w = DEFAULT_WEAPONS.find((dw) => dw.id === id);
              if (!w) return null;
              return (
                <button
                  key={id}
                  onClick={() => showWeapon(id)}
                  className="px-3 py-1 rounded text-xs bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-amber-600 hover:text-amber-400 transition-colors cursor-pointer"
                >
                  {w.nombre} (mostrar)
                </button>
              );
            })}
          </div>
        </div>
      )}

      {showForm && (
        <div className="mb-6">
          <WeaponForm
            editingWeapon={editingWeapon}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditingWeapon(null); }}
          />
        </div>
      )}

      <div className="space-y-6">
        {Array.from(grouped.entries()).map(([clase, subMap]) => (
          <div key={clase}>
            <h2 className="text-lg font-bold text-zinc-200 mb-3">{clase}</h2>
            {Array.from(subMap.entries()).map(([subcat, items]) => (
              <div key={subcat} className="mb-4">
                <h3 className="text-sm font-medium text-zinc-400 mb-2">{subcat} ({items.length})</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {items
                    .sort((a, b) => b.result.dpsEfectivo - a.result.dpsEfectivo)
                    .map(({ weapon, result }) => (
                      <WeaponCard
                        key={weapon.id}
                        weapon={weapon}
                        calcResult={result}
                        onEdit={() => handleEdit(weapon)}
                        onDelete={() => weapon.isDefault ? hideWeapon(weapon.id) : deleteWeapon(weapon.id)}
                        onDuplicate={() => duplicateAsTemp(weapon.id)}
                        onReset={weapon.isDefault && isModified(weapon.id) ? () => resetWeapon(weapon.id) : undefined}
                        isModified={weapon.isDefault ? isModified(weapon.id) : false}
                      />
                    ))}
                </div>
              </div>
            ))}
          </div>
        ))}

        {weapons.length === 0 && (
          <div className="text-center py-12 text-zinc-500">
            <p>Todas las armas estan ocultas.</p>
            <Button className="mt-4" onClick={resetAll}>Mostrar todo</Button>
          </div>
        )}
      </div>
    </div>
  );
}
