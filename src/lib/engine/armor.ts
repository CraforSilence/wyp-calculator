import type { ArmorPiece, ArmorSet, ProtectionResult } from '@/types/armor';
import type { DamageTypeName } from '@/types/weapon';
import { ITEM_DISTRIBUTION, PROTECTION_FACTORS, ALL_DAMAGE_TYPES } from './constants';

/**
 * Calculates protection for a single armor piece per damage type.
 * Formula: protection[type] = (ceil(PBA * distribution * PF) + BCMT) * (1 + bonusProt%/100) * (1 + bonusArmadura%/100) * armorClass
 */
export function calcPieceProtection(
  piece: ArmorPiece,
  armorClass: number,
  bonusArmaduraPct: number = 0
): Record<string, number> {
  const distribution = ITEM_DISTRIBUTION[piece.slot] ?? 0;
  const result: Record<string, number> = {};

  for (const dmgType of ALL_DAMAGE_TYPES) {
    const quality = piece.protectionFactors[dmgType];
    if (!quality) {
      result[dmgType] = 0;
      continue;
    }

    const pf = PROTECTION_FACTORS[quality];

    // Step 1a: Base protection
    let protection = Math.ceil(piece.pba * distribution * pf) + piece.bcmt;

    // Step 1c: Per-type protection % bonus
    const typePctBonus = piece.bonusProteccionPct[dmgType] ?? 0;
    if (typePctBonus > 0) {
      protection += protection * typePctBonus / 100;
    }

    // Step 1d: Overall armor % bonus (global, from buffs/skills)
    if (bonusArmaduraPct > 0) {
      protection += protection * bonusArmaduraPct / 100;
    }

    // Step 1e: Multiply by armor class
    protection *= armorClass;

    result[dmgType] = protection;
  }

  return result;
}

/**
 * Calculates total protection across all armor pieces.
 */
export function calcTotalProtection(
  armorSet: ArmorSet,
  armorClass: number
): ProtectionResult {
  const perPiece: Record<string, Record<string, number>> = {};
  const perType: Record<string, number> = {};

  // Initialize all types to 0
  for (const t of ALL_DAMAGE_TYPES) {
    perType[t] = 0;
  }

  for (const [slot, piece] of Object.entries(armorSet.pieces)) {
    if (!piece) continue;
    const pieceProtection = calcPieceProtection(piece, armorClass, armorSet.bonusArmaduraPct);
    perPiece[slot] = pieceProtection;

    for (const [type, value] of Object.entries(pieceProtection)) {
      perType[type] = (perType[type] || 0) + value;
    }
  }

  return { perType, perPiece };
}

/**
 * Calculates the average Protection Factor per damage type across all equipped pieces.
 * Used for special damage reduction (gem/muesca damage only reduced by PF).
 */
export function calcAverageProtectionFactors(
  armorSet: ArmorSet
): Record<string, number> {
  const pfSums: Record<string, number> = {};
  const pfCounts: Record<string, number> = {};

  for (const piece of Object.values(armorSet.pieces)) {
    if (!piece) continue;
    for (const dmgType of ALL_DAMAGE_TYPES) {
      const quality = piece.protectionFactors[dmgType];
      if (!quality) continue;
      const pf = PROTECTION_FACTORS[quality];
      pfSums[dmgType] = (pfSums[dmgType] || 0) + pf;
      pfCounts[dmgType] = (pfCounts[dmgType] || 0) + 1;
    }
  }

  const result: Record<string, number> = {};
  for (const dmgType of ALL_DAMAGE_TYPES) {
    result[dmgType] = pfCounts[dmgType] > 0 ? pfSums[dmgType] / pfCounts[dmgType] : 0;
  }
  return result;
}
