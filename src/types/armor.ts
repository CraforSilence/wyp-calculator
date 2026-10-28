import type { DamageTypeName } from './weapon';

export type ArmorSlot =
  | 'pechera' | 'casco' | 'perneras' | 'hombreras'
  | 'guanteletes' | 'escudo' | 'brazalete' | 'tunica';

export type ProtectionQuality =
  | 'Muy Mala' | 'Mala' | 'Normal' | 'Buena' | 'Muy Buena';

/** Rareza de una pieza de armadura. Artesano existe solo en armaduras (Magnanitas, Champion). */
export type ArmorRareza = 'Mágica' | 'Épica' | 'Legendaria' | 'Arcana' | 'Artesano';

/** Familia de los sets precargados: define cuantas mejoras de armadura lleva cada pieza. */
export type ArmorFamilia = 'magnanitas' | 'champion' | 'dragon';

export type GeneralDamageType = 'fisico' | 'magico';

export type ArmorBonusType =
  | 'vida' | 'mana' | 'constitucion' | 'fuerza'
  | 'concentracion' | 'inteligencia' | 'destreza'
  | 'velocidadAtaque' | 'velocidadIncantacion'
  | 'critChance'
  | 'armaduraPct' | 'rangoAtaque' | 'velocidadMovimiento' | 'velocidadMovimientoBZ' | 'bonusCuracion'
  | 'resistirFisico' | 'resistirMagico'
  | 'resistirFuego' | 'resistirHielo' | 'resistirElectricidad'
  | 'resistirAplastante' | 'resistirCortante' | 'resistirPunzante'
  | 'bloqueo';

export interface ArmorBonus {
  type: ArmorBonusType;
  value: number;
}

export interface ArmorUpgrade {
  type: DamageTypeName;
  value: number; // 1 or 2
}

export interface ArmorPiece {
  slot: ArmorSlot;
  pba: number;
  bcmt: number;
  protectionFactors: Partial<Record<DamageTypeName, ProtectionQuality>>;
  bonusProteccionPct: Partial<Record<DamageTypeName, number>>;
  bonuses: ArmorBonus[];
  upgrades: ArmorUpgrade[];
  /** Sin definir en datos viejos: se usa la del set o Legendaria. */
  rareza?: ArmorRareza;
}

export interface ArmorSet {
  pieces: Partial<Record<ArmorSlot, ArmorPiece>>;
  bonusArmaduraPct: number;
  generalResistance: Record<GeneralDamageType, number>;
  typeResistance: Partial<Record<DamageTypeName, number>>;
  barrierPoints: Partial<Record<DamageTypeName, number>>;
  meleeDmgReductionPct: number;
  rangedDmgReductionPct: number;
  /** Bonus del conjunto del set precargado (Armadura %, resistencias, etc.): aplican a toda la armadura */
  bonusConjunto?: ArmorBonus[];
}

export interface ProtectionResult {
  perType: Record<string, number>;
  perPiece: Record<string, Record<string, number>>;
}

export interface DefaultArmorSet {
  id: string;
  nombre: string;
  clase: 'Guerrero' | 'Arquero' | 'Mago';
  subclase?: string;
  pieces: Partial<Record<ArmorSlot, ArmorPiece>>;
  /** Rareza de todas las piezas del set (cada pieza puede sobrescribirla). */
  rareza?: ArmorRareza;
  /** Familia del set (sin definir = armadura cargada a mano) */
  familia?: ArmorFamilia;
  bonusConjunto: ArmorBonus[];
  bonusConjuntoPorSubclase?: Partial<Record<string, ArmorBonus[]>>;
}

/** Set de armadura catalogable (para la página /armadura) */
export interface CatalogArmorSet extends DefaultArmorSet {
  notas: string;
  isDefault: boolean;
  createdAt: string;
}
