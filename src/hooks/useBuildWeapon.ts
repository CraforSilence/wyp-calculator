'use client';

import { useLocalStorage } from './useLocalStorage';
import type { Weapon } from '@/types/weapon';

const STORAGE_KEY = 'regnum-build-weapon';

const DEFAULT_WEAPON: Weapon = {
  id: 'build-weapon',
  nombre: '',
  clase: 'Guerrero',
  subcategoria: 'Lanza',
  velocidad: 'media',
  rareza: 'Épica',
  bonusStat: 0,
  bonusAtributo: 0,
  critChanceExtra: 0,
  critDmgExtra: 0,
  attackSpeedPct: 0,
  atributoClasePct: 0,
  tiposDano: {},
  bonusDano: {},
  muescas: {},
  notas: '',
  isDefault: false,
  createdAt: '',
};

export function useBuildWeapon() {
  const [weapon, setWeapon] = useLocalStorage<Weapon>(STORAGE_KEY, DEFAULT_WEAPON);

  const updateWeapon = (updates: Partial<Weapon>) => {
    setWeapon((prev) => ({ ...prev, ...updates }));
  };

  const hasWeapon = weapon.nombre.trim().length > 0 && Object.keys(weapon.tiposDano).length > 0;

  return { weapon, setWeapon, updateWeapon, hasWeapon };
}
