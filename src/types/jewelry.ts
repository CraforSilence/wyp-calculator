export type JewelrySlot = 'anillo1' | 'anillo2' | 'amuleto';

export type JewelryBonusType =
  | 'dano_punzante' | 'dano_aplastante' | 'dano_cortante'
  | 'dano_electrico' | 'dano_hielo' | 'dano_fuego'
  | 'vida' | 'mana'
  | 'STR' | 'DXT' | 'INT' | 'CON'
  | 'classAttribute'
  | 'attackSpeed' | 'castSpeed'
  | 'weaponDmgPct'
  | 'critChance'
  | 'reduccionMelee' | 'reduccionRango';

export interface JewelryBonus {
  type: JewelryBonusType;
  value: number;
}

export interface JewelryPiece {
  slot: JewelrySlot;
  bonuses: JewelryBonus[];  // máx 5
}

export type JewelrySet = Record<JewelrySlot, JewelryPiece>;

/** Tipo de slot genérico para el catálogo (sin distinción anillo1/anillo2) */
export type JewelryItemSlot = 'anillo' | 'amuleto';

/** Pieza de joyería catalogable (para la página /joyeria) */
export interface JewelryItem {
  id: string;
  nombre: string;
  slot: JewelryItemSlot;
  bonuses: JewelryBonus[];
  notas: string;
  isDefault: boolean;
  createdAt: string;
}
