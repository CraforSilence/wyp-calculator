import type { Subclase } from '@/types/character';
import type { SubclassTrainer } from './types';
import { CABALLERO } from './caballero';
import { BARBARO } from './barbaro';
import { CAZADOR } from './cazador';
import { TIRADOR } from './tirador';
import { CONJURADOR } from './conjurador';
import { BRUJO } from './brujo';

/** Entrenador de cada subclase */
export const TRAINERS: Record<Subclase, SubclassTrainer> = {
  Caballero: CABALLERO,
  Bárbaro: BARBARO,
  Cazador: CAZADOR,
  Tirador: TIRADOR,
  Conjurador: CONJURADOR,
  Brujo: BRUJO,
};

/** Versión del juego de la que salen los datos */
export const TRAINER_DATA_VERSION = '1.35.19';

export type { SubclassTrainer, Discipline, Power, PowerEffect, Localized, PowerKind, GlobalCooldown, PerLevel } from './types';
