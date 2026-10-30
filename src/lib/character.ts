import type { CharacterProfile, Clase } from '@/types/character';
import type { ArmorSet } from '@/types/armor';
import { RAZAS_POR_REINO, firstRaceFor, raceBase, type Raza, type Reino } from '@/data/races';

export type AttrKey = 'STR' | 'DXT' | 'INT' | 'CON' | 'CONC';

/** En el orden de la ventana Atributos del juego */
export const ATTR_ORDER: AttrKey[] = ['STR', 'CON', 'CONC', 'INT', 'DXT'];

export const ATTR_LABELS: Record<AttrKey, string> = {
  STR: 'Fuerza',
  CON: 'Constitución',
  CONC: 'Concentración',
  INT: 'Inteligencia',
  DXT: 'Destreza',
};

/** Reino del personaje: el guardado, o el primero que tiene esa raza */
export function reinoDe(c: Pick<CharacterProfile, 'reino' | 'raza'>): Reino {
  if (c.reino) return c.reino;
  const found = (Object.keys(RAZAS_POR_REINO) as Reino[]).find((r) => c.raza && RAZAS_POR_REINO[r].includes(c.raza));
  return found ?? 'Alsius';
}

/** ¿Los atributos son todavía los iniciales de la raza (el jugador no cargó los suyos)? */
export function usesRaceBase(c: CharacterProfile): boolean {
  const base = raceBase(c.raza, c.clase);
  if (!base) return false;
  return (Object.keys(base) as AttrKey[]).every((k) => (c.stats[k] ?? base[k]) === base[k]);
}

/** Atributos iniciales de la raza para esa clase, como stats del personaje */
export function baseStats(raza: Raza, clase: Clase): CharacterProfile['stats'] | null {
  const b = raceBase(raza, clase);
  return b ? { ...b } : null;
}

/**
 * Cambio de clase: si la raza no puede serlo se elige otra del mismo reino, y si los atributos
 * eran los iniciales se pasan a los de la clase nueva (si ya cargó los suyos, no se tocan).
 */
export function onClassChange(c: CharacterProfile, clase: Clase): Partial<CharacterProfile> {
  const reino = reinoDe(c);
  const raza = c.raza && raceBase(c.raza, clase) ? c.raza : firstRaceFor(clase, reino);
  const updates: Partial<CharacterProfile> = { raza, reino: RAZAS_POR_REINO[reino].includes(raza) ? reino : undefined };
  if (usesRaceBase(c) || raza !== c.raza) {
    const stats = baseStats(raza, clase);
    if (stats) updates.stats = stats;
  }
  return updates;
}

const ARMOR_ATTR: Partial<Record<string, AttrKey>> = {
  fuerza: 'STR', destreza: 'DXT', inteligencia: 'INT', constitucion: 'CON', concentracion: 'CONC',
};

/** Atributos que suma la armadura del Build (bonus de cada pieza y del conjunto) */
export function armorAttributes(armor: ArmorSet | null | undefined): Partial<Record<AttrKey, number>> {
  const out: Partial<Record<AttrKey, number>> = {};
  if (!armor) return out;
  const all = [...Object.values(armor.pieces).flatMap((p) => p?.bonuses ?? []), ...(armor.bonusConjunto ?? [])];
  for (const b of all) {
    const k = ARMOR_ATTR[b.type];
    if (k && b.value) out[k] = (out[k] ?? 0) + b.value;
  }
  return out;
}

/** El personaje con lo que suma la armadura: es el que usan los cálculos de daño del Build */
export function withArmorAttributes(c: CharacterProfile, armor: ArmorSet | null | undefined): CharacterProfile {
  const extra = armorAttributes(armor);
  if (Object.keys(extra).length === 0) return c;
  const stats = { ...c.stats };
  for (const [k, v] of Object.entries(extra) as [AttrKey, number][]) stats[k] = (stats[k] ?? 0) + v;
  return { ...c, stats };
}
