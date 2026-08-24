import type { Clase } from './character';

export type DamageTypeName =
  | 'punzante' | 'aplastante' | 'cortante'
  | 'electrico' | 'hielo' | 'fuego';

export type Velocidad = 'lenta' | 'media' | 'rapida';
export type Rareza = 'Épica' | 'Mágica' | 'Legendaria' | 'Arcana';
export type Subcategoria =
  | 'Lanza' | 'Maza' | 'Espada' | 'Hacha'
  | 'Martillo' | 'Florin' | 'Garrote'
  | 'Arco Corto' | 'Arco Largo' | 'Baculo';

export interface Weapon {
  id: string;
  nombre: string;
  clase: Clase;
  subcategoria: Subcategoria;
  rareza: Rareza;
  velocidad: Velocidad;
  bonusStat: number;
  bonusAtributo: number;
  critChanceExtra: number;
  critDmgExtra: number;
  attackSpeedPct: number;
  atributoClasePct: number;
  tiposDano: Partial<Record<DamageTypeName, [number, number]>>;
  bonusDano: Partial<Record<DamageTypeName, number>>;
  muescas: Partial<Record<DamageTypeName, number>>;
  notas: string;
  isDefault?: boolean;
  createdAt: string;
}

export type WeaponMode = '2manos' | 'duales';

export interface ArrowSet {
  nombre: string;
  tiposDano: Partial<Record<DamageTypeName, [number, number]>>;
  bonusStat: number;
  critChanceExtra: number;
  critDmgExtra: number;
  bonusDano: Partial<Record<DamageTypeName, number>>;
}

export interface WeaponCalcResult {
  nombre: string;
  danoMin: number;
  danoMax: number;
  danoPromedio: number;
  critTotalPct: number;
  critMult: number;
  velBase: number;
  attackSpeedPct: number;
  velEfectiva: number;
  golpesPorSeg: number;
  dpsEfectivo: number;
  riposteDmg: number | null;
  impactoVigoroso: { min: number; max: number; prom: number } | null;
  desglose: Record<string, [number, number]>;
  specialDamagePerType: Record<string, number>;
}
