import type { CharacterProfile } from '@/types/character';
import type { Weapon, WeaponCalcResult, ArrowSet } from '@/types/weapon';
import type { JewelrySet } from '@/types/jewelry';
import { ATTRIBUTE_MULTIPLIERS, SUBCLASE_MAIN_STAT, VELOCIDADES, SUBCATEGORIA_TO_CATEGORIA, CRIT_BASE, isMuescaSpeedType } from './constants';
import { aggregateJewelryBonuses } from '@/hooks/useJewelry';
import { roundTo } from '../utils';
import { getWeaponAttributes, sumWeaponAttributes } from '../weaponAttributes';

/**
 * DPS con críticos: el crítico multiplica el daño normal, no el especial (gemas y joyería),
 * igual que en la simulación.
 */
function calcDps(promedio: number, especial: number, golpesPorSeg: number, critChance: number, critMult: number): number {
  const normal = promedio - especial;
  return (normal * (1 + critChance * (critMult - 1)) + especial) * golpesPorSeg;
}

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

/** Separa las muescas de velocidad (% ataque / % invocación) del resto */
function splitMuescaSpeeds(muescas: Weapon['muescas']): { attackSpeed: number; castSpeed: number } {
  let attackSpeed = 0, castSpeed = 0;
  for (const [tipo, valor] of Object.entries(muescas)) {
    if (!valor) continue;
    if (tipo === 'attackSpeed') attackSpeed += valor;
    else if (tipo === 'castSpeed') castSpeed += valor;
  }
  return { attackSpeed, castSpeed };
}

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
  const bonusAtributo = weapon.bonusAtributo;
  const atributoClasePct = weapon.atributoClasePct;

  // Agregar bonuses de joyería
  const jBonus = jewelry ? aggregateJewelryBonuses(jewelry) : {};

  const critExtra = weapon.critChanceExtra + (arrows?.critChanceExtra || 0) + (jBonus.critChance || 0);

  // Determinar stat principal y multiplicador según subclase
  const mainStat = SUBCLASE_MAIN_STAT[character.subclase];
  const attributeMultiplier = ATTRIBUTE_MULTIPLIERS[character.subclase];
  // Solo el atributo principal de la subclase suma daño (las flechas dan Destreza)
  const bonusStat = (getWeaponAttributes(weapon)[mainStat] || 0) + (arrows?.bonusStat || 0);

  // Antes de Paso 1: Sumar bonus de stats de joyería (STR/DXT/INT + Atributo de Clase) al stat principal
  const statBonus = (jBonus[mainStat] || 0) + (jBonus.classAttribute || 0);
  const mainStatValue = (character.stats[mainStat] + statBonus) * (1 + atributoClasePct / 100);

  // Paso 1a: Daño del arma por tipo, con las líneas "Daño [tipo] +X" del arma y de las flechas.
  // Según Formulas.md se suman acá, así que pasan por los % y cuentan para repartir el bonus.
  const tiposConBonus: Record<string, [number, number]> = {};
  for (const [tipo, rango] of Object.entries(tipos)) {
    if (rango) tiposConBonus[tipo] = [rango[0], rango[1]];
  }
  const lineasDano = [bonusDano, arrows?.bonusDano ?? {}];
  for (const lineas of lineasDano) {
    for (const [tipo, valor] of Object.entries(lineas)) {
      if (!valor) continue;
      const prev = tiposConBonus[tipo] ?? [0, 0];
      tiposConBonus[tipo] = [prev[0] + valor, prev[1] + valor];
    }
  }
  const totalMax = Object.values(tiposConBonus).reduce((sum, v) => sum + v[1], 0);

  // Paso 3b: "% Daño de Arma" — aplica a todos los tipos (incluidas las líneas "Daño +X").
  // Multiplicar el mín y el máx equivale a multiplicar el valor aleatorio del golpe.
  const weaponDmgPct = jBonus.weaponDmgPct || 0;
  const pctMult = 1 + weaponDmgPct / 100;

  // Paso 2: Bonus de atributo + "(+X)" del arma, repartido según el máximo de cada tipo (paso 1a)
  const extraTotal = calcAttributeBonus(mainStatValue, bonusStat, bonusAtributo, attributeMultiplier);

  // Paso 3c: Daño por tipo = daño del arma con % + su parte del bonus
  const resultado: Record<string, [number, number]> = {};
  for (const [tipo, [dmin, dmax]] of Object.entries(tiposConBonus)) {
    const extra = totalMax > 0 ? extraTotal * (dmax / totalMax) : 0;
    resultado[tipo] = [dmin * pctMult + extra, dmax * pctMult + extra];
  }

  // Track special damage (muescas + jewelry flat) — reduced only by PF in combat
  const specialDamagePerType: Record<string, number> = {};

  // Paso 5: Muescas planas (special damage) — las de velocidad no suman daño
  for (const [tipo, valor] of Object.entries(muescas)) {
    if (!valor || isMuescaSpeedType(tipo)) continue;
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

  // Daño propio del arma (sin líneas "Daño +X") con el % de daño de arma: lo usan el desglose y Cruz del Sur
  const baseMin = Object.values(tipos).reduce((sum, v) => sum + (v ? v[0] : 0), 0) * pctMult;
  const baseMax = Object.values(tipos).reduce((sum, v) => sum + (v ? v[1] : 0), 0) * pctMult;
  const especialTotal = Object.values(specialDamagePerType).reduce((sum, v) => sum + v, 0);
  const bonusPlano = lineasDano
    .flatMap((lineas) => Object.values(lineas))
    .reduce<number>((sum, v) => sum + (v || 0), 0) * pctMult;

  // Paso 6: Daño final con floor
  const finalMin = Math.floor(Object.values(resultado).reduce((sum, v) => sum + v[0], 0));
  const finalMax = Math.floor(Object.values(resultado).reduce((sum, v) => sum + v[1], 0));

  // DPS — sumar attackSpeed de joyería y de muescas
  const muescaSpeeds = splitMuescaSpeeds(muescas);
  const velBase = VELOCIDADES[weapon.velocidad] ?? 2.20;
  const attackSpeedSources = {
    arma: weapon.attackSpeedPct,
    muescas: muescaSpeeds.attackSpeed,
    joyeria: jBonus.attackSpeed || 0,
  };
  const attackSpeedPct = attackSpeedSources.arma + attackSpeedSources.muescas + attackSpeedSources.joyeria;
  const castSpeedPct = (weapon.castSpeedPct || 0) + (jBonus.castSpeed || 0) + muescaSpeeds.castSpeed;
  const golpesPorSeg = (1.0 / velBase) * (1 + attackSpeedPct / 100);
  const velEfectiva = 1.0 / golpesPorSeg;

  const critDmgExtra = weapon.critDmgExtra + (arrows?.critDmgExtra || 0);
  const critMultTotal = character.critMult + critDmgExtra / 100;
  const critBaseValue = CRIT_BASE[character.subclase];
  const critTotal = (critBaseValue * (1 + critExtra / 100)) / 100;
  const danoPromedio = (finalMin + finalMax) / 2;
  const dpsEfectivo = calcDps(danoPromedio, especialTotal, golpesPorSeg, critTotal, critMultTotal);

  // Habilidades específicas
  const categoria = SUBCATEGORIA_TO_CATEGORIA[weapon.subcategoria] || weapon.subcategoria.toLowerCase();

  let riposteDmg: number | null = null;
  if (categoria === 'lanza') {
    // El especial (gemas y joyería) no escala con el poder: se suma una sola vez
    riposteDmg = Math.floor((danoPromedio - especialTotal) * 2.7 + especialTotal + 75);
  }

  let impactoVigoroso: { min: number; max: number; prom: number } | null = null;
  if (categoria === 'maza' || categoria === 'martillo' || categoria === 'garrote') {
    const ivMin = 180 + finalMin;
    const ivMax = 240 + finalMax;
    impactoVigoroso = { min: ivMin, max: ivMax, prom: roundTo((ivMin + ivMax) / 2, 1) };
  }

  // Cruz del Sur (cortante): daño base del arma +100%, daño bonus +65%
  let cruzDelSur: { min: number; max: number; prom: number } | null = null;
  if (categoria === 'espada' || categoria === 'hacha') {
    // El especial (gemas y joyería) no escala con el poder: se suma una sola vez
    const cdsMin = Math.floor(baseMin * 2 + (finalMin - baseMin - especialTotal) * 1.65 + especialTotal);
    const cdsMax = Math.floor(baseMax * 2 + (finalMax - baseMax - especialTotal) * 1.65 + especialTotal);
    cruzDelSur = { min: cdsMin, max: cdsMax, prom: roundTo((cdsMin + cdsMax) / 2, 1) };
  }

  return {
    nombre: weapon.nombre,
    danoMin: finalMin,
    danoMax: finalMax,
    danoPromedio: roundTo(danoPromedio, 1),
    critTotalPct: roundTo(critBaseValue * (1 + critExtra / 100), 1),
    critBonusPct: roundTo(critExtra, 1),
    critMult: roundTo(critMultTotal, 2),
    velBase,
    attackSpeedPct,
    attackSpeedSources,
    castSpeedPct,
    velEfectiva: roundTo(velEfectiva, 3),
    golpesPorSeg: roundTo(golpesPorSeg, 4),
    dpsEfectivo: roundTo(dpsEfectivo, 1),
    riposteDmg,
    impactoVigoroso,
    cruzDelSur,
    desglose: Object.fromEntries(
      Object.entries(resultado).map(([k, v]) => [k, [roundTo(v[0], 1), roundTo(v[1], 1)]])
    ),
    specialDamagePerType,
    pasos: {
      mainStat,
      statEfectivo: roundTo(mainStatValue + bonusStat, 2),
      attributeMultiplier,
      bonusAtributo: roundTo(extraTotal, 1),
      danoBase: [roundTo(baseMin, 1), roundTo(baseMax, 1)],
      bonusPlano: roundTo(bonusPlano, 1),
      especial: especialTotal,
    },
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

  // Merge muescas (incluye las de velocidad: se suman las de ambas armas)
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
    bonusStat: 0,
    atributos: sumWeaponAttributes(getWeaponAttributes(primary), getWeaponAttributes(secondary)),
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
  const attackSpeedPct = result.attackSpeedPct;
  const golpesPorSeg = (1.0 / velBase) * (1 + attackSpeedPct / 100);
  const velEfectiva = 1.0 / golpesPorSeg;

  const critBaseValue = CRIT_BASE[character.subclase];
  const critExtra = mergedWeapon.critChanceExtra + (jBonus.critChance || 0);
  const critTotal = (critBaseValue * (1 + critExtra / 100)) / 100;
  const critMultTotal = result.critMult;
  const dpsEfectivo = calcDps(result.danoPromedio, result.pasos.especial, golpesPorSeg, critTotal, critMultTotal);

  return {
    ...result,
    velBase: roundTo(velBase, 2),
    attackSpeedPct,
    velEfectiva: roundTo(velEfectiva, 3),
    golpesPorSeg: roundTo(golpesPorSeg, 4),
    dpsEfectivo: roundTo(dpsEfectivo, 1),
  };
}
