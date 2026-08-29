import type { DamageTypeName } from './weapon';

export type ArmorSlot =
  | 'pechera' | 'casco' | 'perneras' | 'hombreras'
  | 'guanteletes' | 'escudo' | 'brazalete' | 'tunica';

export type ProtectionQuality =
  | 'Muy Mala' | 'Mala' | 'Normal' | 'Buena' | 'Muy Buena';

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
}

export interface ArmorSet {
  pieces: Partial<Record<ArmorSlot, ArmorPiece>>;
  bonusArmaduraPct: number;
  generalResistance: Record<GeneralDamageType, number>;
  typeResistance: Partial<Record<DamageTypeName, number>>;
  barrierPoints: Partial<Record<DamageTypeName, number>>;
  meleeDmgReductionPct: number;
  rangedDmgReductionPct: number;
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
  bonusConjunto: ArmorBonus[];
  bonusConjuntoPorSubclase?: Partial<Record<string, ArmorBonus[]>>;
}
