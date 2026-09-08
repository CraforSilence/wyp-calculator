'use client';

import { useState, useMemo } from 'react';
import { useArmorSets } from '@/hooks/useArmorSets';
import { useShowMore } from '@/hooks/useShowMore';
import { useCharacter } from '@/hooks/useCharacter';
import { ArmorSetTable } from '@/components/armor/ArmorSetTable';
import { ArmorComparison } from '@/components/armor/ArmorComparison';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { CATALOG_ARMOR_SETS } from '@/data/catalog-armor';
import { ARMOR_CLASSES } from '@/lib/engine/constants';
import { ImportModal } from '@/components/ui/ImportModal';
import { encodeShareCode } from '@/lib/share';
import type { ShareResult } from '@/lib/share';
import type { CatalogArmorSet } from '@/types/armor';
import type { Subclase } from '@/types/character';

export default function ArmaduraPage() {
  const {
    sets, addSet, deleteSet,
    hideSet, showSet, resetSet, resetAll,
    duplicateAsCustom, isModified, hiddenIds, hiddenCount,
  } = useArmorSets();
  const { character } = useCharacter();
  const { toast } = useToast();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showHidden, setShowHidden] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [claseFilter, setClaseFilter] = useState<'Todas' | 'Guerrero' | 'Arquero' | 'Mago'>('Todas');
  const [subclaseFilter, setSubclaseFilter] = useState<string>('Todas');

  const armorClass = ARMOR_CLASSES[character.subclase as Subclase] ?? 1.30;

  const SUBCLASES_POR_CLASE: Record<string, string[]> = {
    Guerrero: ['Caballero', 'Bárbaro'],
    Arquero: ['Cazador', 'Tirador'],
    Mago: ['Conjurador', 'Brujo'],
  };

  const subclaseOptions = claseFilter === 'Todas' ? [] : SUBCLASES_POR_CLASE[claseFilter] ?? [];

  const allBaseSetsUnfiltered = useMemo(() => sets.filter((s) => s.isDefault), [sets]);
  const allCustomSetsUnfiltered = useMemo(() => sets.filter((s) => !s.isDefault), [sets]);

  const filterByClaseAndSubclase = (s: CatalogArmorSet) => {
    if (claseFilter !== 'Todas' && s.clase !== claseFilter) return false;
    if (subclaseFilter !== 'Todas' && s.subclase && s.subclase !== subclaseFilter) return false;
    return true;
  };

  const allBaseSets = useMemo(() =>
    allBaseSetsUnfiltered.filter(filterByClaseAndSubclase),
    [allBaseSetsUnfiltered, claseFilter, subclaseFilter]
  );
  const allCustomSets = useMemo(() =>
    allCustomSetsUnfiltered.filter(filterByClaseAndSubclase),
    [allCustomSetsUnfiltered, claseFilter, subclaseFilter]
  );
  const selectedSets = useMemo(() => sets.filter((s) => selectedIds.includes(s.id)), [sets, selectedIds]);

  const baseShowMore = useShowMore(allBaseSets);
  const customShowMore = useShowMore(allCustomSets);

  const baseSets = baseShowMore.visible;
  const customSets = customShowMore.visible;

  const baseCount = allBaseSets.length;
  const customCount = allCustomSets.length;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDelete = (set: CatalogArmorSet) => {
    if (set.isDefault) {
      hideSet(set.id);
      toast('Set oculto', 'info');
    } else {
      deleteSet(set.id);
      toast('Set eliminado', 'info');
    }
    setSelectedIds((prev) => prev.filter((x) => x !== set.id));
  };

  const handleShare = (set: CatalogArmorSet) => {
    const { id, createdAt, isDefault, ...data } = set;
    const code = encodeShareCode('armor', data);
    navigator.clipboard.writeText(code).then(
      () => toast('Codigo copiado al portapapeles', 'success'),
      () => toast('Error al copiar', 'error'),
    );
  };

  const handleImport = (result: ShareResult) => {
    const data = result.data as Omit<CatalogArmorSet, 'id' | 'createdAt' | 'isDefault'>;
    addSet({ ...data, isDefault: false });
    toast('Set importado', 'success');
  };

  const handleDuplicate = (set: CatalogArmorSet) => {
    duplicateAsCustom(set.id);
    toast('Set duplicado', 'success');
  };

  return (
    <div>
      <PageHeader
        title="Armaduras"
        description={`${baseCount} base${claseFilter !== 'Todas' ? ` (${claseFilter})` : ''}, ${customCount} personalizadas${hiddenCount > 0 ? `, ${hiddenCount} ocultas` : ''} — Clase: ${armorClass.toFixed(2)} (${character.subclase})`}
        actions={
          <div className="flex gap-2">
            {hiddenCount > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setShowHidden(!showHidden)}>
                {showHidden ? 'Cerrar ocultas' : `Ocultas (${hiddenCount})`}
              </Button>
            )}
            {selectedIds.length > 0 && (
              <Button variant="secondary" size="sm" onClick={() => setSelectedIds([])}>
                Deseleccionar ({selectedIds.length})
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={resetAll}>Reset todo</Button>
            <Button variant="secondary" size="sm" onClick={() => setShowImport(true)}>Importar</Button>
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
              onClick={() => { setClaseFilter(c); setSubclaseFilter('Todas'); }}
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
              onClick={() => setSubclaseFilter('Todas')}
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
                onClick={() => setSubclaseFilter(sc)}
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
      </div>

      {/* Hidden sets panel */}
      {showHidden && hiddenCount > 0 && (
        <div className="mb-6 bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-zinc-400 mb-2">Sets ocultos</h3>
          <div className="flex flex-wrap gap-2">
            {hiddenIds.map((id) => {
              const s = CATALOG_ARMOR_SETS.find((cs) => cs.id === id);
              if (!s) return null;
              return (
                <button
                  key={id}
                  onClick={() => showSet(id)}
                  className="px-3 py-1 rounded text-xs bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-amber-600 hover:text-amber-400 transition-colors cursor-pointer"
                >
                  {s.nombre} (mostrar)
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Comparison */}
      {selectedSets.length >= 2 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4 border-b border-cyan-800/40 pb-2">
            <h2 className="text-base font-bold text-cyan-400">Comparacion</h2>
            <Badge variant="info">{selectedSets.length} sets</Badge>
          </div>
          <ArmorComparison sets={selectedSets} armorClass={armorClass} />
        </div>
      )}

      {selectedSets.length === 1 && (
        <div className="mb-6 text-center py-3 text-zinc-500 text-sm bg-zinc-900 border border-zinc-800 rounded-lg">
          Selecciona al menos un set mas para comparar.
        </div>
      )}

      <div className="space-y-8">
        {/* Mis sets (user-created) */}
        {allCustomSets.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-4 border-b border-amber-800/40 pb-2">
              <h2 className="text-base font-bold text-amber-400">Mis sets</h2>
              <Badge variant="damage">{customCount}</Badge>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
              <ArmorSetTable
                sets={customSets}
                armorClass={armorClass}
                subclase={character.subclase}
                onEdit={() => {}}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
                onShare={handleShare}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
              />
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

        {/* Sets base (preloaded) */}
        {allBaseSets.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-4 border-b border-zinc-700/60 pb-2">
              <h2 className="text-base font-bold text-zinc-400">Sets base</h2>
              <Badge variant="info">{baseCount}</Badge>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
              <ArmorSetTable
                sets={baseSets}
                armorClass={armorClass}
                subclase={character.subclase}
                onEdit={() => {}}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
                onShare={handleShare}
                onReset={(set) => { resetSet(set.id); toast('Set reseteado', 'info'); }}
                isModified={isModified}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
              />
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

        {sets.length === 0 && (
          <div className="text-center py-12 text-zinc-500">
            <p>Todos los sets estan ocultos.</p>
            <Button className="mt-4" onClick={resetAll}>Mostrar todo</Button>
          </div>
        )}
      </div>

      <ImportModal
        open={showImport}
        onClose={() => setShowImport(false)}
        expectedType="armor"
        onImport={handleImport}
      />
    </div>
  );
}
