'use client';

import { useEffect, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useArmor } from '@/hooks/useArmor';
import { useArmorSets } from '@/hooks/useArmorSets';
import { useCharacter } from '@/hooks/useCharacter';
import { setBonusesFor } from '@/lib/engine/armor';
import { DEFAULT_ARMOR_SETS } from '@/data/default-armor';
import type { CatalogArmorSet } from '@/types/armor';

/**
 * Set precargado en la armadura del Build. Mantiene sus bonus de conjunto guardados en la
 * armadura (`bonusConjunto`) para que los calculos y la simulacion los apliquen, tambien al
 * cambiar de subclase o con armaduras guardadas antes de que existiera el campo.
 */
export function useActiveArmorPreset() {
  const { character } = useCharacter();
  const { armorSet, updateSet } = useArmor();
  const { sets: savedSets } = useArmorSets();
  // Se guarda el id del set precargado para no perder sus bonus de conjunto al cambiar de tab
  const [activePresetId, setActivePresetId] = useLocalStorage<string>('regnum-build-armor-preset', '');

  const activePreset = useMemo<CatalogArmorSet | null>(() => {
    if (!activePresetId) return null;
    return (savedSets.find((s) => s.id === activePresetId)
      || DEFAULT_ARMOR_SETS.find((s) => s.id === activePresetId)
      || null) as CatalogArmorSet | null;
  }, [activePresetId, savedSets]);

  const expected = activePreset ? setBonusesFor(activePreset, character.subclase) : [];
  const expectedKey = JSON.stringify(expected);
  const storedKey = JSON.stringify(armorSet.bonusConjunto ?? []);

  useEffect(() => {
    if (expectedKey !== storedKey) updateSet({ bonusConjunto: JSON.parse(expectedKey) });
  }, [expectedKey, storedKey, updateSet]);

  return { activePreset, activePresetId, setActivePresetId };
}
