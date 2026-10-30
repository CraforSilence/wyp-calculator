import type { Clase, Subclase } from '@/types/character';
import { CLASE_SUBCLASES } from '@/lib/engine/constants';
import { TRAINERS, type SubclassTrainer, type Discipline, type PerLevel } from '@/data/trainer';
import {
  DISCIPLINE_STEPS, NIVEL_MAX, NIVEL_MIN, PODER_MAX, PODERES_POR_DISCIPLINA,
  puntosDisciplina, puntosPoder,
} from '@/data/trainer/rules';

/** Lo que el usuario armó en el entrenador */
export interface TrainerSetup {
  subclase: Subclase;
  nivel: number;
  /** Cristal rojo del nigromante (+5 puntos de poder, solo nivel 60) */
  cristal: boolean;
  /** Escalón (0 a 9) de cada disciplina, en el orden del entrenador. 0 = nivel 1 del juego. */
  disciplinas: number[];
  /** Nivel (0 a 5) de cada poder, por disciplina. La fila de Warmaster queda en 0: no usa puntos. */
  poderes: number[][];
}

export interface SavedTrainerSetup {
  id: string;
  nombre: string;
  createdAt: string;
  setup: TrainerSetup;
}

export function claseDe(subclase: Subclase): Clase {
  return (Object.keys(CLASE_SUBCLASES) as Clase[]).find((c) => CLASE_SUBCLASES[c].includes(subclase)) ?? 'Guerrero';
}

export function getTrainer(subclase: Subclase): SubclassTrainer | undefined {
  return TRAINERS[subclase];
}

/** Nivel de la disciplina como lo muestra el juego (1, 3, 5... 19) */
export const nivelDisciplina = (step: number) => DISCIPLINE_STEPS[step]?.nivel ?? 1;

export function emptySetup(subclase: Subclase, nivel = NIVEL_MAX): TrainerSetup {
  const trainer = getTrainer(subclase);
  const n = trainer?.disciplinas.length ?? 0;
  return {
    subclase,
    nivel,
    cristal: false,
    disciplinas: Array(n).fill(0),
    poderes: Array.from({ length: n }, () => Array(PODERES_POR_DISCIPLINA).fill(0)),
  };
}

export function totalPoints(setup: TrainerSetup) {
  const clase = claseDe(setup.subclase);
  return {
    disciplina: puntosDisciplina(clase, setup.nivel),
    poder: puntosPoder(clase, setup.nivel, setup.cristal),
  };
}

export function spentPoints(setup: TrainerSetup, trainer: SubclassTrainer) {
  let disciplina = 0;
  let poder = 0;
  trainer.disciplinas.forEach((d, row) => {
    disciplina += DISCIPLINE_STEPS[setup.disciplinas[row] ?? 0].costo;
    if (!d.warmaster) poder += (setup.poderes[row] ?? []).reduce((a, b) => a + b, 0);
  });
  return { disciplina, poder };
}

export function pointsLeft(setup: TrainerSetup, trainer: SubclassTrainer) {
  const total = totalPoints(setup);
  const spent = spentPoints(setup, trainer);
  return { disciplina: total.disciplina - spent.disciplina, poder: total.poder - spent.poder };
}

/** Escalón más alto que permite el nivel del personaje. Warmaster solo existe al 60. */
export function maxStepForLevel(nivel: number, discipline: Discipline): number {
  if (discipline.warmaster && nivel < NIVEL_MAX) return -1;
  let max = 0;
  DISCIPLINE_STEPS.forEach((s, i) => { if (s.nivelPersonaje <= nivel) max = i; });
  return max;
}

/** Posición (1 a 10) que ocupa el poder en la fila del juego */
export const powerPosition = (discipline: Discipline, index: number) => (discipline.warmaster ? (index + 1) * 2 : index + 1);

/** Nivel máximo que puede tener el poder con la disciplina en ese escalón (0 = bloqueado) */
export function powerCap(discipline: Discipline, step: number, index: number, nivel: number): number {
  if (discipline.warmaster && nivel < NIVEL_MAX) return 0;
  const s = DISCIPLINE_STEPS[step];
  if (powerPosition(discipline, index) > s.poderes) return 0;
  return discipline.warmaster ? 1 : s.nivelPoderMax;
}

/** Escalón que hace falta en la disciplina para desbloquear el poder */
export function stepToUnlock(discipline: Discipline, index: number): number {
  const pos = powerPosition(discipline, index);
  return DISCIPLINE_STEPS.findIndex((s) => s.poderes >= pos);
}

/** Valor del nivel pedido (1 a 5) de algo que puede ser fijo o por nivel */
export function atLevel<T>(value: PerLevel<T>, level: number): T {
  if (Array.isArray(value)) return value[Math.min(Math.max(level, 1), PODER_MAX) - 1];
  return value as T;
}

export type TrainerError =
  | 'disciplina-max' | 'disciplina-min' | 'nivel-bajo' | 'sin-puntos-disciplina'
  | 'poder-bloqueado' | 'poder-max' | 'poder-min' | 'sin-puntos-poder' | 'subir-disciplina';

export type TrainerResult = { ok: true; setup: TrainerSetup } | { ok: false; error: TrainerError };

function withRow(setup: TrainerSetup, row: number, step: number, trainer: SubclassTrainer): TrainerSetup {
  const discipline = trainer.disciplinas[row];
  const disciplinas = [...setup.disciplinas];
  disciplinas[row] = step;
  const poderes = setup.poderes.map((r) => [...r]);
  // Al bajar la disciplina, los poderes que ya no entran bajan solos (y devuelven sus puntos)
  poderes[row] = poderes[row].map((lvl, i) => Math.min(lvl, powerCap(discipline, step, i, setup.nivel)));
  return { ...setup, disciplinas, poderes };
}

export function raiseDiscipline(setup: TrainerSetup, trainer: SubclassTrainer, row: number): TrainerResult {
  const cur = setup.disciplinas[row];
  if (cur >= DISCIPLINE_STEPS.length - 1) return { ok: false, error: 'disciplina-max' };
  if (cur + 1 > maxStepForLevel(setup.nivel, trainer.disciplinas[row])) return { ok: false, error: 'nivel-bajo' };
  const cost = DISCIPLINE_STEPS[cur + 1].costo - DISCIPLINE_STEPS[cur].costo;
  if (cost > pointsLeft(setup, trainer).disciplina) return { ok: false, error: 'sin-puntos-disciplina' };
  return { ok: true, setup: withRow(setup, row, cur + 1, trainer) };
}

export function lowerDiscipline(setup: TrainerSetup, trainer: SubclassTrainer, row: number): TrainerResult {
  const cur = setup.disciplinas[row];
  if (cur <= 0) return { ok: false, error: 'disciplina-min' };
  return { ok: true, setup: withRow(setup, row, cur - 1, trainer) };
}

function withPower(setup: TrainerSetup, row: number, index: number, level: number): TrainerSetup {
  const poderes = setup.poderes.map((r) => [...r]);
  poderes[row][index] = level;
  return { ...setup, poderes };
}

export function raisePower(setup: TrainerSetup, trainer: SubclassTrainer, row: number, index: number): TrainerResult {
  const discipline = trainer.disciplinas[row];
  if (discipline.warmaster) return { ok: false, error: 'subir-disciplina' };
  const cap = powerCap(discipline, setup.disciplinas[row], index, setup.nivel);
  const cur = setup.poderes[row][index];
  if (cap === 0) return { ok: false, error: 'poder-bloqueado' };
  if (cur >= PODER_MAX) return { ok: false, error: 'poder-max' };
  if (cur >= cap) return { ok: false, error: 'subir-disciplina' };
  if (pointsLeft(setup, trainer).poder < 1) return { ok: false, error: 'sin-puntos-poder' };
  return { ok: true, setup: withPower(setup, row, index, cur + 1) };
}

export function lowerPower(setup: TrainerSetup, trainer: SubclassTrainer, row: number, index: number): TrainerResult {
  if (trainer.disciplinas[row].warmaster) return { ok: false, error: 'poder-min' };
  const cur = setup.poderes[row][index];
  if (cur <= 0) return { ok: false, error: 'poder-min' };
  return { ok: true, setup: withPower(setup, row, index, cur - 1) };
}

/**
 * Deja el setup dentro de las reglas: largo de las filas, disciplinas que el nivel no permite,
 * poderes por encima de lo que la disciplina habilita. No recorta por puntos: si al bajar el
 * nivel te pasás, se muestra el exceso y lo arreglás vos.
 */
export function normalizeSetup(raw: TrainerSetup): TrainerSetup {
  const trainer = getTrainer(raw.subclase);
  if (!trainer) return raw;
  const nivel = Math.min(NIVEL_MAX, Math.max(NIVEL_MIN, Math.round(Number(raw.nivel) || NIVEL_MAX)));
  const disciplinas = trainer.disciplinas.map((d, row) => {
    const step = Math.round(Number(raw.disciplinas?.[row]) || 0);
    return Math.min(Math.max(step, 0), Math.max(maxStepForLevel(nivel, d), 0));
  });
  const poderes = trainer.disciplinas.map((d, row) =>
    Array.from({ length: PODERES_POR_DISCIPLINA }, (_, i) => {
      if (d.warmaster) return 0;
      const lvl = Math.round(Number(raw.poderes?.[row]?.[i]) || 0);
      return Math.min(Math.max(lvl, 0), powerCap(d, disciplinas[row], i, nivel));
    }),
  );
  return { subclase: raw.subclase, nivel, cristal: !!raw.cristal && nivel === NIVEL_MAX, disciplinas, poderes };
}

export const TRAINER_ERROR_MESSAGES: Record<TrainerError, string> = {
  'disciplina-max': 'La disciplina ya está al máximo.',
  'disciplina-min': 'La disciplina ya está en el mínimo.',
  'nivel-bajo': 'Tu nivel no alcanza para subir más esta disciplina.',
  'sin-puntos-disciplina': 'No te quedan puntos de disciplina suficientes.',
  'poder-bloqueado': 'Este poder todavía está bloqueado: subí la disciplina.',
  'poder-max': 'El poder ya está al máximo.',
  'poder-min': 'El poder ya está en 0.',
  'sin-puntos-poder': 'No te quedan puntos de poder.',
  'subir-disciplina': 'Para subir más este poder tenés que subir la disciplina.',
};

// --- Compartir ---

/** Formato compacto para el código: una cifra por disciplina y por poder */
export interface TrainerSharePayload {
  v: 1;
  /** Nombre con el que lo guardó quien lo compartió */
  nm?: string;
  s: Subclase;
  n: number;
  c?: 1;
  /** Escalón de cada disciplina, una cifra cada una */
  d: string;
  /** Nivel de los poderes, 10 cifras por disciplina separadas por "." */
  p: string;
}

export function toSharePayload(setup: TrainerSetup, nombre?: string): TrainerSharePayload {
  return {
    v: 1,
    ...(nombre ? { nm: nombre } : {}),
    s: setup.subclase,
    n: setup.nivel,
    ...(setup.cristal ? { c: 1 as const } : {}),
    d: setup.disciplinas.join(''),
    p: setup.poderes.map((r) => r.join('')).join('.'),
  };
}

export function fromSharePayload(payload: TrainerSharePayload): TrainerSetup | null {
  if (!payload || payload.v !== 1 || !getTrainer(payload.s)) return null;
  if (typeof payload.d !== 'string' || typeof payload.p !== 'string') return null;
  return normalizeSetup({
    subclase: payload.s,
    nivel: payload.n,
    cristal: payload.c === 1,
    disciplinas: payload.d.split('').map(Number),
    poderes: payload.p.split('.').map((r) => r.split('').map(Number)),
  });
}

export function isTrainerSharePayload(data: unknown): data is TrainerSharePayload {
  const o = data as Record<string, unknown>;
  return !!o && o.v === 1 && typeof o.s === 'string' && typeof o.n === 'number' && typeof o.d === 'string' && typeof o.p === 'string';
}
