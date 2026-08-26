'use client';

import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { ArmorPiece, ArmorSet, ArmorSlot } from '@/types/armor';
import { ALL_DAMAGE_TYPES } from '@/lib/engine/constants';

const DEFAULT_ARMOR_SET: ArmorSet = {
  pieces: {},
  bonusArmaduraPct: 0,
  generalResistance: { fisico: 0, magico: 0 },
  typeResistance: {},
  barrierPoints: {},
  meleeDmgReductionPct: 0,
  rangedDmgReductionPct: 0,
};

function makeEmptyPiece(slot: ArmorSlot): ArmorPiece {
  const protectionFactors: Record<string, string> = {};
  for (const t of ALL_DAMAGE_TYPES) protectionFactors[t] = 'Normal';
  return { slot, pba: 0, bcmt: 0, protectionFactors, bonusProteccionPct: {}, bonuses: [], upgrades: [] };
}

interface OldArmorPiece {
  id: string;
  slot: ArmorSlot;
  nombre: string;
  pba: number;
  bcmt: number;
  protectionFactors: ArmorPiece['protectionFactors'];
  bonusProteccionPct: ArmorPiece['bonusProteccionPct'];
  bonusArmaduraPct?: number;
}

/** Ensure every piece has bonuses and upgrades arrays (handles data saved before they existed) */
function ensurePieceFields(pieces: Partial<Record<ArmorSlot, ArmorPiece>>): Partial<Record<ArmorSlot, ArmorPiece>> {
  let changed = false;
  const result = { ...pieces };
  for (const [slot, piece] of Object.entries(result)) {
    if (piece && (!Array.isArray(piece.bonuses) || !Array.isArray(piece.upgrades))) {
      result[slot as ArmorSlot] = {
        ...piece,
        bonuses: Array.isArray(piece.bonuses) ? piece.bonuses : [],
        upgrades: Array.isArray(piece.upgrades) ? piece.upgrades : [],
      };
      changed = true;
    }
  }
  return changed ? result : pieces;
}

function migrateOldFormat(raw: Record<string, unknown>): ArmorSet | undefined {
  const pieces = raw.pieces;

  // Old format: pieces is an array
  if (Array.isArray(pieces)) {
    const newPieces: Partial<Record<ArmorSlot, ArmorPiece>> = {};
    for (const old of pieces as OldArmorPiece[]) {
      if (old.slot) {
        newPieces[old.slot] = {
          slot: old.slot,
          pba: old.pba || 0,
          bcmt: old.bcmt || 0,
          protectionFactors: old.protectionFactors || {},
          bonusProteccionPct: old.bonusProteccionPct || {},
          bonuses: [],
          upgrades: [],
        };
      }
    }
    return {
      pieces: newPieces,
      bonusArmaduraPct: 0,
      generalResistance: (raw.generalResistance as ArmorSet['generalResistance']) || { fisico: 0, magico: 0 },
      typeResistance: (raw.typeResistance as ArmorSet['typeResistance']) || {},
      barrierPoints: (raw.barrierPoints as ArmorSet['barrierPoints']) || {},
      meleeDmgReductionPct: (raw.meleeDmgReductionPct as number) || 0,
      rangedDmgReductionPct: (raw.rangedDmgReductionPct as number) || 0,
    };
  }

  // Dict format but pieces may lack bonuses/upgrades fields
  if (pieces && typeof pieces === 'object') {
    const migrated = ensurePieceFields(pieces as Partial<Record<ArmorSlot, ArmorPiece>>);
    if (migrated !== pieces) {
      const { armorUpgrades: _removed, ...rest } = raw as Record<string, unknown>;
      return { ...(rest as unknown as ArmorSet), pieces: migrated };
    }
  }

  return undefined;
}

export function useArmor() {
  const [armorSet, setArmorSet] = useLocalStorage<ArmorSet>('regnum-armor', DEFAULT_ARMOR_SET, {
    migrate: (raw: unknown) => {
      if (raw && typeof raw === 'object') {
        return migrateOldFormat(raw as Record<string, unknown>);
      }
      return undefined;
    },
  });

  const updateSlot = useCallback((slot: ArmorSlot, updates: Partial<ArmorPiece>) => {
    setArmorSet((prev) => {
      const existing = prev.pieces[slot] || makeEmptyPiece(slot);
      return {
        ...prev,
        pieces: { ...prev.pieces, [slot]: { ...existing, ...updates, slot } },
      };
    });
  }, [setArmorSet]);

  const clearSlot = useCallback((slot: ArmorSlot) => {
    setArmorSet((prev) => {
      const newPieces = { ...prev.pieces };
      delete newPieces[slot];
      return { ...prev, pieces: newPieces };
    });
  }, [setArmorSet]);

  const updateSet = useCallback((updates: Partial<Omit<ArmorSet, 'pieces'>>) => {
    setArmorSet((prev) => ({ ...prev, ...updates }));
  }, [setArmorSet]);

  return { armorSet, updateSlot, clearSlot, updateSet };
}
