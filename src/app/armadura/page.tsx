'use client';

import { useState, useMemo, useEffect } from 'react';
import { useArmorSets } from '@/hooks/useArmorSets';
import { useShowMore } from '@/hooks/useShowMore';
import { useCharacter } from '@/hooks/useCharacter';
import { ArmorSetTable } from '@/components/armor/ArmorSetTable';
import { ArmorSetCards } from '@/components/armor/ArmorSetCards';
import { ArmorComparison } from '@/components/armor/ArmorComparison';
import { ArmorSetForm } from '@/components/armor/ArmorSetForm';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { CATALOG_ARMOR_SETS } from '@/data/catalog-armor';
import { ARMOR_CLASSES } from '@/lib/engine/constants';
import { ImportModal } from '@/components/ui/ImportModal';
import { useShare } from '@/components/ui/ShareProvider';
import { useShareImport } from '@/hooks/useShareImport';
import type { ShareResult } from '@/lib/share';
import type { CatalogArmorSet } from '@/types/armor';
import type { Subclase } from '@/types/character';
import { useT } from '@/i18n/I18nProvider';

export default function ArmaduraPage() {
  const t = useT();
  const {
    sets, addSet, updateSet, deleteSet,
    hideSet, showSet, resetSet, resetAll,
    duplicateAsCustom, isModified, hiddenIds, hiddenCount,
  } = useArmorSets();
  const { character } = useCharacter();
  const { toast } = useToast();
  const { share } = useShare();
  const { importShare } = useShareImport();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showHidden, setShowHidden] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingSet, setEditingSet] = useState<CatalogArmorSet | null>(null);
  const [claseFilter, setClaseFilter] = useState<'Todas' | 'Guerrero' | 'Arquero' | 'Mago'>('Todas');
  const [subclaseFilter, setSubclaseFilter] = useState<string>('Todas');

  // Vista de los sets: tarjetas (como Armas) o tabla. Se recuerda en el navegador.
  const [view, setView] = useState<'cards' | 'list'>('cards');
  useEffect(() => {
    try { if (localStorage.getItem('regnum-armor-view') === 'list') setView('list'); } catch {}
  }, []);
  const changeView = (v: 'cards' | 'list') => {
    setView(v);
    try { localStorage.setItem('regnum-armor-view', v); } catch {}
  };
  const SetList = view === 'cards' ? ArmorSetCards : ArmorSetTable;
  // La tabla va dentro de un recuadro; las tarjetas ya tienen el suyo.
  const listWrap = view === 'cards' ? '' : 'bg-zinc-900 border border-zinc-800 rounded-lg';

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
      toast(t("Set oculto"), 'info');
    } else {
      deleteSet(set.id);
      toast(t("Set eliminado"), 'info');
    }
    setSelectedIds((prev) => prev.filter((x) => x !== set.id));
  };

  const handleShare = (set: CatalogArmorSet) => {
    const { id, createdAt, isDefault, ...data } = set;
    share('armor', data);
  };

  const handleImport = (result: ShareResult) => {
    toast(importShare(result).message, 'success');
  };

  const handleDuplicate = (set: CatalogArmorSet) => {
    duplicateAsCustom(set.id);
    toast(t("Set duplicado"), 'success');
  };

  const handleSave = (setData: Omit<CatalogArmorSet, 'id' | 'createdAt'>) => {
    if (editingSet) {
      updateSet(editingSet.id, setData);
      toast(t("Set actualizado"), 'success');
    } else {
      addSet(setData);
      toast(t("Set agregado"), 'success');
    }
    setShowForm(false);
    setEditingSet(null);
  };

  const handleEdit = (set: CatalogArmorSet) => {
    setEditingSet(set);
    setShowForm(true);
  };

  return (
    <div>
      <PageHeader
        title={t("Armaduras")}
        description={t('{base} base', { base: baseCount }) + (claseFilter !== 'Todas' ? ` (${t(claseFilter)})` : '') + t(', {propias} personalizadas', { propias: customCount }) + (hiddenCount > 0 ? t(', {n} ocultas', { n: hiddenCount }) : '') + ` — ${t('Clase de armadura')}: ${armorClass.toFixed(2)} (${t(character.subclase)})`}
        actions={
          <div className="flex gap-2">
            {hiddenCount > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setShowHidden(!showHidden)}>
                {showHidden ? t("Cerrar ocultas") : `Ocultas (${hiddenCount})`}
              </Button>
            )}
            {selectedIds.length > 0 && (
              <Button variant="secondary" size="sm" onClick={() => setSelectedIds([])}>
                Deseleccionar ({selectedIds.length})
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={resetAll}>{t("Reset todo")}</Button>
            <Button variant="secondary" size="sm" onClick={() => setShowImport(true)}>{t("Importar")}</Button>
            <Button size="sm" onClick={() => { setEditingSet(null); setShowForm(!showForm); }}>
              {showForm ? t("Cerrar") : t("+ Nuevo set")}
            </Button>
          </div>
        }
      />

      {showForm && (
        <div className="mb-6">
          <ArmorSetForm
            editingSet={editingSet}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditingSet(null); }}
          />
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">{t("Clase:")}</span>
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
              {t(c)}
            </button>
          ))}
        </div>
        {subclaseOptions.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">{t("Subclase:")}</span>
            <button
              onClick={() => setSubclaseFilter('Todas')}
              className={`px-3 py-1 rounded text-xs border transition-colors cursor-pointer ${
                subclaseFilter === 'Todas'
                  ? 'bg-cyan-900/30 border-cyan-700 text-cyan-400'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
              }`}
            >
              {t("Todas")}
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
        <div className="ml-auto flex rounded-md border border-zinc-800 bg-zinc-900 p-0.5" role="group" aria-label={t('Vista')}>
          {(['cards', 'list'] as const).map((v) => (
            <button
              key={v}
              onClick={() => changeView(v)}
              aria-pressed={view === v}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                view === v ? 'bg-amber-900/30 text-amber-400' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                {v === 'cards'
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M4 5h7v6H4zM13 5h7v6h-7zM4 13h7v6H4zM13 13h7v6h-7z" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
              {v === 'cards' ? t('Tarjetas') : t('Lista')}
            </button>
          ))}
        </div>
      </div>

      {/* Hidden sets panel */}
      {showHidden && hiddenCount > 0 && (
        <div className="mb-6 bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-zinc-400 mb-2">{t("Sets ocultos")}</h3>
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
            <h2 className="text-base font-bold text-cyan-400">{t('Comparación')}</h2>
            <Badge variant="info">{selectedSets.length} sets</Badge>
          </div>
          <ArmorComparison sets={selectedSets} armorClass={armorClass} />
        </div>
      )}

      {selectedSets.length === 1 && (
        <div className="mb-6 text-center py-3 text-zinc-500 text-sm bg-zinc-900 border border-zinc-800 rounded-lg">
          {t('Seleccioná al menos un set más para comparar.')}
        </div>
      )}

      <div className="space-y-8">
        {/* Mis sets (user-created) */}
        {allCustomSets.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-4 border-b border-amber-800/40 pb-2">
              <h2 className="text-base font-bold text-amber-400">{t("Mis sets")}</h2>
              <Badge variant="damage">{customCount}</Badge>
            </div>
            <div className={listWrap}>
              <SetList
                sets={customSets}
                armorClass={armorClass}
                subclase={character.subclase}
                onEdit={handleEdit}
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
              <h2 className="text-base font-bold text-zinc-400">{t("Sets base")}</h2>
              <Badge variant="info">{baseCount}</Badge>
            </div>
            <div className={listWrap}>
              <SetList
                sets={baseSets}
                armorClass={armorClass}
                subclase={character.subclase}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
                onShare={handleShare}
                onReset={(set) => { resetSet(set.id); toast(t("Set reseteado"), 'info'); }}
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
            <p>{t('Todos los sets están ocultos.')}</p>
            <Button className="mt-4" onClick={resetAll}>{t("Mostrar todo")}</Button>
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
