'use client';

import { useState, useMemo } from 'react';
import { useJewelryItems } from '@/hooks/useJewelryItems';
import { useShowMore } from '@/hooks/useShowMore';
import { JewelryForm } from '@/components/jewelry/JewelryForm';
import { JewelryTable } from '@/components/jewelry/JewelryTable';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { DEFAULT_JEWELRY } from '@/data/default-jewelry';
import type { JewelryItem } from '@/types/jewelry';

export default function JoyeriaPage() {
  const {
    items, addItem, updateItem, deleteItem,
    hideItem, showItem, resetItem, resetAll,
    duplicateAsCustom, isModified, hiddenIds, hiddenCount,
  } = useJewelryItems();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<JewelryItem | null>(null);
  const [showHidden, setShowHidden] = useState(false);

  const allBaseItems = useMemo(() => items.filter((j) => j.isDefault), [items]);
  const allCustomItems = useMemo(() => items.filter((j) => !j.isDefault), [items]);

  const baseShowMore = useShowMore(allBaseItems);
  const customShowMore = useShowMore(allCustomItems);

  const baseItems = baseShowMore.visible;
  const customItems = customShowMore.visible;

  const baseCount = allBaseItems.length;
  const customCount = allCustomItems.length;

  const handleSave = (data: Omit<JewelryItem, 'id' | 'createdAt'>) => {
    if (editingItem) {
      updateItem(editingItem.id, data);
      toast('Joya actualizada', 'success');
    } else {
      addItem(data);
      toast('Joya agregada', 'success');
    }
    setShowForm(false);
    setEditingItem(null);
  };

  const handleEdit = (item: JewelryItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = (item: JewelryItem) => {
    if (item.isDefault) {
      hideItem(item.id);
      toast('Joya oculta', 'info');
    } else {
      deleteItem(item.id);
      toast('Joya eliminada', 'info');
    }
  };

  return (
    <div>
      <PageHeader
        title="Joyeria"
        description={`${baseCount} base, ${customCount} personalizadas${hiddenCount > 0 ? `, ${hiddenCount} ocultas` : ''}`}
        actions={
          <div className="flex gap-2">
            {hiddenCount > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setShowHidden(!showHidden)}>
                {showHidden ? 'Cerrar ocultas' : `Ocultas (${hiddenCount})`}
              </Button>
            )}
            {(customCount > 0 || hiddenCount > 0) && (
              <Button variant="secondary" size="sm" onClick={resetAll}>Reset todo</Button>
            )}
            <Button size="sm" onClick={() => { setEditingItem(null); setShowForm(!showForm); }}>
              {showForm ? 'Cerrar' : '+ Nueva joya'}
            </Button>
          </div>
        }
      />

      {/* Hidden items panel */}
      {showHidden && hiddenCount > 0 && (
        <div className="mb-6 bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-zinc-400 mb-2">Joyas ocultas</h3>
          <div className="flex flex-wrap gap-2">
            {hiddenIds.map((id) => {
              const j = DEFAULT_JEWELRY.find((dj) => dj.id === id);
              if (!j) return null;
              return (
                <button
                  key={id}
                  onClick={() => showItem(id)}
                  className="px-3 py-1 rounded text-xs bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-amber-600 hover:text-amber-400 transition-colors cursor-pointer"
                >
                  {j.nombre} (mostrar)
                </button>
              );
            })}
          </div>
        </div>
      )}

      {showForm && (
        <div className="mb-6">
          <JewelryForm
            editingItem={editingItem}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditingItem(null); }}
          />
        </div>
      )}

      <div className="space-y-8">
        {/* Mis joyas (user-created) */}
        {allCustomItems.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-4 border-b border-amber-800/40 pb-2">
              <h2 className="text-base font-bold text-amber-400">Mis joyas</h2>
              <Badge variant="damage">{customCount}</Badge>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
              <JewelryTable
                items={customItems}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDuplicate={(item) => { duplicateAsCustom(item.id); toast('Joya duplicada', 'success'); }}
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

        {/* Joyas base (preloaded) */}
        {allBaseItems.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-4 border-b border-zinc-700/60 pb-2">
              <h2 className="text-base font-bold text-zinc-400">Joyas base</h2>
              <Badge variant="info">{baseCount}</Badge>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
              <JewelryTable
                items={baseItems}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDuplicate={(item) => { duplicateAsCustom(item.id); toast('Joya duplicada', 'success'); }}
                onReset={(item) => { resetItem(item.id); toast('Joya reseteada', 'info'); }}
                isModified={isModified}
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

        {items.length === 0 && !showForm && (
          <div className="text-center py-12 text-zinc-500">
            <p>No hay joyas cargadas.</p>
            <p className="text-xs mt-1">Usa el boton &quot;+ Nueva joya&quot; para agregar una.</p>
          </div>
        )}
      </div>
    </div>
  );
}
