import type { Clase } from '@/types/character';

/** Atributos iniciales al crear el personaje (nivel 1, antes de repartir los puntos libres) */
export interface BaseAttributes {
  STR: number;
  DXT: number;
  INT: number;
  CON: number;
  CONC: number;
}

export type Reino = 'Alsius' | 'Ignis' | 'Syrtis';

export type Raza =
  | 'Nordo' | 'Enano' | 'Utghar'
  | 'Esquelio' | 'Elfo oscuro' | 'Molok'
  | 'Alturiano' | 'Elfo del bosque' | 'Semielfo'
  | 'Lamai';

/** Puntos libres para repartir al crear el personaje */
export const PUNTOS_CREACION = 5;

const a = (STR: number, DXT: number, INT: number, CON: number, CONC: number): BaseAttributes => ({ STR, DXT, INT, CON, CONC });

/**
 * Atributos iniciales por raza y clase (las dos subclases arrancan igual). null = esa raza no
 * puede ser esa clase. Comprobado en el juego con un Nordo de cada clase.
 */
export const RACE_BASE: Record<Raza, Record<Clase, BaseAttributes | null>> = {
  Nordo: { Guerrero: a(25, 20, 25, 25, 25), Arquero: a(20, 25, 25, 20, 30), Mago: a(20, 20, 30, 20, 30) },
  Enano: { Guerrero: a(30, 20, 20, 30, 20), Arquero: a(25, 25, 20, 25, 25), Mago: null },
  Utghar: { Guerrero: a(25, 20, 25, 30, 20), Arquero: null, Mago: a(20, 20, 30, 25, 25) },
  Esquelio: { Guerrero: a(25, 20, 25, 30, 20), Arquero: a(20, 25, 25, 25, 25), Mago: a(20, 20, 30, 25, 25) },
  'Elfo oscuro': { Guerrero: a(30, 20, 20, 25, 25), Arquero: null, Mago: a(25, 20, 25, 20, 30) },
  Molok: { Guerrero: a(30, 25, 20, 25, 20), Arquero: a(25, 30, 20, 20, 25), Mago: null },
  Alturiano: { Guerrero: a(30, 20, 20, 25, 25), Arquero: a(25, 25, 20, 20, 30), Mago: a(25, 20, 25, 20, 30) },
  'Elfo del bosque': { Guerrero: null, Arquero: a(20, 30, 25, 20, 25), Mago: a(20, 25, 30, 20, 25) },
  Semielfo: { Guerrero: a(25, 25, 20, 30, 20), Arquero: a(20, 30, 20, 25, 25), Mago: null },
  Lamai: { Guerrero: a(27, 22, 22, 27, 22), Arquero: a(22, 27, 22, 22, 27), Mago: a(22, 22, 27, 22, 27) },
};

/** Razas de cada reino, en el orden del juego. Lamai está en los tres. */
export const RAZAS_POR_REINO: Record<Reino, Raza[]> = {
  Alsius: ['Nordo', 'Enano', 'Utghar', 'Lamai'],
  Ignis: ['Esquelio', 'Elfo oscuro', 'Molok', 'Lamai'],
  Syrtis: ['Alturiano', 'Elfo del bosque', 'Semielfo', 'Lamai'],
};

export function raceBase(raza: Raza | undefined, clase: Clase): BaseAttributes | null {
  return raza ? RACE_BASE[raza]?.[clase] ?? null : null;
}

/** Primera raza (de cualquier reino) que puede ser esa clase */
export function firstRaceFor(clase: Clase, reino?: Reino): Raza {
  const pool = reino ? RAZAS_POR_REINO[reino] : (Object.keys(RACE_BASE) as Raza[]);
  return pool.find((r) => RACE_BASE[r][clase]) ?? 'Nordo';
}
