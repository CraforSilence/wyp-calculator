export interface SimulationHit {
  hitNumber: number;
  rawDamage: Record<string, number>;
  totalRawDamage: number;
  protectionApplied: Record<string, number>;
  resistanceApplied: Record<string, number>;
  specialDamage: Record<string, number>;
  barrierReduction: number;
  finalDamagePerType: Record<string, number>;
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

// Presets para cargar configuraciones predefinidas
import type { Clase, Subclase } from './character';
import type { ArmorSet } from './armor';
import type { JewelrySet } from './jewelry';

export interface ArmorPreset {
  id: string;
  nombre: string;
  clase: Clase;
  subclase: Subclase;
  armorSet: ArmorSet;
}

export interface JewelryPreset {
  id: string;
  nombre: string;
  jewelry: JewelrySet;
}
