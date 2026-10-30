import type { Subclase } from '@/types/character';
import type { Weapon, WeaponCalcResult } from '@/types/weapon';
import { TRAINERS, type Discipline, type Power, type PowerEffect, type Localized } from '@/data/trainer';
import { EF } from '@/data/trainer/effects';
import { atLevel } from '@/lib/trainer';
import { PODER_MAX } from '@/data/trainer/rules';

/**
 * Daño de los poderes con el arma, nivel por nivel.
 *
 * Regla general, sacada de los datos del entrenador:
 *   daño = daño final del arma × multiplicador + daño fijo del poder
 * donde el % del arma es directamente el multiplicador, tenga "+" o no: en los datos el "+"
 * no es consistente (Tifón dice "80%…150%" y Golpe relámpago, su par punzante, "+80%…+150%").
 *
 * Riposte (promedio × (1 + %) + 75) y Cruz del Sur (base × 2 + bonus × (1 + %)) tienen su
 * fórmula probada en el juego en el nivel 5; se respeta y se extiende a los otros niveles.
 *
 * El daño especial (gemas y joyería) no escala con el %: se suma una sola vez al golpe.
 */

export interface AbilityLevel {
  min: number;
  max: number;
  prom: number;
}

export interface AbilityDamage {
  power: Power;
  discipline: Discipline;
  /** Daño de cada nivel (índice 0 = nivel 1) */
  niveles: AbilityLevel[];
  /** true: escala con el arma; false: daño fijo del poder (hechizos) */
  conArma: boolean;
  /** Fórmula comprobada en el juego (en el nivel 5) */
  probada: boolean;
  /** Daño que no entra en el golpe: por segundo, por tick, chance extra... */
  extras: { label: Localized; values: string[] }[];
}

/** Disciplinas de armas: solo valen con un arma de ese tipo de daño */
const WEAPON_DISCIPLINES: Record<string, 'cortante' | 'aplastante' | 'punzante'> = {
  'armas-cortantes': 'cortante',
  'armas-aplastantes': 'aplastante',
  'armas-punzantes': 'punzante',
};

/** Tipo físico principal del arma (el que más pega), que define qué disciplina de armas usa */
export function mainPhysicalType(weapon: Weapon): 'cortante' | 'aplastante' | 'punzante' | null {
  let best: 'cortante' | 'aplastante' | 'punzante' | null = null;
  let bestMax = 0;
  for (const tipo of ['cortante', 'aplastante', 'punzante'] as const) {
    const max = weapon.tiposDano[tipo]?.[1] ?? 0;
    if (max > bestMax) { best = tipo; bestMax = max; }
  }
  return best;
}

/** Disciplinas de arco: solo valen con ese tipo de arco */
const BOW_DISCIPLINES: Record<string, string> = {
  'arcos-cortos': 'Arco Corto',
  'arcos-largos': 'Arco Largo',
};

const sameLabel = (a: Localized, b: Localized) => a.es === b.es;

/** Daño que no se suma al golpe: por segundo, ticks, en el tiempo, chance */
function isExtra(label: Localized): boolean {
  return /por segundo|ticks|en el tiempo|chance/i.test(label.es);
}

/** "+150%" → [1.5, 1.5]; "+40/50%" → [0.4, 0.5]; "20-50%" → [0.2, 0.5] */
function parseMultiplier(raw: string): [number, number] {
  const nums = raw.replace(/[+%\s]/g, '').split(/[/-]/).map(Number).filter((n) => !Number.isNaN(n));
  const [a, b = a] = nums.length ? nums : [0];
  return [a / 100, b / 100];
}

/** "150-200" → [150, 200]; "250" → [250, 250] */
function parseFlat(raw: string): [number, number] {
  const nums = raw.replace(/[+\s]/g, '').split('-').map(Number).filter((n) => !Number.isNaN(n));
  const [a, b = a] = nums.length ? nums : [0];
  return [a, b];
}

const asString = (v: PowerEffect['value'], level: number): string | null => {
  if (v === true) return null;
  const x = atLevel(v, level);
  return typeof x === 'string' ? x : null;
};

function level(min: number, max: number): AbilityLevel {
  const lo = Math.floor(min), hi = Math.floor(max);
  return { min: lo, max: hi, prom: Math.round(((lo + hi) / 2) * 10) / 10 };
}

/** Riposte: promedio × multiplicador + 75 (probada en el juego en nivel 5: ×2,7 + 75) */
const RIPOSTE_EXTRA = 75;

function calcPower(power: Power, calc: WeaponCalcResult): Omit<AbilityDamage, 'discipline'> | null {
  const danos = power.efectos.filter((e) => e.kind === 'dano');
  if (danos.length === 0) return null;
  const weaponEffect = danos.find((e) => sameLabel(e.label, EF.danoAtaque));
  const conArma = !!weaponEffect;
  const extras = danos
    .filter((e) => isExtra(e.label))
    .map((e) => ({ label: e.label, values: Array.from({ length: PODER_MAX }, (_, i) => asString(e.value, i + 1) ?? '') }));

  // Daño del arma sin el especial, que no se multiplica (Formulas.md, paso 3.e)
  const especial = calc.pasos.especial;
  const armaMin = calc.danoMin - especial;
  const armaMax = calc.danoMax - especial;

  const niveles: AbilityLevel[] = [];
  for (let n = 1; n <= PODER_MAX; n++) {
    // Cruz del Sur: base del arma ×2 + parte de bonus ×(1 + segundo valor del bonus)
    if (power.id === 'cruz-del-sur') {
      const bonusRaw = asString(danos.find((e) => sameLabel(e.label, EF.danoAtaqueBonus))?.value ?? '+0%', n) ?? '+0%';
      const [, bonus] = parseMultiplier(bonusRaw);
      const [bMin, bMax] = calc.pasos.danoBase;
      niveles.push(level(
        bMin * 2 + (armaMin - bMin) * (1 + bonus) + especial,
        bMax * 2 + (armaMax - bMax) * (1 + bonus) + especial,
      ));
      continue;
    }

    let multMin = 0, multMax = 0, flatMin = 0, flatMax = 0;
    for (const e of danos) {
      if (isExtra(e.label)) continue;
      const raw = asString(e.value, n);
      if (raw == null) continue;
      if (sameLabel(e.label, EF.danoAtaque)) {
        const [a, b] = parseMultiplier(raw);
        // Riposte: el % se suma al golpe normal (probado: nivel 5 = ×2,7)
        const base = power.id === 'riposte' ? 1 : 0;
        multMin += base + a; multMax += base + b;
      } else if (/del arma extra/i.test(e.label.es)) {
        const [a, b] = parseMultiplier(raw);
        multMin += a; multMax += b;
      } else {
        const [a, b] = parseFlat(raw);
        const times = /cada uno/i.test(e.label.es) ? 3 : 1;
        flatMin += a * times; flatMax += b * times;
      }
    }
    const extra = power.id === 'riposte' ? RIPOSTE_EXTRA : 0;
    // Si el poder no usa el arma (multiplicador 0), tampoco suma el especial del arma
    const espMin = multMin > 0 ? especial : 0;
    const espMax = multMax > 0 ? especial : 0;
    niveles.push(level(armaMin * multMin + espMin + flatMin + extra, armaMax * multMax + espMax + flatMax + extra));
  }

  return { power, niveles, conArma, probada: power.id === 'riposte' || power.id === 'cruz-del-sur' || power.id === 'impacto-vigoroso', extras };
}

/**
 * Poderes de daño que puede usar la subclase con esta arma: los de su disciplina de armas
 * (según el tipo de daño principal) y los de las demás disciplinas que no piden un arma.
 */
export function calcAbilities(weapon: Weapon, calc: WeaponCalcResult, subclase: Subclase): AbilityDamage[] {
  const trainer = TRAINERS[subclase];
  if (!trainer) return [];
  const tipo = mainPhysicalType(weapon);
  const out: AbilityDamage[] = [];
  for (const discipline of trainer.disciplinas) {
    const needs = WEAPON_DISCIPLINES[discipline.id];
    if (needs && needs !== tipo) continue;
    const bow = BOW_DISCIPLINES[discipline.id];
    if (bow && bow !== weapon.subcategoria) continue;
    for (const power of discipline.poderes) {
      const r = calcPower(power, calc);
      if (r) out.push({ ...r, discipline });
    }
  }
  return out;
}
