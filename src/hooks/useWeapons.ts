'use client';

import { useCallback, useMemo } from 'react';
import { useSessionStorage } from './useSessionStorage';
import { DEFAULT_WEAPONS } from '@/data/default-weapons';
import { generateId } from '@/lib/utils';
import type { Weapon } from '@/types/weapon';

/** Armas temporales creadas por el usuario (sessionStorage) */
const TEMP_KEY = 'regnum-weapons-temp';
/** IDs de armas precargadas ocultas por el usuario (sessionStorage) */
const HIDDEN_KEY = 'regnum-weapons-hidden';
/** Modificaciones temporales sobre armas precargadas (sessionStorage) */
const OVERRIDES_KEY = 'regnum-weapons-overrides';

export function useWeapons() {
  const [tempWeapons, setTempWeapons] = useSessionStorage<Weapon[]>(TEMP_KEY, []);
  const [hiddenIds, setHiddenIds] = useSessionStorage<string[]>(HIDDEN_KEY, []);
  const [overrides, setOverrides] = useSessionStorage<Record<string, Partial<Weapon>>>(OVERRIDES_KEY, {});

  // Merge: precargadas visibles (con overrides) + temporales
  const weapons = useMemo(() => {
    const defaults = DEFAULT_WEAPONS
      .filter((w) => !hiddenIds.includes(w.id))
      .map((w) => (overrides[w.id] ? { ...w, ...overrides[w.id] } : w));
    return [...defaults, ...tempWeapons];
  }, [hiddenIds, overrides, tempWeapons]);

  // All weapons including hidden (for selectors that need the full list)
  const allWeapons = useMemo(() => {
    const defaults = DEFAULT_WEAPONS.map((w) =>
      overrides[w.id] ? { ...w, ...overrides[w.id] } : w
    );
    return [...defaults, ...tempWeapons];
  }, [overrides, tempWeapons]);

  const addWeapon = useCallback((weapon: Omit<Weapon, 'id' | 'createdAt'>) => {
    setTempWeapons((prev) => [
      ...prev,
      { ...weapon, id: generateId(), isDefault: false, createdAt: new Date().toISOString() } as Weapon,
    ]);
  }, [setTempWeapons]);

  const updateWeapon = useCallback((id: string, updates: Partial<Weapon>) => {
    // If it's a default weapon, store as override
    const isDefault = DEFAULT_WEAPONS.some((w) => w.id === id);
    if (isDefault) {
      setOverrides((prev) => ({
        ...prev,
        [id]: { ...(prev[id] || {}), ...updates },
      }));
    } else {
      // It's a temp weapon, update in place
      setTempWeapons((prev) => prev.map((w) => (w.id === id ? { ...w, ...updates } : w)));
    }
  }, [setOverrides, setTempWeapons]);

  const deleteWeapon = useCallback((id: string) => {
    const isDefault = DEFAULT_WEAPONS.some((w) => w.id === id);
    if (isDefault) {
      // Can't delete defaults, only hide
      setHiddenIds((prev) => [...prev, id]);
    } else {
      setTempWeapons((prev) => prev.filter((w) => w.id !== id));
    }
  }, [setHiddenIds, setTempWeapons]);

  const hideWeapon = useCallback((id: string) => {
    setHiddenIds((prev) => prev.includes(id) ? prev : [...prev, id]);
  }, [setHiddenIds]);

  const showWeapon = useCallback((id: string) => {
    setHiddenIds((prev) => prev.filter((x) => x !== id));
  }, [setHiddenIds]);

  const resetWeapon = useCallback((id: string) => {
    setOverrides((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, [setOverrides]);

  const resetAll = useCallback(() => {
    setTempWeapons([]);
    setHiddenIds([]);
    setOverrides({});
  }, [setTempWeapons, setHiddenIds, setOverrides]);

  const duplicateAsTemp = useCallback((id: string) => {
    const source = allWeapons.find((w) => w.id === id);
    if (!source) return;
    const copy: Weapon = {
      ...source,
      id: generateId(),
      nombre: `${source.nombre} (copia)`,
      isDefault: false,
      createdAt: new Date().toISOString(),
    };
    setTempWeapons((prev) => [...prev, copy]);
  }, [allWeapons, setTempWeapons]);

  const isModified = useCallback((id: string) => {
    return !!overrides[id];
  }, [overrides]);

  const hiddenCount = hiddenIds.length;

  return {
    weapons,
    allWeapons,
    addWeapon,
    updateWeapon,
    deleteWeapon,
    hideWeapon,
    showWeapon,
    resetWeapon,
    resetAll,
    duplicateAsTemp,
    isModified,
    hiddenIds,
    hiddenCount,
  };
}
