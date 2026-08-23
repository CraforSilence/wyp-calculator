'use client';

import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { JewelrySet, JewelryPiece, JewelrySlot, JewelryBonus, JewelryBonusType } from '@/types/jewelry';

const MAX_BONUSES = 5;

const DEFAULT_JEWELRY: JewelrySet = {
  anillo1: { slot: 'anillo1', bonuses: [] },
  anillo2: { slot: 'anillo2', bonuses: [] },
  amuleto: { slot: 'amuleto', bonuses: [] },
};

// Mapa de tipos de daño viejo → nuevo
const OLD_DAMAGE_MAP: Record<string, JewelryBonusType> = {
  punzante: 'dano_punzante',
  aplastante: 'dano_aplastante',
  cortante: 'dano_cortante',
  electrico: 'dano_electrico',
  hielo: 'dano_hielo',
  fuego: 'dano_fuego',
};

interface OldJewelryPiece {
  slot: JewelrySlot;
  damageType: string | null;
  damageValue: number;
  vidaBonus: number;
}

function migrateOldFormat(data: Record<string, unknown>): JewelrySet | null {
  const slots: JewelrySlot[] = ['anillo1', 'anillo2', 'amuleto'];
  // Check if any piece has old format
  const hasOldFormat = slots.some((s) => {
    const piece = data[s] as Record<string, unknown> | undefined;
    return piece && ('damageType' in piece || 'damageValue' in piece || 'vidaBonus' in piece);
  });
  if (!hasOldFormat) return null;

  const migrated: JewelrySet = { ...DEFAULT_JEWELRY };
  for (const slot of slots) {
    const old = data[slot] as OldJewelryPiece | undefined;
    if (!old) continue;
    const bonuses: JewelryBonus[] = [];
    if (old.damageType && old.damageValue > 0) {
      const newType = OLD_DAMAGE_MAP[old.damageType];
      if (newType) bonuses.push({ type: newType, value: old.damageValue });
    }
    if (old.vidaBonus > 0) {
      bonuses.push({ type: 'vida', value: old.vidaBonus });
    }
    migrated[slot] = { slot, bonuses };
  }
  return migrated;
}

/** Suma todos los bonuses de todas las piezas, agrupados por tipo */
export function aggregateJewelryBonuses(jewelry: JewelrySet): Partial<Record<JewelryBonusType, number>> {
  const totals: Partial<Record<JewelryBonusType, number>> = {};
  for (const piece of Object.values(jewelry)) {
    for (const bonus of piece.bonuses) {
      totals[bonus.type] = (totals[bonus.type] || 0) + bonus.value;
    }
  }
  return totals;
}

export function useJewelry() {
  const [jewelry, setJewelry] = useLocalStorage<JewelrySet>('regnum-jewelry', DEFAULT_JEWELRY, {
    migrate: (raw: unknown) => {
      if (raw && typeof raw === 'object') {
        const migrated = migrateOldFormat(raw as Record<string, unknown>);
        if (migrated) return migrated;
      }
      return undefined;
    },
  });

  const updatePiece = useCallback((slot: JewelrySlot, bonuses: JewelryBonus[]) => {
    setJewelry((prev) => ({
      ...prev,
      [slot]: { slot, bonuses: bonuses.slice(0, MAX_BONUSES) },
    }));
  }, [setJewelry]);

  const addBonus = useCallback((slot: JewelrySlot, bonus: JewelryBonus) => {
    setJewelry((prev) => {
      const piece = prev[slot];
      if (piece.bonuses.length >= MAX_BONUSES) return prev;
      return {
        ...prev,
        [slot]: { ...piece, bonuses: [...piece.bonuses, bonus] },
      };
    });
  }, [setJewelry]);

  const removeBonus = useCallback((slot: JewelrySlot, index: number) => {
    setJewelry((prev) => {
      const piece = prev[slot];
      return {
        ...prev,
        [slot]: { ...piece, bonuses: piece.bonuses.filter((_, i) => i !== index) },
      };
    });
  }, [setJewelry]);

  const updateBonus = useCallback((slot: JewelrySlot, index: number, bonus: JewelryBonus) => {
    setJewelry((prev) => {
      const piece = prev[slot];
      const newBonuses = [...piece.bonuses];
      newBonuses[index] = bonus;
      return {
        ...prev,
        [slot]: { ...piece, bonuses: newBonuses },
      };
    });
  }, [setJewelry]);

  return { jewelry, updatePiece, addBonus, removeBonus, updateBonus };
}
