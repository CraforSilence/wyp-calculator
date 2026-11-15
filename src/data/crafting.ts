/**
 * Daño (+X) de las armas crafteadas según material, calidad y rareza.
 *
 * Guerrero: tabla del juego, aditiva exacta en las 60 celdas.
 * Arcos: misma suma × 0.8 redondeado para abajo. Ajustado a 19 tooltips reales (13 combinaciones,
 * 0 fallos). La columna Común no tiene ningún dato real y la base de Madera reforzada puede ser 31 o 32.
 * Detalle en Tablas-Crafteo.md.
 */

export const QUALITIES = [
  { name: 'Común', bonus: 0 },
  { name: 'Mejorado', bonus: 4 },
  { name: 'Superior', bonus: 8 },
  { name: 'Gran', bonus: 10 },
  { name: 'Maestre', bonus: 15 },
] as const;

// Mismos nombres que la rareza de las armas, así toman los colores de Badge
export const RARITIES = [
  { name: 'Mágica', bonus: 0 },
  { name: 'Épica', bonus: 4 },
  { name: 'Legendaria', bonus: 6 },
] as const;

/** estimated: no hay ningún tooltip de ese material, toda la tabla sale de la fórmula. */
export type CraftMaterial = { name: string; base: number; note?: string; estimated?: boolean };

export type CraftFamily = {
  id: 'guerrero' | 'arco' | 'baculo';
  label: string;
  icon: string;
  materials: CraftMaterial[];
  /** Multiplicador sobre la suma (1 = sin cambio). */
  factor: number;
  /** Calidades sin datos reales: las celdas salen solo de la fórmula. */
  estimatedQualities: string[];
};

export const CRAFT_FAMILIES: CraftFamily[] = [
  {
    id: 'guerrero',
    label: 'Armas',
    icon: '/icons/armas/espada.svg',
    factor: 1,
    estimatedQualities: [],
    materials: [
      { name: 'Acero', base: 14 },
      { name: 'Acero fino', base: 22 },
      { name: 'Aleación de acero', base: 30 },
      { name: 'Xymerald', base: 42 },
    ],
  },
  {
    id: 'arco',
    label: 'Arcos',
    icon: '/icons/armas/arco-largo.svg',
    factor: 0.8,
    estimatedQualities: ['Común'],
    materials: [
      { name: 'Madera fina', base: 7 },
      { name: 'Madera endurecida', base: 15 },
      { name: 'Madera endurecida fina', base: 23 },
      { name: 'Madera reforzada', base: 31, note: 'Base sin confirmar (31 o 32).' },
      { name: 'Lámina de Xymerald', base: 43 },
    ],
  },
  {
    // ×0.5: ajustado a 5 tooltips de báculos crafteados, 0 fallos. Aliento desintegrador de Thorkul
    // (Acero fino Maestre Épico) da 21 en vez de 20: es un arma especial, no entra en la fórmula.
    // Hay báculos de Acero fino (base 22 o 23 dan lo mismo con estos datos); se muestra la línea de maderas.
    id: 'baculo',
    label: 'Báculos',
    icon: '/icons/armas/baculo.svg',
    factor: 0.5,
    estimatedQualities: ['Común'],
    materials: [
      { name: 'Madera fina', base: 7, estimated: true },
      { name: 'Madera endurecida', base: 15 },
      { name: 'Madera endurecida fina', base: 23 },
      { name: 'Madera reforzada', base: 31, estimated: true },
      { name: 'Lámina de Xymerald', base: 43 },
    ],
  },
];

export function craftDamage(family: CraftFamily, base: number, quality: number, rarity: number): number {
  return Math.floor(family.factor * (base + quality + rarity) + 1e-9);
}
