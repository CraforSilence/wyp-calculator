import type { CharacterProfile } from '@/types/character';
import type { Weapon, DamageTypeName } from '@/types/weapon';
import type { JewelrySet } from '@/types/jewelry';
import type { ArmorSet } from '@/types/armor';
import type { SimulationHit, SimulationResult } from '@/types/simulation';
import { calcWeaponDamage } from './damage';
import { calcTotalProtection } from './armor';
import { applyDamageReduction } from './resistance';
import { ARMOR_CLASSES } from './constants';

/**
 * Simulates N hits of a weapon against an armor set.
 */
export function simulateHits(
  weapon: Weapon,
  character: CharacterProfile,
  jewelry: JewelrySet | null,
  armorSet: ArmorSet,
  numHits: number = 10
): SimulationResult {
  const weaponResult = calcWeaponDamage(weapon, character, jewelry);
  const armorClass = ARMOR_CLASSES[character.subclase];
  const protection = calcTotalProtection(armorSet, armorClass);

  const critChance = weaponResult.critTotalPct / 100;
  const critMult = weaponResult.critMult;

  // Determine if weapon is melee (range < 3m means melee)
  const isMelee = !['Arco Corto', 'Arco Largo', 'Baculo'].includes(weapon.subcategoria);

  const hits: SimulationHit[] = [];

  for (let i = 0; i < numHits; i++) {
    // Randomize damage per type within [min, max]
    const rawDamage: Record<string, number> = {};
    for (const [type, [min, max]] of Object.entries(weaponResult.desglose)) {
      rawDamage[type] = min + Math.random() * (max - min);
    }

    // Check critical hit
    const isCrit = Math.random() < critChance;
    if (isCrit) {
      for (const type of Object.keys(rawDamage)) {
        rawDamage[type] *= critMult;
      }
    }

    // Floor raw damage
    for (const type of Object.keys(rawDamage)) {
      rawDamage[type] = Math.floor(rawDamage[type]);
    }

    // Special damage from muescas (treated as gem bonus damage)
    const specialDamage: Record<string, number> = {};
    // Note: muescas are already included in the weapon calc, so special damage
    // from external sources (gem bonus) would be separate. For now, leave empty.

    // Apply damage reduction
    const hit = applyDamageReduction(rawDamage, specialDamage, protection, armorSet, isMelee);
    hit.hitNumber = i + 1;
    hit.isCrit = isCrit;

    hits.push(hit);
  }

  const totalDamage = hits.reduce((s, h) => s + h.finalDamage, 0);
  const averageDamage = numHits > 0 ? totalDamage / numHits : 0;
  const critsLanded = hits.filter((h) => h.isCrit).length;

  return {
    weaponName: weapon.nombre,
    armorName: Object.keys(armorSet.pieces).length > 0 ? `${Object.keys(armorSet.pieces).length} piezas` : 'Sin armadura',
    hits,
    averageDamage: Math.round(averageDamage * 10) / 10,
    totalDamage,
    critsLanded,
  };
}
