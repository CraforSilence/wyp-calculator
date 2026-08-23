import type { DamageTypeName } from './weapon';

export type ArmorSlot =
  | 'pechera' | 'casco' | 'perneras' | 'hombreras'
  | 'guanteletes' | 'escudo' | 'brazalete' | 'tunica';

export type ProtectionQuality =
  | 'Muy Mala' | 'Mala' | 'Normal' | 'Buena' | 'Muy Buena';

export type GeneralDamageType = 'fisico' | 'magico';

export type ArmorBonusType =
  | 'vida' | 'mana' | 'constitucion' | 'fuerza'
  | 'velocidadAtaque' | 'velocidadIncantacion'
  | 'armaduraPct';

export interface ArmorBonus {
  type: ArmorBonusType;
  value: number;
}

export interface ArmorPiece {
  slot: ArmorSlot;
  pba: number;
  bcmt: number;
  protectionFactors: Partial<Record<DamageTypeName, ProtectionQuality>>;
  bonusProteccionPct: Partial<Record<DamageTypeName, number>>;
  bonuses: ArmorBonus[];
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
