import type { Clase } from '@/types/character';
import type { Weapon, WeaponAttr } from '@/types/weapon';

/** Nombre de cada atributo tal como aparece en los slots de bonus del arma. */
export const WEAPON_ATTR_LABELS: Record<WeaponAttr, string> = {
  STR: 'Fuerza',
  DXT: 'Destreza',
  INT: 'Inteligencia',
  CON: 'Constitucion',
  FOC: 'Concentracion',
};

export const WEAPON_ATTRS = Object.keys(WEAPON_ATTR_LABELS) as WeaponAttr[];

/** Atributo de un slot de bonus ("Fuerza", "Destreza", ...), o undefined si no es un atributo. */
export function weaponAttrFromLabel(label: string): WeaponAttr | undefined {
  return WEAPON_ATTRS.find((a) => WEAPON_ATTR_LABELS[a] === label);
}

/** Stat que subia el `bonusStat` viejo: el principal de la clase del arma. */
const LEGACY_STAT_BY_CLASE: Record<Clase, WeaponAttr> = {
  Guerrero: 'STR',
  Arquero: 'DXT',
  Mago: 'INT',
};

/**
 * Atributos que da el arma. Las armas guardadas antes de `atributos` solo tienen `bonusStat`,
 * que se tomaba como el stat principal de la clase del arma.
 */
export function getWeaponAttributes(weapon: Pick<Weapon, 'atributos' | 'bonusStat' | 'clase'>): Partial<Record<WeaponAttr, number>> {
  if (weapon.atributos) return weapon.atributos;
  return weapon.bonusStat ? { [LEGACY_STAT_BY_CLASE[weapon.clase]]: weapon.bonusStat } : {};
}

/** Suma los atributos de dos armas (duales). */
export function sumWeaponAttributes(
  a: Partial<Record<WeaponAttr, number>>,
  b: Partial<Record<WeaponAttr, number>>
): Partial<Record<WeaponAttr, number>> {
  const out: Partial<Record<WeaponAttr, number>> = { ...a };
  for (const [attr, valor] of Object.entries(b) as [WeaponAttr, number][]) {
    if (valor) out[attr] = (out[attr] || 0) + valor;
  }
  return out;
}
