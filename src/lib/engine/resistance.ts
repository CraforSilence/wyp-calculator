import type { ArmorSet, ProtectionResult } from '@/types/armor';
import type { SimulationHit } from '@/types/simulation';
import { PHYSICAL_DAMAGE_TYPES } from './constants';

/**
 * Full damage reduction pipeline from Formulas.md.
 * Takes raw incoming damage per type and applies:
 * 1. Protection influence
 * 2. Minimum damage floor (4-8%)
 * 3. Protection reduction
 * 4. General resistance (fisico/magico)
 * 5. Per-type resistance
 * 6. Enforce minimum damage
 * 7. Special damage (gem damage reduced only by PF)
 * 8. Sum + special
 * 9. Magical barrier
 * 10. Melee/ranged reduction
 * 11. ceil()
 */
export function applyDamageReduction(
  incomingDamage: Record<string, number>,
  specialDamage: Record<string, number>,
  protection: ProtectionResult,
  armorSet: ArmorSet,
  isMelee: boolean = true
): SimulationHit {
  const damageTypes = Object.keys(incomingDamage);
  const totalRawDamage = Object.values(incomingDamage).reduce((s, v) => s + v, 0);

  if (totalRawDamage <= 0) {
    return {
      hitNumber: 0,
      rawDamage: incomingDamage,
      totalRawDamage: 0,
      protectionApplied: {},
      resistanceApplied: {},
      specialDamage,
      barrierReduction: 0,
      finalDamage: 0,
      isCrit: false,
      minimumDamageEnforced: false,
    };
  }

  // Step 3a: Calculate protection influence and minimum damage per type
  const protInfluence: Record<string, number> = {};
  const minimumDamage: Record<string, number> = {};
  const minDmgPct = 4 + Math.random() * 4; // 4-8%

  for (const type of damageTypes) {
    protInfluence[type] = (100 / totalRawDamage) * incomingDamage[type];
    minimumDamage[type] = incomingDamage[type] / 100 * minDmgPct;
  }

  // Work with mutable damage values
  const damage: Record<string, number> = { ...incomingDamage };
  const protectionApplied: Record<string, number> = {};
  const resistanceApplied: Record<string, number> = {};
  let minimumDamageEnforced = false;

  for (const type of damageTypes) {
    // Step 3b: Reduce by protection
    const protValue = (protection.perType[type] || 0) * (protInfluence[type] / 100);
    damage[type] -= protValue;
    protectionApplied[type] = protValue;

    // Step 3c: General resistance (fisico/magico)
    const isPhysical = PHYSICAL_DAMAGE_TYPES.includes(type as never);
    const generalRes = isPhysical
      ? armorSet.generalResistance.fisico
      : armorSet.generalResistance.magico;
    if (generalRes > 0) {
      const genReduc = damage[type] * generalRes / 100;
      damage[type] -= genReduc;
      resistanceApplied[type] = (resistanceApplied[type] || 0) + genReduc;
    }

    // Step 3d: Per-type resistance
    const typeRes = armorSet.typeResistance[type as keyof typeof armorSet.typeResistance] ?? 0;
    if (typeRes > 0) {
      const typeReduc = damage[type] * typeRes / 100;
      damage[type] -= typeReduc;
      resistanceApplied[type] = (resistanceApplied[type] || 0) + typeReduc;
    }

    // Step 3e: Enforce minimum damage
    if (damage[type] < minimumDamage[type]) {
      damage[type] = minimumDamage[type];
      minimumDamageEnforced = true;
    }
  }

  // Step 3f: Special damage (gem bonus damage) reduced only by protection factor
  // For simplicity, we use a flat reduction approach
  const processedSpecial: Record<string, number> = {};
  for (const [type, value] of Object.entries(specialDamage)) {
    if (value <= 0) continue;
    // Special damage reduced by (value * PF) where PF is an average protection factor
    // Simplified: use the ratio of protection to total raw damage
    const protRatio = (protection.perType[type] || 0) / Math.max(totalRawDamage, 1);
    processedSpecial[type] = Math.ceil(value - (value * Math.min(protRatio, 0.8)));
  }

  // Step 3g: Total damage
  let totalDamage = Object.values(damage).reduce((s, v) => s + v, 0)
    + Object.values(processedSpecial).reduce((s, v) => s + v, 0);

  // Step 3h: Magical barrier
  let barrierReduction = 0;
  for (const type of damageTypes) {
    const barrier = armorSet.barrierPoints[type as keyof typeof armorSet.barrierPoints] ?? 0;
    if (barrier > 0) {
      damage[type] -= barrier;
      barrierReduction += barrier;
    }
  }
  totalDamage -= barrierReduction;

  // Step 3i: Melee/ranged damage reduction
  const rangePct = isMelee ? armorSet.meleeDmgReductionPct : armorSet.rangedDmgReductionPct;
  if (rangePct > 0) {
    totalDamage -= totalDamage * rangePct / 100;
  }

  // Step 3j: Floor at 0, then ceil
  const finalDamage = Math.max(0, Math.ceil(totalDamage));

  return {
    hitNumber: 0,
    rawDamage: incomingDamage,
    totalRawDamage,
    protectionApplied,
    resistanceApplied,
    specialDamage: processedSpecial,
    barrierReduction,
    finalDamage,
    isCrit: false,
    minimumDamageEnforced,
  };
}
