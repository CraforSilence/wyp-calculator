/**
 * Cajas de equipamiento: cajas que se compran en el juego y dejan elegir bonus para la pieza.
 *
 * Cada caja tiene una lista de modificadores con su valor base y hasta dónde se puede subir.
 * Los que tienen `legendary: true` solo se pueden elegir en la Caja Legendaria (en las imágenes
 * del juego van marcados con una "L").
 *
 * Para agregar una caja nueva: sumar un objeto a EQUIPMENT_BOXES con su `group`. Las armaduras van
 * separadas como en el juego: Arquero y Guerrero por un lado, Mago por el otro.
 *
 * Los nombres se normalizan a los de la app ("Mana" → "Maná", "Regenerar salud" → "Regeneración
 * de salud", "Mana%" → Maná con %), los valores quedan tal cual la imagen del juego.
 */

import type { Subclase } from '@/types/character';

export type BoxModifier = {
  name: string;
  base: number;
  max: number;
  /** El valor es un porcentaje. */
  pct?: boolean;
  /** Solo en la Caja Legendaria. */
  legendary?: boolean;
};

export type EquipmentBox = {
  id: string;
  label: string;
  group: 'arma' | 'armadura-ag' | 'armadura-mago';
  icon: string;
  /** Subclases que pueden usar la pieza (los íconos de clase que muestra el juego al lado del título). */
  subclases: Subclase[];
  modifiers: BoxModifier[];
};

const GUERRERO: Subclase[] = ['Bárbaro', 'Caballero'];
const ARQUERO: Subclase[] = ['Cazador', 'Tirador'];
const MAGO: Subclase[] = ['Conjurador', 'Brujo'];

export const BOX_GROUPS: { id: EquipmentBox['group']; label: string; sub?: string }[] = [
  { id: 'arma', label: 'Armas' },
  { id: 'armadura-ag', label: 'Armaduras', sub: 'Arquero y Guerrero' },
  { id: 'armadura-mago', label: 'Armaduras', sub: 'Mago' },
];

export const EQUIPMENT_BOXES: EquipmentBox[] = [
  {
    id: 'armas-guerreros',
    label: 'Armas guerreros',
    group: 'arma',
    icon: '/icons/armas/espada.svg',
    subclases: GUERRERO,
    modifiers: [
      { name: 'Fuerza', base: 2, max: 5 },
      { name: 'Concentración', base: 2, max: 5 },
      { name: 'Daño físico/mágico', base: 10, max: 20 },
      { name: 'Chance de crítico', base: 13, max: 25, pct: true },
      { name: 'Velocidad de ataque', base: 2, max: 5, pct: true },
      { name: 'Velocidad de invocación', base: 2, max: 5, pct: true },
      { name: 'Chance de crítico', base: 31, max: 40, pct: true, legendary: true },
      { name: 'Daño crítico', base: 7, max: 10, pct: true, legendary: true },
      { name: 'Atributo de clase', base: 3, max: 6, pct: true, legendary: true },
    ],
  },
  {
    id: 'arcos',
    label: 'Arcos',
    group: 'arma',
    icon: '/icons/armas/arco-largo.svg',
    subclases: ARQUERO,
    modifiers: [
      { name: 'Daño físico/mágico', base: 8, max: 15 },
      { name: 'Destreza', base: 2, max: 5 },
      { name: 'Velocidad de invocación', base: 2, max: 5, pct: true },
      { name: 'Concentración', base: 2, max: 5 },
      { name: 'Chance de crítico', base: 13, max: 25, pct: true },
      { name: 'Velocidad de ataque', base: 2, max: 5, pct: true },
      { name: 'Chance de crítico', base: 24, max: 30, pct: true, legendary: true },
      { name: 'Daño crítico', base: 3, max: 6, pct: true, legendary: true },
      { name: 'Atributo de clase', base: 3, max: 6, pct: true, legendary: true },
    ],
  },
  {
    id: 'baculos',
    label: 'Báculos',
    group: 'arma',
    icon: '/icons/armas/baculo.svg',
    subclases: MAGO,
    modifiers: [
      { name: 'Inteligencia', base: 4, max: 7 },
      { name: 'Concentración', base: 4, max: 7 },
      { name: 'Salud', base: 105, max: 175 },
      { name: 'Daño físico/mágico', base: 13, max: 25 },
      { name: 'Chance de crítico', base: 13, max: 25, pct: true },
      { name: 'Velocidad de ataque', base: 4, max: 7, pct: true },
      { name: 'Velocidad de invocación', base: 4, max: 7, pct: true },
      { name: 'Chance de crítico', base: 24, max: 30, pct: true, legendary: true },
      { name: 'Maná', base: 5, max: 8, pct: true, legendary: true },
      { name: 'Atributo de clase', base: 3, max: 6, pct: true, legendary: true },
    ],
  },
  {
    id: 'yelmo-ag',
    label: 'Yelmo',
    group: 'armadura-ag',
    icon: '/icons/casco.svg',
    subclases: [...GUERRERO, ...ARQUERO],
    modifiers: [
      { name: 'Fuerza / Destreza', base: 2, max: 5 },
      { name: 'Maná', base: 90, max: 150 },
      { name: 'Bonus de armadura', base: 2, max: 5, pct: true },
      { name: 'Rango de ataque', base: 1, max: 2, pct: true },
      { name: 'Resistir daño físico/mágico', base: 1, max: 2, pct: true },
      { name: 'Resistir daños específicos', base: 2, max: 3, pct: true },
      { name: 'Bonus de curación', base: 3, max: 6, pct: true, legendary: true },
      { name: 'Regeneración de salud', base: 3, max: 6, pct: true, legendary: true },
    ],
  },
  {
    id: 'hombreras-ag',
    label: 'Hombreras',
    group: 'armadura-ag',
    icon: '/icons/hombreras.svg',
    subclases: [...GUERRERO, ...ARQUERO],
    modifiers: [
      { name: 'Constitución', base: 2, max: 5 },
      { name: 'Velocidad de invocación', base: 2, max: 5, pct: true },
      { name: 'Resistir daño físico/mágico', base: 1, max: 2, pct: true },
      { name: 'Resistir daños específicos', base: 2, max: 3, pct: true },
      { name: 'Resistir noqueo', base: 1, max: 4, pct: true, legendary: true },
      { name: 'Resistir inmovilización', base: 1, max: 4, pct: true, legendary: true },
    ],
  },
  {
    id: 'pechera-ag',
    label: 'Pechera',
    group: 'armadura-ag',
    icon: '/icons/pechera.svg',
    subclases: [...GUERRERO, ...ARQUERO],
    modifiers: [
      { name: 'Constitución', base: 2, max: 5 },
      { name: 'Salud', base: 90, max: 150 },
      { name: 'Bonus de armadura', base: 2, max: 5, pct: true },
      { name: 'Resistir daño físico/mágico', base: 1, max: 2, pct: true },
      { name: 'Resistir daños específicos', base: 2, max: 3, pct: true },
      { name: 'Regeneración de salud', base: 4, max: 7, pct: true, legendary: true },
      { name: 'Resistir aturdir', base: 2, max: 5, pct: true, legendary: true },
      { name: 'Resistir parálisis', base: 2, max: 5, pct: true, legendary: true },
    ],
  },
  {
    id: 'guanteletes-ag',
    label: 'Guanteletes',
    group: 'armadura-ag',
    icon: '/icons/guanteletes.svg',
    subclases: [...GUERRERO, ...ARQUERO],
    modifiers: [
      { name: 'Concentración', base: 2, max: 5 },
      { name: 'Chance de crítico', base: 13, max: 25, pct: true },
      { name: 'Resistir daño físico/mágico', base: 1, max: 2, pct: true },
      { name: 'Resistir daños específicos', base: 2, max: 3, pct: true },
      { name: 'Regeneración de maná', base: 2, max: 5, pct: true, legendary: true },
      { name: 'Bonus de curación', base: 3, max: 6, pct: true, legendary: true },
    ],
  },
  {
    id: 'perneras-ag',
    label: 'Perneras',
    group: 'armadura-ag',
    icon: '/icons/perneras.svg',
    subclases: [...GUERRERO, ...ARQUERO],
    modifiers: [
      { name: 'Destreza', base: 2, max: 5 },
      { name: 'Maná', base: 90, max: 150 },
      { name: 'Evasión', base: 9, max: 15, pct: true },
      { name: 'Velocidad de ataque', base: 2, max: 5, pct: true },
      { name: 'Resistir daño físico/mágico', base: 1, max: 2, pct: true },
      { name: 'Resistir daños específicos', base: 2, max: 3, pct: true },
      { name: 'Velocidad de movimiento', base: 1, max: 4, pct: true, legendary: true },
      { name: 'Resistir mareo', base: 2, max: 5, pct: true, legendary: true },
    ],
  },
  {
    id: 'sombrero-mago',
    label: 'Sombrero',
    group: 'armadura-mago',
    icon: '/icons/casco.svg',
    subclases: MAGO,
    modifiers: [
      { name: 'Inteligencia', base: 4, max: 7 },
      { name: 'Maná', base: 105, max: 175 },
      { name: 'Bonus de armadura', base: 4, max: 7, pct: true },
      { name: 'Rango de ataque', base: 2, max: 3, pct: true },
      { name: 'Resistir daño físico/mágico', base: 1, max: 2, pct: true },
      { name: 'Resistir daños específicos', base: 2, max: 3, pct: true },
      { name: 'Bonus de curación', base: 5, max: 8, pct: true, legendary: true },
      { name: 'Regeneración de salud', base: 4, max: 7, pct: true, legendary: true },
    ],
  },
  {
    id: 'tunica-mago',
    label: 'Túnica',
    group: 'armadura-mago',
    icon: '/icons/tunica.svg',
    subclases: MAGO,
    modifiers: [
      { name: 'Constitución', base: 4, max: 7 },
      { name: 'Concentración', base: 4, max: 7 },
      { name: 'Salud', base: 105, max: 175 },
      { name: 'Evasión', base: 12, max: 21, pct: true },
      { name: 'Resistir daño físico/mágico', base: 1, max: 2, pct: true },
      { name: 'Resistir daños específicos', base: 2, max: 3, pct: true },
      { name: 'Velocidad de movimiento', base: 3, max: 6, pct: true, legendary: true },
      { name: 'Regeneración de salud', base: 6, max: 9, pct: true, legendary: true },
      { name: 'Resistir aturdir/parálisis/mareo', base: 3, max: 6, pct: true, legendary: true },
    ],
  },
  {
    id: 'guantes-mago',
    label: 'Guantes',
    group: 'armadura-mago',
    icon: '/icons/guanteletes.svg',
    subclases: MAGO,
    modifiers: [
      { name: 'Concentración', base: 4, max: 7 },
      { name: 'Maná', base: 105, max: 175 },
      { name: 'Chance de crítico', base: 15, max: 30, pct: true },
      { name: 'Velocidad de ataque', base: 4, max: 7, pct: true },
      { name: 'Resistir daño físico/mágico', base: 1, max: 2, pct: true },
      { name: 'Resistir daños específicos', base: 2, max: 3, pct: true },
      { name: 'Regeneración de maná', base: 4, max: 7, pct: true, legendary: true },
      { name: 'Resistir noqueo/inmovilización', base: 3, max: 6, pct: true, legendary: true },
      { name: 'Bonus de curación', base: 4, max: 7, pct: true, legendary: true },
    ],
  },
  {
    id: 'brazalete-mago',
    label: 'Brazalete',
    group: 'armadura-mago',
    icon: '/icons/brazalete.svg',
    subclases: MAGO,
    modifiers: [
      { name: 'Concentración', base: 2, max: 5 },
      { name: 'Maná', base: 105, max: 175 },
      { name: 'Chance de crítico', base: 15, max: 30, pct: true },
      { name: 'Velocidad de ataque', base: 2, max: 5, pct: true },
      { name: 'Resistir daño físico/mágico', base: 1, max: 2, pct: true },
      { name: 'Resistir daños específicos', base: 2, max: 3, pct: true },
      { name: 'Chance de crítico', base: 19, max: 24, pct: true, legendary: true },
      { name: 'Maná', base: 5, max: 8, pct: true, legendary: true },
      { name: 'Atributo de clase', base: 3, max: 6, pct: true, legendary: true },
    ],
  },
];

export const formatBoxValue = (m: BoxModifier, v: number) => `${v}${m.pct ? '%' : ''}`;
