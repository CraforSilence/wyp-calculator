export interface SimulationHit {
  hitNumber: number;
  rawDamage: Record<string, number>;
  totalRawDamage: number;
  protectionApplied: Record<string, number>;
  resistanceApplied: Record<string, number>;
  specialDamage: Record<string, number>;
  barrierReduction: number;
  finalDamage: number;
  isCrit: boolean;
  minimumDamageEnforced: boolean;
}

export interface SimulationResult {
  weaponName: string;
  armorName: string;
  hits: SimulationHit[];
  averageDamage: number;
  totalDamage: number;
  critsLanded: number;
}
