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
/** Resistencia por tipo % del set: la del modificador mas las mejoras de las piezas. */
export function typeResistancePct(armorSet: ArmorSet, type: string): number {
  let typeRes = armorSet.typeResistance[type as keyof typeof armorSet.typeResistance] ?? 0;
  for (const piece of Object.values(armorSet.pieces)) {
    if (!piece?.upgrades) continue;
    for (const upgrade of piece.upgrades) {
      if (upgrade.type === type) typeRes += upgrade.value;
    }
  }
  return typeRes;
}

/** Resistencia total % de un tipo: la general (fisica o magica) combinada con la del tipo. */
export function totalResistancePct(armorSet: ArmorSet, type: string): number {
  const isPhysical = PHYSICAL_DAMAGE_TYPES.includes(type as never);
  const general = isPhysical ? armorSet.generalResistance.fisico : armorSet.generalResistance.magico;
  const typeRes = typeResistancePct(armorSet, type);
  return 100 - (100 - general) * (100 - typeRes) / 100;
}

/**
 * Cuanto pasa de un golpe puro de `amount` de un solo tipo: protección, resistencias y el
 * piso minimo. Sin barrera ni reduccion melee/rango, y con el piso fijo en 4% (en combate
 * varia entre 4 y 8%) para que el numero sea estable.
 */
export function pureHitPassThrough(amount: number, type: string, protection: ProtectionResult, armorSet: ArmorSet): number {
  let damage = amount - (protection.perType[type] || 0);
  if (damage > 0) damage -= damage * totalResistancePct(armorSet, type) / 100;
  return Math.ceil(Math.max(damage, amount * 0.04));
}

/**
 * Hasta que tamano de golpe puro de un tipo la armadura deja pasar solo el minimo (4%).
 * Sale de igualar (golpe - proteccion) * (1 - res) con golpe * 4%.
 */
export function minimumOnlyThreshold(type: string, protection: ProtectionResult, armorSet: ArmorSet): number {
  const prot = protection.perType[type] || 0;
  const passFactor = 1 - totalResistancePct(armorSet, type) / 100;
  if (passFactor <= 0.04) return Infinity;
  return Math.floor(prot * passFactor / (passFactor - 0.04));
}

export function applyDamageReduction(
  incomingDamage: Record<string, number>,
  specialDamage: Record<string, number>,
  protection: ProtectionResult,
  armorSet: ArmorSet,
  isMelee: boolean = true,
  avgProtectionFactors: Record<string, number> = {}
): SimulationHit {
  const damageTypes = Object.keys(incomingDamage);
  const totalSpecialRaw = Object.values(specialDamage).reduce((s, v) => s + v, 0);
  const totalRawDamage = Object.values(incomingDamage).reduce((s, v) => s + v, 0) + totalSpecialRaw;

  if (totalRawDamage <= 0) {
    return {
      hitNumber: 0,
      rawDamage: incomingDamage,
      totalRawDamage: 0,
      protectionApplied: {},
      resistanceApplied: {},
      specialDamage,
      barrierReduction: 0,
      finalDamagePerType: {},
      finalDamage: 0,
      isCrit: false,
      minimumDamageEnforced: false,
    };
  }

  // Step 3a: Calculate protection influence and minimum damage per type
  const totalRegularDamage = Object.values(incomingDamage).reduce((s, v) => s + v, 0);
  const protInfluence: Record<string, number> = {};
  const minimumDamage: Record<string, number> = {};
  const minDmgPct = 4 + Math.random() * 4; // 4-8%

  for (const type of damageTypes) {
    protInfluence[type] = totalRegularDamage > 0 ? (100 / totalRegularDamage) * incomingDamage[type] : 0;
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
    if (generalRes > 0 && damage[type] > 0) {
      const genReduc = damage[type] * generalRes / 100;
      damage[type] -= genReduc;
      resistanceApplied[type] = (resistanceApplied[type] || 0) + genReduc;
    }

    // Step 3d: Per-type resistance (includes armor piece upgrades)
    const typeRes = typeResistancePct(armorSet, type);
    if (typeRes > 0 && damage[type] > 0) {
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

  // Step 3f: Special damage (gem/muesca) reduced only by Protection Factor
  // Formula: special_damage[type] = ceil(special_damage[type] - (special_damage[type] * PF[type]))
  const processedSpecial: Record<string, number> = {};
  for (const [type, value] of Object.entries(specialDamage)) {
    if (value <= 0) continue;
    const pf = avgProtectionFactors[type] || 0;
    processedSpecial[type] = Math.ceil(value - (value * pf));
  }

  // Step 3g: Total damage = sum(regular) + sum(special)
  let totalDamage = Object.values(damage).reduce((s, v) => s + v, 0)
    + Object.values(processedSpecial).reduce((s, v) => s + v, 0);

  // Step 3h: Magical barrier (clamped to available damage per type)
  let barrierReduction = 0;
  for (const type of damageTypes) {
    const barrier = armorSet.barrierPoints[type as keyof typeof armorSet.barrierPoints] ?? 0;
    if (barrier > 0) {
      const effectiveBarrier = Math.min(barrier, Math.max(0, damage[type]));
      barrierReduction += effectiveBarrier;
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

  // Build per-type final damage (regular + special per type, then distribute global reductions proportionally)
  const perTypePre: Record<string, number> = {};
  for (const type of damageTypes) {
    perTypePre[type] = Math.max(0, damage[type]) + (processedSpecial[type] || 0);
  }
  // Add special-only types not in damageTypes
  for (const type of Object.keys(processedSpecial)) {
    if (!(type in perTypePre)) {
      perTypePre[type] = processedSpecial[type];
    }
  }
  const sumPre = Object.values(perTypePre).reduce((s, v) => s + v, 0);
  const finalDamagePerType: Record<string, number> = {};
  if (sumPre > 0 && finalDamage > 0) {
    for (const [type, val] of Object.entries(perTypePre)) {
      if (val > 0) {
        finalDamagePerType[type] = Math.round((val / sumPre) * finalDamage);
      }
    }
  }

  return {
    hitNumber: 0,
    rawDamage: incomingDamage,
    totalRawDamage,
    protectionApplied,
    resistanceApplied,
    specialDamage: processedSpecial,
    barrierReduction,
    finalDamagePerType,
    finalDamage,
    isCrit: false,
    minimumDamageEnforced,
  };
}
