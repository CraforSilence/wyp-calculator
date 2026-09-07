'use client';

import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { CATALOG_ARMOR_SETS } from '@/data/catalog-armor';
import { generateId } from '@/lib/utils';
import type { CatalogArmorSet } from '@/types/armor';

/** Sets de armadura personalizados creados por el usuario */
const CUSTOM_KEY = 'regnum-armor-sets-custom';
/** IDs de sets precargados ocultos por el usuario */
const HIDDEN_KEY = 'regnum-armor-sets-hidden';
/** Modificaciones sobre sets precargados */
const OVERRIDES_KEY = 'regnum-armor-sets-overrides';

export function useArmorSets() {
  const [customSets, setCustomSets] = useLocalStorage<CatalogArmorSet[]>(CUSTOM_KEY, []);
  const [hiddenIds, setHiddenIds] = useLocalStorage<string[]>(HIDDEN_KEY, []);
  const [overrides, setOverrides] = useLocalStorage<Record<string, Partial<CatalogArmorSet>>>(OVERRIDES_KEY, {});

  const sets = useMemo(() => {
    const defaults = CATALOG_ARMOR_SETS
      .filter((s) => !hiddenIds.includes(s.id))
      .map((s) => (overrides[s.id] ? { ...s, ...overrides[s.id] } : s));
    return [...defaults, ...customSets];
  }, [hiddenIds, overrides, customSets]);

  const allSets = useMemo(() => {
    const defaults = CATALOG_ARMOR_SETS.map((s) =>
      overrides[s.id] ? { ...s, ...overrides[s.id] } : s
    );
    return [...defaults, ...customSets];
  }, [overrides, customSets]);

  const MAX_CUSTOM = 50;

  const addSet = useCallback((set: Omit<CatalogArmorSet, 'id' | 'createdAt'>) => {
    setCustomSets((prev) => {
      if (prev.length >= MAX_CUSTOM) return prev;
      return [
        ...prev,
        { ...set, id: generateId(), isDefault: false, createdAt: new Date().toISOString() } as CatalogArmorSet,
      ];
    });
  }, [setCustomSets]);

  const updateSet = useCallback((id: string, updates: Partial<CatalogArmorSet>) => {
    const isDefault = CATALOG_ARMOR_SETS.some((s) => s.id === id);
    if (isDefault) {
      setOverrides((prev) => ({
        ...prev,
        [id]: { ...(prev[id] || {}), ...updates },
      }));
    } else {
      setCustomSets((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    }
  }, [setOverrides, setCustomSets]);

  const deleteSet = useCallback((id: string) => {
    const isDefault = CATALOG_ARMOR_SETS.some((s) => s.id === id);
    if (isDefault) {
      setHiddenIds((prev) => [...prev, id]);
    } else {
      setCustomSets((prev) => prev.filter((s) => s.id !== id));
    }
  }, [setHiddenIds, setCustomSets]);

  const hideSet = useCallback((id: string) => {
    setHiddenIds((prev) => prev.includes(id) ? prev : [...prev, id]);
  }, [setHiddenIds]);

  const showSet = useCallback((id: string) => {
    setHiddenIds((prev) => prev.filter((x) => x !== id));
  }, [setHiddenIds]);

  const resetSet = useCallback((id: string) => {
    setOverrides((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, [setOverrides]);

  const resetAll = useCallback(() => {
    setCustomSets([]);
    setHiddenIds([]);
    setOverrides({});
  }, [setCustomSets, setHiddenIds, setOverrides]);

  const duplicateAsCustom = useCallback((id: string) => {
    const source = allSets.find((s) => s.id === id);
    if (!source) return;
    const copy: CatalogArmorSet = {
      ...source,
      id: generateId(),
      nombre: `${source.nombre} (copia)`,
      isDefault: false,
      createdAt: new Date().toISOString(),
    };
    setCustomSets((prev) => [...prev, copy]);
  }, [allSets, setCustomSets]);

  const isModified = useCallback((id: string) => {
    return !!overrides[id];
  }, [overrides]);

  const hiddenCount = hiddenIds.length;

  return {
    sets,
    allSets,
    addSet,
    updateSet,
    deleteSet,
    hideSet,
    showSet,
    resetSet,
    resetAll,
    duplicateAsCustom,
    isModified,
    hiddenIds,
    hiddenCount,
  };
}
