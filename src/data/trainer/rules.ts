import type { Clase } from '@/types/character';

/** Reglas de puntos del entrenador del juego (versión 1.35.19). */

export const NIVEL_MIN = 10;
export const NIVEL_MAX = 60;
/** El Cristal rojo del nigromante da puntos de poder extra a los nivel 60 */
export const PUNTOS_CRISTAL = 5;
export const PODER_MAX = 5;
export const PODERES_POR_DISCIPLINA = 10;

/** Puntos de disciplina totales por nivel del personaje (índice = nivel - 1) */
const DISCIPLINA_FISICOS = [
  0, 1, 3, 6, 10, 15, 21, 28, 36, 45,
  56, 68, 81, 96, 112, 129, 148, 168, 189, 211,
  234, 258, 283, 309, 336, 364, 393, 423, 454, 486,
  519, 553, 588, 624, 661, 700, 740, 781, 823, 866,
  910, 955, 1001, 1048, 1096, 1145, 1195, 1246, 1298, 1351,
  1386, 1421, 1456, 1491, 1526, 1561, 1596, 1631, 1666, 1703,
];
const DISCIPLINA_MAGOS = [
  0, 1, 3, 6, 10, 15, 21, 35, 45, 56,
  68, 81, 96, 112, 129, 147, 166, 187, 210, 234,
  259, 286, 314, 343, 374, 406, 439, 474, 511, 549,
  588, 629, 671, 714, 758, 803, 849, 896, 944, 993,
  1043, 1094, 1147, 1201, 1256, 1312, 1369, 1427, 1486, 1546,
  1596, 1648, 1700, 1752, 1807, 1863, 1919, 1975, 2031, 2087,
];

/** Puntos de poder totales por nivel del personaje (índice = nivel - 1) */
const PODER_FISICOS = [
  4, 4, 4, 4, 5, 6, 7, 8, 9, 9,
  13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  23, 24, 25, 26, 27, 28, 29, 30, 31, 32,
  33, 34, 35, 36, 37, 38, 39, 40, 41, 43,
  45, 47, 49, 51, 53, 55, 57, 59, 61, 65,
  67, 69, 71, 73, 75, 77, 79, 81, 83, 85,
];
const PODER_MAGOS = [
  4, 4, 4, 4, 5, 6, 7, 8, 9, 13,
  14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
  24, 25, 26, 27, 28, 29, 30, 31, 32, 33,
  34, 35, 36, 37, 38, 39, 40, 41, 42, 44,
  46, 48, 50, 53, 55, 58, 61, 64, 67, 73,
  75, 77, 79, 81, 83, 85, 87, 89, 91, 93,
];

export function puntosDisciplina(clase: Clase, nivel: number): number {
  return (clase === 'Mago' ? DISCIPLINA_MAGOS : DISCIPLINA_FISICOS)[nivel - 1] ?? 0;
}

export function puntosPoder(clase: Clase, nivel: number, cristal: boolean): number {
  const base = (clase === 'Mago' ? PODER_MAGOS : PODER_FISICOS)[nivel - 1] ?? 0;
  return base + (cristal && nivel === NIVEL_MAX ? PUNTOS_CRISTAL : 0);
}

export interface DisciplineStep {
  /** Nivel de la disciplina como lo muestra el juego: 1, 3, 5... 19 */
  nivel: number;
  /** Nivel de personaje que hace falta para llegar */
  nivelPersonaje: number;
  /** Puntos de disciplina acumulados para llegar desde el nivel 1 */
  costo: number;
  /** Cuántos de los 10 poderes quedan desbloqueados */
  poderes: number;
  /** Nivel máximo al que se pueden subir esos poderes */
  nivelPoderMax: number;
}

/** Los 10 escalones de una disciplina. Todas arrancan en el primero, gratis. */
export const DISCIPLINE_STEPS: readonly DisciplineStep[] = [
  { nivel: 1, nivelPersonaje: 1, costo: 0, poderes: 1, nivelPoderMax: 2 },
  { nivel: 3, nivelPersonaje: 5, costo: 4, poderes: 2, nivelPoderMax: 2 },
  { nivel: 5, nivelPersonaje: 9, costo: 13, poderes: 3, nivelPoderMax: 2 },
  { nivel: 7, nivelPersonaje: 13, costo: 29, poderes: 4, nivelPoderMax: 2 },
  { nivel: 9, nivelPersonaje: 17, costo: 54, poderes: 5, nivelPoderMax: 2 },
  { nivel: 11, nivelPersonaje: 21, costo: 90, poderes: 6, nivelPoderMax: 3 },
  { nivel: 13, nivelPersonaje: 25, costo: 139, poderes: 7, nivelPoderMax: 3 },
  { nivel: 15, nivelPersonaje: 29, costo: 203, poderes: 8, nivelPoderMax: 4 },
  { nivel: 17, nivelPersonaje: 33, costo: 284, poderes: 9, nivelPoderMax: 4 },
  { nivel: 19, nivelPersonaje: 37, costo: 384, poderes: 10, nivelPoderMax: 5 },
];
