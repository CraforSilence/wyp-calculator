import type { Raza, Reino } from '@/data/races';

export type Clase = 'Guerrero' | 'Arquero' | 'Mago';

export type Subclase =
  | 'Bárbaro' | 'Caballero'
  | 'Cazador' | 'Tirador'
  | 'Conjurador' | 'Brujo';

export type MainStat = 'STR' | 'DXT' | 'INT';

export interface CharacterProfile {
  clase: Clase;
  subclase: Subclase;
  /** Reino (la Lamai está en los tres). Sin definir en datos viejos. */
  reino?: Reino;
  /** Raza (define los atributos iniciales). Sin definir en datos viejos. */
  raza?: Raza;
  /** Nivel del personaje (1 a 60). Sin definir en datos viejos. */
  nivel?: number;
  /** Atributos como los muestra el juego, sin equipo que los modifique ni buffs */
  stats: {
    STR: number;
    DXT: number;
    INT: number;
    CON?: number;
    CONC?: number;
  };
  critBase: number;
  critMult: number;
}
