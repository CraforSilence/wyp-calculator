'use client';

import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { DEFAULT_JEWELRY } from '@/data/default-jewelry';
import { generateId } from '@/lib/utils';
import type { JewelryItem } from '@/types/jewelry';

/** Joyas personalizadas creadas por el usuario */
const CUSTOM_KEY = 'regnum-jewelry-custom';
/** IDs de joyas precargadas ocultas por el usuario */
const HIDDEN_KEY = 'regnum-jewelry-hidden';
/** Modificaciones sobre joyas precargadas */
const OVERRIDES_KEY = 'regnum-jewelry-overrides';

export function useJewelryItems() {
  const [customItems, setCustomItems] = useLocalStorage<JewelryItem[]>(CUSTOM_KEY, []);
  const [hiddenIds, setHiddenIds] = useLocalStorage<string[]>(HIDDEN_KEY, []);
  const [overrides, setOverrides] = useLocalStorage<Record<string, Partial<JewelryItem>>>(OVERRIDES_KEY, {});

  const items = useMemo(() => {
    const defaults = DEFAULT_JEWELRY
      .filter((j) => !hiddenIds.includes(j.id))
      .map((j) => (overrides[j.id] ? { ...j, ...overrides[j.id] } : j));
    return [...defaults, ...customItems];
  }, [hiddenIds, overrides, customItems]);

  const allItems = useMemo(() => {
    const defaults = DEFAULT_JEWELRY.map((j) =>
      overrides[j.id] ? { ...j, ...overrides[j.id] } : j
    );
    return [...defaults, ...customItems];
  }, [overrides, customItems]);

  const MAX_CUSTOM = 50;

  const addItem = useCallback((item: Omit<JewelryItem, 'id' | 'createdAt'>) => {
    setCustomItems((prev) => {
      if (prev.length >= MAX_CUSTOM) return prev;
      return [
        ...prev,
        { ...item, id: generateId(), isDefault: false, createdAt: new Date().toISOString() } as JewelryItem,
      ];
    });
  }, [setCustomItems]);

  const updateItem = useCallback((id: string, updates: Partial<JewelryItem>) => {
    const isDefault = DEFAULT_JEWELRY.some((j) => j.id === id);
    if (isDefault) {
      setOverrides((prev) => ({
        ...prev,
        [id]: { ...(prev[id] || {}), ...updates },
      }));
    } else {
      setCustomItems((prev) => prev.map((j) => (j.id === id ? { ...j, ...updates } : j)));
    }
  }, [setOverrides, setCustomItems]);

  const deleteItem = useCallback((id: string) => {
    const isDefault = DEFAULT_JEWELRY.some((j) => j.id === id);
    if (isDefault) {
      setHiddenIds((prev) => [...prev, id]);
    } else {
      setCustomItems((prev) => prev.filter((j) => j.id !== id));
    }
  }, [setHiddenIds, setCustomItems]);

  const hideItem = useCallback((id: string) => {
    setHiddenIds((prev) => prev.includes(id) ? prev : [...prev, id]);
  }, [setHiddenIds]);

  const showItem = useCallback((id: string) => {
    setHiddenIds((prev) => prev.filter((x) => x !== id));
  }, [setHiddenIds]);

  const resetItem = useCallback((id: string) => {
    setOverrides((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, [setOverrides]);

  const resetAll = useCallback(() => {
    setCustomItems([]);
    setHiddenIds([]);
    setOverrides({});
  }, [setCustomItems, setHiddenIds, setOverrides]);

  const duplicateAsCustom = useCallback((id: string) => {
    const source = allItems.find((j) => j.id === id);
    if (!source) return;
    const copy: JewelryItem = {
      ...source,
      id: generateId(),
      nombre: `${source.nombre} (copia)`,
      isDefault: false,
      createdAt: new Date().toISOString(),
    };
    setCustomItems((prev) => [...prev, copy]);
  }, [allItems, setCustomItems]);

  const isModified = useCallback((id: string) => {
    return !!overrides[id];
  }, [overrides]);

  const hiddenCount = hiddenIds.length;

  return {
    items,
    allItems,
    addItem,
    updateItem,
    deleteItem,
    hideItem,
    showItem,
    resetItem,
    resetAll,
    duplicateAsCustom,
    isModified,
    hiddenIds,
    hiddenCount,
  };
}
