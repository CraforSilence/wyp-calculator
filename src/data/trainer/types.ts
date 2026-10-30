import type { Subclase } from '@/types/character';

/** Texto en los dos idiomas de la app */
export interface Localized {
  es: string;
  en: string;
}

export type PowerKind = 'pasivo' | 'constante' | 'directo' | 'activable' | 'aura';

/** Recarga global que dispara el poder */
export type GlobalCooldown = 'muy-corta' | 'corta' | 'normal' | 'larga' | 'muy-larga';

/** Un valor fijo o uno por cada nivel del poder (1 a 5) */
export type PerLevel<T> = T | readonly [T, T, T, T, T];

export interface PowerEffect {
  /**
   * buff: te da algo a vos o a tus aliados; debuff: se lo quita al enemigo; dano: daño que hace;
   * contra: lo que te cuesta a vos mientras está activo
   */
  kind: 'buff' | 'debuff' | 'dano' | 'contra';
  label: Localized;
  /** `true` = el efecto se aplica (aturdir, noquear...) sin un número. Si es texto, va traducido. */
  value: PerLevel<string | Localized> | true;
}

export interface Power {
  id: string;
  nombre: Localized;
  tipo: PowerKind;
  descripcion: Localized;
  mana?: PerLevel<number>;
  /** Segundos */
  duracion?: PerLevel<number>;
  /** Segundos */
  recarga?: number;
  /** Segundos */
  invocacion?: number;
  recargaGlobal?: GlobalCooldown;
  /** Metros */
  rango?: number;
  /** Radio del área, en metros */
  area?: number;
  /** El golpe depende del intervalo del arma */
  intervaloArma?: boolean;
  /** Solo se bloquea con 100% de bloqueo */
  bloqueable100?: boolean;
  /** Solo se resiste con 100% de resistencia */
  resistible100?: boolean;
  efectos: PowerEffect[];
}

export interface Discipline {
  id: string;
  nombre: Localized;
  /** Los 10 poderes, en el orden en que se desbloquean */
  poderes: Power[];
  /**
   * Disciplina de Warmaster: solo al nivel 60, sus poderes no gastan puntos de poder y ocupan
   * las posiciones pares (2, 4, 6, 8, 10). Acá van solo esos 5.
   */
  warmaster?: boolean;
}

export interface SubclassTrainer {
  subclase: Subclase;
  /** Disciplinas en el orden del entrenador: primero las de la clase, después las de la subclase */
  disciplinas: Discipline[];
}
