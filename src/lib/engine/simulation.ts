import type { CharacterProfile, Subclase } from '@/types/character';
import type { Weapon, DamageTypeName } from '@/types/weapon';
import type { JewelrySet } from '@/types/jewelry';
import type { ArmorSet } from '@/types/armor';
import type { SimulationHit, SimulationResult } from '@/types/simulation';
import { calcWeaponDamage } from './damage';
import { calcTotalProtection, calcAverageProtectionFactors } from './armor';
import { applyDamageReduction } from './resistance';
import { aggregateJewelryBonuses } from '@/hooks/useJewelry';
import { ARMOR_CLASSES, PHYSICAL_DAMAGE_TYPES } from './constants';

/** Maps armor bonus resistance types to their ArmorSet field targets */
const RESISTANCE_BONUS_MAP: Record<string, { field: 'generalResistance' | 'typeResistance'; key: string }> = {
  resistirFisico: { field: 'generalResistance', key: 'fisico' },
  resistirMagico: { field: 'generalResistance', key: 'magico' },
  resistirFuego: { field: 'typeResistance', key: 'fuego' },
  resistirHielo: { field: 'typeResistance', key: 'hielo' },
  resistirElectricidad: { field: 'typeResistance', key: 'electrico' },
  resistirAplastante: { field: 'typeResistance', key: 'aplastante' },
  resistirCortante: { field: 'typeResistance', key: 'cortante' },
  resistirPunzante: { field: 'typeResistance', key: 'punzante' },
};

/**
 * Builds an effective ArmorSet by adding piece-level resistance bonuses
 * and defender jewelry defensive bonuses to the ArmorSet's fields.
 */
function buildEffectiveArmorSet(armorSet: ArmorSet, defenderJewelry?: JewelrySet | null): ArmorSet {
  const effective: ArmorSet = {
    ...armorSet,
    generalResistance: { ...armorSet.generalResistance },
    typeResistance: { ...armorSet.typeResistance },
    meleeDmgReductionPct: armorSet.meleeDmgReductionPct,
    rangedDmgReductionPct: armorSet.rangedDmgReductionPct,
  };

  // Aggregate armor piece resistance bonuses
  for (const piece of Object.values(armorSet.pieces)) {
    if (!piece) continue;
    for (const bonus of piece.bonuses || []) {
      const mapping = RESISTANCE_BONUS_MAP[bonus.type];
      if (mapping) {
        if (mapping.field === 'generalResistance') {
          effective.generalResistance[mapping.key as 'fisico' | 'magico'] += bonus.value;
        } else {
          effective.typeResistance[mapping.key as DamageTypeName] =
            (effective.typeResistance[mapping.key as DamageTypeName] || 0) + bonus.value;
        }
      }
    }
  }

  // Apply defender jewelry defensive bonuses (reduccionMelee/reduccionRango)
  if (defenderJewelry) {
    const jBonus = aggregateJewelryBonuses(defenderJewelry);
    if (jBonus.reduccionMelee) {
      effective.meleeDmgReductionPct += jBonus.reduccionMelee;
    }
    if (jBonus.reduccionRango) {
      effective.rangedDmgReductionPct += jBonus.reduccionRango;
    }
  }

  return effective;
}

/**
 * Simulates N hits of a weapon against an armor set.
 * @param defenderSubclase - Subclass of the defender (determines armor class multiplier)
 */
export function simulateHits(
  weapon: Weapon,
  character: CharacterProfile,
  jewelry: JewelrySet | null,
  armorSet: ArmorSet,
  numHits: number = 10,
  defenderSubclase?: Subclase,
  defenderJewelry?: JewelrySet | null
): SimulationResult {
  const weaponResult = calcWeaponDamage(weapon, character, jewelry);
  const effectiveArmor = buildEffectiveArmorSet(armorSet, defenderJewelry);
  const armorClass = ARMOR_CLASSES[defenderSubclase || character.subclase];
  const protection = calcTotalProtection(effectiveArmor, armorClass);
  const avgPF = calcAverageProtectionFactors(effectiveArmor);

  const critChance = weaponResult.critTotalPct / 100;
  const critMult = weaponResult.critMult;

  // Determine if weapon is melee (range < 3m means melee)
  const isMelee = !['Arco Corto', 'Arco Largo', 'Baculo'].includes(weapon.subcategoria);

  const hits: SimulationHit[] = [];

  for (let i = 0; i < numHits; i++) {
    // Randomize damage per type within [min, max], EXCLUDING special damage
    const rawDamage: Record<string, number> = {};
    for (const [type, [min, max]] of Object.entries(weaponResult.desglose)) {
      const specialFlat = weaponResult.specialDamagePerType[type] || 0;
      // Subtract special damage from the range (it's flat, added equally to min and max)
      const adjMin = min - specialFlat;
      const adjMax = max - specialFlat;
      rawDamage[type] = Math.max(0, adjMin + Math.random() * (adjMax - adjMin));
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

    // Special damage from muescas + jewelry (NOT affected by crit, reduced only by PF)
    const specialDamage: Record<string, number> = {};
    for (const [type, value] of Object.entries(weaponResult.specialDamagePerType)) {
      if (value > 0) specialDamage[type] = value;
    }

    // Apply damage reduction with real PF values
    const hit = applyDamageReduction(rawDamage, specialDamage, protection, effectiveArmor, isMelee, avgPF);
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
