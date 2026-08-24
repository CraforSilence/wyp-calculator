'use client';

import { useLocalStorage } from './useLocalStorage';
import type { Weapon, WeaponMode, ArrowSet } from '@/types/weapon';

const STORAGE_KEY = 'regnum-build-weapon';
const STORAGE_KEY_MODE = 'regnum-build-weapon-mode';
const STORAGE_KEY_SECONDARY = 'regnum-build-weapon-secondary';
const STORAGE_KEY_ARROWS = 'regnum-build-arrows';

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

const DEFAULT_SECONDARY: Weapon = {
  ...DEFAULT_WEAPON,
  id: 'build-weapon-secondary',
  nombre: '',
};

const DEFAULT_ARROWS: ArrowSet = {
  nombre: '',
  tiposDano: {},
  bonusStat: 0,
  critChanceExtra: 0,
  critDmgExtra: 0,
  bonusDano: {},
};

export function useBuildWeapon() {
  const [weapon, setWeapon] = useLocalStorage<Weapon>(STORAGE_KEY, DEFAULT_WEAPON);
  const [weaponMode, setWeaponMode] = useLocalStorage<WeaponMode>(STORAGE_KEY_MODE, '2manos');
  const [secondaryWeapon, setSecondaryWeapon] = useLocalStorage<Weapon>(STORAGE_KEY_SECONDARY, DEFAULT_SECONDARY);
  const [arrows, setArrows] = useLocalStorage<ArrowSet>(STORAGE_KEY_ARROWS, DEFAULT_ARROWS);

  const updateWeapon = (updates: Partial<Weapon>) => {
    setWeapon((prev) => ({ ...prev, ...updates }));
  };

  const updateSecondaryWeapon = (updates: Partial<Weapon>) => {
    setSecondaryWeapon((prev) => ({ ...prev, ...updates }));
  };

  const updateArrows = (updates: Partial<ArrowSet>) => {
    setArrows((prev) => ({ ...prev, ...updates }));
  };

  const hasWeapon = weapon.nombre.trim().length > 0 && Object.keys(weapon.tiposDano).length > 0;
  const hasSecondaryWeapon = secondaryWeapon.nombre.trim().length > 0 && Object.keys(secondaryWeapon.tiposDano).length > 0;
  const hasArrows = arrows.nombre.trim().length > 0 && Object.keys(arrows.tiposDano).length > 0;

  return {
    weapon, setWeapon, updateWeapon, hasWeapon,
    weaponMode, setWeaponMode,
    secondaryWeapon, setSecondaryWeapon, updateSecondaryWeapon, hasSecondaryWeapon,
    arrows, setArrows, updateArrows, hasArrows,
  };
}
