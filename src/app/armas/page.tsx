'use client';

import { useState, useMemo } from 'react';
import { useCharacter } from '@/hooks/useCharacter';
import { useWeapons } from '@/hooks/useWeapons';
import { useShowMore } from '@/hooks/useShowMore';
import { calcWeaponDamage } from '@/lib/engine/damage';
import { WeaponForm } from '@/components/weapons/WeaponForm';
import { WeaponCard } from '@/components/weapons/WeaponCard';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { DEFAULT_WEAPONS } from '@/data/default-weapons';
import { CLASE_SUBCLASES, SUBCATEGORIAS_POR_SUBCLASE, SUBCATEGORIAS_POR_CLASE } from '@/lib/engine/constants';
import type { Weapon, Subcategoria } from '@/types/weapon';
import type { Clase, Subclase } from '@/types/character';

export default function ArmasPage() {
  const { character } = useCharacter();
  const {
    weapons, addWeapon, updateWeapon, deleteWeapon,
    hideWeapon, showWeapon, resetWeapon, resetAll,
    duplicateAsTemp, isModified, hiddenIds, hiddenCount,
  } = useWeapons();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingWeapon, setEditingWeapon] = useState<Weapon | null>(null);
  const [showHidden, setShowHidden] = useState(false);
  const [claseFilter, setClaseFilter] = useState<'Todas' | Clase>('Todas');
  const [subclaseFilter, setSubclaseFilter] = useState<'Todas' | Subclase>('Todas');
  const [subcatFilter, setSubcatFilter] = useState<'Todas' | Subcategoria>('Todas');

  type CalcItem = { weapon: Weapon; result: ReturnType<typeof calcWeaponDamage> };

  const calcResults = useMemo(() => {
    return weapons.map((w) => ({
      weapon: w,
      result: calcWeaponDamage(w, character, null),
    }));
  }, [weapons, character]);

  const subclaseOptions = claseFilter === 'Todas' ? [] : CLASE_SUBCLASES[claseFilter] ?? [];
  const subcatOptions = useMemo(() => {
    if (subclaseFilter !== 'Todas') return SUBCATEGORIAS_POR_SUBCLASE[subclaseFilter] ?? [];
    if (claseFilter !== 'Todas') return SUBCATEGORIAS_POR_CLASE[claseFilter] ?? [];
    return [];
  }, [claseFilter, subclaseFilter]);

  const filterItems = (r: CalcItem) => {
    if (claseFilter !== 'Todas' && r.weapon.clase !== claseFilter) return false;
    if (subclaseFilter !== 'Todas') {
      const allowedSubcats = SUBCATEGORIAS_POR_SUBCLASE[subclaseFilter] ?? [];
      if (!allowedSubcats.includes(r.weapon.subcategoria)) return false;
    }
    if (subcatFilter !== 'Todas' && r.weapon.subcategoria !== subcatFilter) return false;
    return true;
  };

  // Helper: group items by clase -> subcategoria
  const groupByClase = (items: CalcItem[]) => {
    const map = new Map<string, Map<string, CalcItem[]>>();
    for (const item of items) {
      const { clase, subcategoria } = item.weapon;
      if (!map.has(clase)) map.set(clase, new Map());
      const subMap = map.get(clase)!;
      if (!subMap.has(subcategoria)) subMap.set(subcategoria, []);
      subMap.get(subcategoria)!.push(item);
    }
    return map;
  };

  const allBaseResults = useMemo(() => calcResults.filter((r) => r.weapon.isDefault).filter(filterItems), [calcResults, claseFilter, subclaseFilter, subcatFilter]);
  const allCustomResults = useMemo(() => calcResults.filter((r) => !r.weapon.isDefault).filter(filterItems), [calcResults, claseFilter, subclaseFilter, subcatFilter]);

  const baseShowMore = useShowMore(allBaseResults);
  const customShowMore = useShowMore(allCustomResults);

  const baseResults = baseShowMore.visible;
  const customResults = customShowMore.visible;

  const groupedBase = useMemo(() => groupByClase(baseResults), [baseResults]);
  const groupedCustom = useMemo(() => groupByClase(customResults), [customResults]);

  const handleSave = (weaponData: Omit<Weapon, 'id' | 'createdAt'>) => {
    if (editingWeapon) {
      updateWeapon(editingWeapon.id, weaponData);
      toast('Arma actualizada', 'success');
    } else {
      addWeapon(weaponData);
      toast('Arma agregada', 'success');
    }
    setShowForm(false);
    setEditingWeapon(null);
  };

  const handleEdit = (weapon: Weapon) => {
    setEditingWeapon(weapon);
    setShowForm(true);
  };

  const tempCount = allCustomResults.length;
  const defaultCount = allBaseResults.length;

  return (
    <div>
      <PageHeader
        title="Armas"
        description={`${defaultCount} base, ${tempCount} personalizadas${hiddenCount > 0 ? `, ${hiddenCount} ocultas` : ''}`}
        actions={
          <div className="flex gap-2">
            {hiddenCount > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setShowHidden(!showHidden)}>
                {showHidden ? 'Cerrar ocultas' : `Ocultas (${hiddenCount})`}
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={resetAll}>Reset todo</Button>
            <Button size="sm" onClick={() => { setEditingWeapon(null); setShowForm(!showForm); }}>
              {showForm ? 'Cerrar' : '+ Nueva arma'}
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">Clase:</span>
          {(['Todas', 'Guerrero', 'Arquero', 'Mago'] as const).map((c) => (
            <button
              key={c}
              onClick={() => { setClaseFilter(c); setSubclaseFilter('Todas'); setSubcatFilter('Todas'); }}
              className={`px-3 py-1 rounded text-xs border transition-colors cursor-pointer ${
                claseFilter === c
                  ? 'bg-amber-900/30 border-amber-700 text-amber-400'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        {subclaseOptions.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">Subclase:</span>
            <button
              onClick={() => { setSubclaseFilter('Todas'); setSubcatFilter('Todas'); }}
              className={`px-3 py-1 rounded text-xs border transition-colors cursor-pointer ${
                subclaseFilter === 'Todas'
                  ? 'bg-cyan-900/30 border-cyan-700 text-cyan-400'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
              }`}
            >
              Todas
            </button>
            {subclaseOptions.map((sc) => (
              <button
                key={sc}
                onClick={() => { setSubclaseFilter(sc); setSubcatFilter('Todas'); }}
                className={`px-3 py-1 rounded text-xs border transition-colors cursor-pointer ${
                  subclaseFilter === sc
                    ? 'bg-cyan-900/30 border-cyan-700 text-cyan-400'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
                }`}
              >
                {sc}
              </button>
            ))}
          </div>
        )}
        {subcatOptions.length > 1 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-zinc-500">Tipo:</span>
            <button
              onClick={() => setSubcatFilter('Todas')}
              className={`px-3 py-1 rounded text-xs border transition-colors cursor-pointer ${
                subcatFilter === 'Todas'
                  ? 'bg-emerald-900/30 border-emerald-700 text-emerald-400'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
              }`}
            >
              Todas
            </button>
            {subcatOptions.map((sc) => (
              <button
                key={sc}
                onClick={() => setSubcatFilter(sc as Subcategoria)}
                className={`px-3 py-1 rounded text-xs border transition-colors cursor-pointer ${
                  subcatFilter === sc
                    ? 'bg-emerald-900/30 border-emerald-700 text-emerald-400'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
                }`}
              >
                {sc}
              </button>
            ))}
          </div>
        )}
      </div>

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

      <div className="space-y-8">
        {/* Mis armas (user-created) */}
        {allCustomResults.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-4 border-b border-amber-800/40 pb-2">
              <h2 className="text-base font-bold text-amber-400">Mis armas</h2>
              <Badge variant="damage">{allCustomResults.length}</Badge>
            </div>
            <div className="space-y-6">
              {Array.from(groupedCustom.entries()).map(([clase, subMap]) => (
                <div key={clase}>
                  <h3 className="text-lg font-bold text-zinc-200 mb-3">{clase}</h3>
                  {Array.from(subMap.entries()).map(([subcat, items]) => (
                    <div key={subcat} className="mb-4">
                      <h4 className="text-sm font-medium text-zinc-400 mb-2">{subcat} ({items.length})</h4>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {items
                          .sort((a, b) => b.result.dpsEfectivo - a.result.dpsEfectivo)
                          .map(({ weapon, result }) => (
                            <WeaponCard
                              key={weapon.id}
                              weapon={weapon}
                              calcResult={result}
                              onEdit={() => handleEdit(weapon)}
                              onDelete={() => { deleteWeapon(weapon.id); toast('Arma eliminada', 'info'); }}
                              onDuplicate={() => { duplicateAsTemp(weapon.id); toast('Arma duplicada', 'success'); }}
                              isModified={false}
                            />
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            {customShowMore.hasMore && (
              <button
                onClick={customShowMore.showMore}
                className="mt-4 w-full py-2 text-sm text-amber-400 hover:text-amber-300 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-amber-800/60 transition-colors cursor-pointer"
              >
                Mostrar mas ({customShowMore.totalCount - customShowMore.visibleCount} restantes)
              </button>
            )}
          </section>
        )}

        {/* Armas base (preloaded) */}
        {allBaseResults.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-4 border-b border-zinc-700/60 pb-2">
              <h2 className="text-base font-bold text-zinc-400">Armas base</h2>
              <Badge variant="info">{allBaseResults.length}</Badge>
            </div>
            <div className="space-y-6">
              {Array.from(groupedBase.entries()).map(([clase, subMap]) => (
                <div key={clase}>
                  <h3 className="text-lg font-bold text-zinc-200 mb-3">{clase}</h3>
                  {Array.from(subMap.entries()).map(([subcat, items]) => (
                    <div key={subcat} className="mb-4">
                      <h4 className="text-sm font-medium text-zinc-400 mb-2">{subcat} ({items.length})</h4>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {items
                          .sort((a, b) => b.result.dpsEfectivo - a.result.dpsEfectivo)
                          .map(({ weapon, result }) => (
                            <WeaponCard
                              key={weapon.id}
                              weapon={weapon}
                              calcResult={result}
                              onEdit={() => handleEdit(weapon)}
                              onDelete={() => { hideWeapon(weapon.id); toast('Arma oculta', 'info'); }}
                              onDuplicate={() => { duplicateAsTemp(weapon.id); toast('Arma duplicada', 'success'); }}
                              onReset={isModified(weapon.id) ? () => { resetWeapon(weapon.id); toast('Arma reseteada', 'info'); } : undefined}
                              isModified={isModified(weapon.id)}
                            />
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            {baseShowMore.hasMore && (
              <button
                onClick={baseShowMore.showMore}
                className="mt-4 w-full py-2 text-sm text-zinc-400 hover:text-zinc-300 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors cursor-pointer"
              >
                Mostrar mas ({baseShowMore.totalCount - baseShowMore.visibleCount} restantes)
              </button>
            )}
          </section>
        )}

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
