import type { CharacterProfile } from '@/types/character';
import type { Weapon, WeaponCalcResult, ArrowSet } from '@/types/weapon';
import type { JewelrySet } from '@/types/jewelry';
import { ATTRIBUTE_MULTIPLIERS, SUBCLASE_MAIN_STAT, VELOCIDADES, SUBCATEGORIA_TO_CATEGORIA, CRIT_BASE } from './constants';
import { aggregateJewelryBonuses } from '@/hooks/useJewelry';
import { roundTo } from '../utils';

function calcAttributeBonus(
  mainStatValue: number,
  bonusStat: number,
  bonusAtributo: number,
  attributeMultiplier: number
): number {
  const statEfectivo = mainStatValue + bonusStat;
  const attributeBonus = (statEfectivo - 20) * attributeMultiplier;
  return attributeBonus + bonusAtributo;
}

// Mapa de bonus de joyería tipo daño → nombre de tipo de daño del arma
const JEWELRY_DAMAGE_MAP: Record<string, string> = {
  dano_punzante: 'punzante',
  dano_aplastante: 'aplastante',
  dano_cortante: 'cortante',
  dano_electrico: 'electrico',
  dano_hielo: 'hielo',
  dano_fuego: 'fuego',
};

// Merge arrow damage types into weapon damage types
function mergeArrowDamage(
  weaponTipos: Partial<Record<string, [number, number]>>,
  arrows: ArrowSet
): Partial<Record<string, [number, number]>> {
  const merged: Record<string, [number, number]> = {};

  // Copy weapon types
  for (const [tipo, rango] of Object.entries(weaponTipos)) {
    if (rango) merged[tipo] = [...rango];
  }

  // Add arrow damage types
  for (const [tipo, rango] of Object.entries(arrows.tiposDano)) {
    if (!rango) continue;
    if (merged[tipo]) {
      merged[tipo] = [merged[tipo][0] + rango[0], merged[tipo][1] + rango[1]];
    } else {
      merged[tipo] = [...rango];
    }
  }

  return merged;
}

export function calcWeaponDamage(
  weapon: Weapon,
  character: CharacterProfile,
  jewelry: JewelrySet | null,
  arrows?: ArrowSet | null
): WeaponCalcResult {
  // If arrows provided, merge their damage and bonuses
  const tipos = arrows ? mergeArrowDamage(weapon.tiposDano, arrows) : weapon.tiposDano;
  const bonusDano = weapon.bonusDano;
  const muescas = weapon.muescas;
  const bonusStat = weapon.bonusStat + (arrows?.bonusStat || 0);
  const bonusAtributo = weapon.bonusAtributo;
  const critExtra = weapon.critChanceExtra + (arrows?.critChanceExtra || 0);
  const atributoClasePct = weapon.atributoClasePct;

  // Agregar bonuses de joyería
  const jBonus = jewelry ? aggregateJewelryBonuses(jewelry) : {};

  // Determinar stat principal y multiplicador según subclase
  const mainStat = SUBCLASE_MAIN_STAT[character.subclase];
  const attributeMultiplier = ATTRIBUTE_MULTIPLIERS[character.subclase];

  // Antes de Paso 1: Sumar bonus de stats de joyería (STR/DXT/INT) al stat principal
  const statBonus = jBonus[mainStat] || 0;
  const mainStatValue = (character.stats[mainStat] + statBonus) * (1 + atributoClasePct / 100);

  // Paso 1: Daño base total (max)
  const totalBaseMax = Object.values(tipos).reduce((sum, v) => sum + (v ? v[1] : 0), 0);

  // Paso 1b: weaponDmgPct — multiplicar daño base por tipo
  const weaponDmgPct = jBonus.weaponDmgPct || 0;
  const tiposAjustados: Record<string, [number, number]> = {};
  for (const [tipo, rango] of Object.entries(tipos)) {
    if (!rango) continue;
    const [dmin, dmax] = rango;
    if (weaponDmgPct > 0) {
      const mult = weaponDmgPct / 100;
      tiposAjustados[tipo] = [dmin + dmin * mult, dmax + dmax * mult];
    } else {
      tiposAjustados[tipo] = [dmin, dmax];
    }
  }

  // Recalcular totalBaseMax ajustado para proporciones
  const totalBaseMaxAdj = Object.values(tiposAjustados).reduce((sum, v) => sum + v[1], 0);

  // Paso 2: Extra damage per type
  const extraTotal = calcAttributeBonus(mainStatValue, bonusStat, bonusAtributo, attributeMultiplier);

  // Paso 3 y 4: Repartir extra y aplicar
  const resultado: Record<string, [number, number]> = {};
  for (const [tipo, rango] of Object.entries(tiposAjustados)) {
    const [dmin, dmax] = rango;
    const proporcion = totalBaseMaxAdj > 0 ? dmax / totalBaseMaxAdj : 0;
    const extra = extraTotal * proporcion;
    resultado[tipo] = [dmin + extra, dmax + extra];
  }

  // Paso 4b: Bonus de daño del arma (flat)
  for (const [tipo, valor] of Object.entries(bonusDano)) {
    if (!valor) continue;
    if (resultado[tipo]) {
      resultado[tipo] = [resultado[tipo][0] + valor, resultado[tipo][1] + valor];
    } else {
      resultado[tipo] = [valor, valor];
    }
  }

  // Paso 4c: Bonus de daño de flechas (flat)
  if (arrows) {
    for (const [tipo, valor] of Object.entries(arrows.bonusDano)) {
      if (!valor) continue;
      if (resultado[tipo]) {
        resultado[tipo] = [resultado[tipo][0] + valor, resultado[tipo][1] + valor];
      } else {
        resultado[tipo] = [valor, valor];
      }
    }
  }

  // Track special damage (muescas + jewelry flat) — reduced only by PF in combat
  const specialDamagePerType: Record<string, number> = {};

  // Paso 5: Muescas planas (special damage)
  for (const [tipo, valor] of Object.entries(muescas)) {
    if (!valor) continue;
    specialDamagePerType[tipo] = (specialDamagePerType[tipo] || 0) + valor;
    if (resultado[tipo]) {
      resultado[tipo] = [resultado[tipo][0] + valor, resultado[tipo][1] + valor];
    } else {
      resultado[tipo] = [valor, valor];
    }
  }

  // Paso 5b: Joyería — daño flat de anillos/amuleto (special damage)
  for (const [jKey, valor] of Object.entries(jBonus)) {
    const dmgType = JEWELRY_DAMAGE_MAP[jKey];
    if (!dmgType || !valor) continue;
    specialDamagePerType[dmgType] = (specialDamagePerType[dmgType] || 0) + valor;
    if (resultado[dmgType]) {
      resultado[dmgType] = [resultado[dmgType][0] + valor, resultado[dmgType][1] + valor];
    } else {
      resultado[dmgType] = [valor, valor];
    }
  }

  // Paso 6: Daño final con floor
  const finalMin = Math.floor(Object.values(resultado).reduce((sum, v) => sum + v[0], 0));
  const finalMax = Math.floor(Object.values(resultado).reduce((sum, v) => sum + v[1], 0));

  // DPS — sumar attackSpeed de joyería
  const velBase = VELOCIDADES[weapon.velocidad] ?? 2.20;
  const attackSpeedPct = weapon.attackSpeedPct + (jBonus.attackSpeed || 0);
  const golpesPorSeg = (1.0 / velBase) * (1 + attackSpeedPct / 100);
  const velEfectiva = 1.0 / golpesPorSeg;

  const critDmgExtra = weapon.critDmgExtra + (arrows?.critDmgExtra || 0);
  const critMultTotal = character.critMult + critDmgExtra / 100;
  const critBaseValue = CRIT_BASE[character.subclase];
  const critTotal = (critBaseValue * (1 + critExtra / 100)) / 100;
  const danoPromedio = (finalMin + finalMax) / 2;
  const dpsEfectivo = danoPromedio * golpesPorSeg * (1 + critTotal * (critMultTotal - 1));

  // Habilidades específicas
  const categoria = SUBCATEGORIA_TO_CATEGORIA[weapon.subcategoria] || weapon.subcategoria.toLowerCase();

  let riposteDmg: number | null = null;
  if (categoria === 'lanza') {
    riposteDmg = Math.floor(danoPromedio * 2.7 + 75);
  }

  let impactoVigoroso: { min: number; max: number; prom: number } | null = null;
  if (categoria === 'maza' || categoria === 'martillo' || categoria === 'garrote') {
    const ivMin = 180 + finalMin;
    const ivMax = 240 + finalMax;
    impactoVigoroso = { min: ivMin, max: ivMax, prom: roundTo((ivMin + ivMax) / 2, 1) };
  }

  return {
    nombre: weapon.nombre,
    danoMin: finalMin,
    danoMax: finalMax,
    danoPromedio: roundTo(danoPromedio, 1),
    critTotalPct: roundTo(critBaseValue * (1 + critExtra / 100), 1),
    critMult: roundTo(critMultTotal, 2),
    velBase,
    attackSpeedPct,
    velEfectiva: roundTo(velEfectiva, 3),
    golpesPorSeg: roundTo(golpesPorSeg, 4),
    dpsEfectivo: roundTo(dpsEfectivo, 1),
    riposteDmg,
    impactoVigoroso,
    desglose: Object.fromEntries(
      Object.entries(resultado).map(([k, v]) => [k, [roundTo(v[0], 1), roundTo(v[1], 1)]])
    ),
    specialDamagePerType,
  };
}

// Calcula daño combinado de duales: suma daños base de ambas armas como una sola
// La velocidad efectiva es el promedio de ambas armas
export function calcDualDamage(
  primary: Weapon,
  secondary: Weapon,
  character: CharacterProfile,
  jewelry: JewelrySet | null
): WeaponCalcResult {
  // Merge damage types from both weapons
  const mergedTipos: Partial<Record<string, [number, number]>> = {};
  for (const [tipo, rango] of Object.entries(primary.tiposDano)) {
    if (rango) mergedTipos[tipo] = [...rango];
  }
  for (const [tipo, rango] of Object.entries(secondary.tiposDano)) {
    if (!rango) continue;
    if (mergedTipos[tipo]) {
      mergedTipos[tipo] = [mergedTipos[tipo]![0] + rango[0], mergedTipos[tipo]![1] + rango[1]];
    } else {
      mergedTipos[tipo] = [...rango];
    }
  }

  // Merge bonus daño
  const mergedBonusDano: Partial<Record<string, number>> = {};
  for (const [tipo, valor] of Object.entries(primary.bonusDano)) {
    if (valor) mergedBonusDano[tipo] = (mergedBonusDano[tipo] || 0) + valor;
  }
  for (const [tipo, valor] of Object.entries(secondary.bonusDano)) {
    if (valor) mergedBonusDano[tipo] = (mergedBonusDano[tipo] || 0) + valor;
  }

  // Merge muescas
  const mergedMuescas: Partial<Record<string, number>> = {};
  for (const [tipo, valor] of Object.entries(primary.muescas)) {
    if (valor) mergedMuescas[tipo] = (mergedMuescas[tipo] || 0) + valor;
  }
  for (const [tipo, valor] of Object.entries(secondary.muescas)) {
    if (valor) mergedMuescas[tipo] = (mergedMuescas[tipo] || 0) + valor;
  }

  // Create a merged "virtual" weapon
  const mergedWeapon: Weapon = {
    ...primary,
    nombre: `${primary.nombre} + ${secondary.nombre}`,
    tiposDano: mergedTipos as Weapon['tiposDano'],
    bonusDano: mergedBonusDano as Weapon['bonusDano'],
    muescas: mergedMuescas as Weapon['muescas'],
    bonusStat: primary.bonusStat + secondary.bonusStat,
    bonusAtributo: primary.bonusAtributo + secondary.bonusAtributo,
    critChanceExtra: primary.critChanceExtra + secondary.critChanceExtra,
    critDmgExtra: primary.critDmgExtra + secondary.critDmgExtra,
    attackSpeedPct: primary.attackSpeedPct + secondary.attackSpeedPct,
    atributoClasePct: Math.max(primary.atributoClasePct, secondary.atributoClasePct),
  };

  // Calculate with the merged weapon
  const result = calcWeaponDamage(mergedWeapon, character, jewelry);

  // Override velocity: average of both weapons
  const velPrimary = VELOCIDADES[primary.velocidad] ?? 2.20;
  const velSecondary = VELOCIDADES[secondary.velocidad] ?? 2.20;
  const velBase = (velPrimary + velSecondary) / 2;
  const jBonus = jewelry ? aggregateJewelryBonuses(jewelry) : {};
  const attackSpeedPct = mergedWeapon.attackSpeedPct + (jBonus.attackSpeed || 0);
  const golpesPorSeg = (1.0 / velBase) * (1 + attackSpeedPct / 100);
  const velEfectiva = 1.0 / golpesPorSeg;

  const critBaseValue = CRIT_BASE[character.subclase];
  const critExtra = mergedWeapon.critChanceExtra;
  const critTotal = (critBaseValue * (1 + critExtra / 100)) / 100;
  const critMultTotal = result.critMult;
  const danoPromedio = result.danoPromedio;
  const dpsEfectivo = danoPromedio * golpesPorSeg * (1 + critTotal * (critMultTotal - 1));

  return {
    ...result,
    velBase: roundTo(velBase, 2),
    attackSpeedPct,
    velEfectiva: roundTo(velEfectiva, 3),
    golpesPorSeg: roundTo(golpesPorSeg, 4),
    dpsEfectivo: roundTo(dpsEfectivo, 1),
  };
}
