'use client';

import { useMemo } from 'react';
import { useCharacter } from '@/hooks/useCharacter';
import { useJewelry } from '@/hooks/useJewelry';
import { useBuildWeapon } from '@/hooks/useBuildWeapon';
import { calcWeaponDamage, calcDualDamage } from '@/lib/engine/damage';

/** Dano del arma del Build con la joyeria aplicada (y duales o flechas si corresponde). */
export function useBuildDamage() {
  const { character } = useCharacter();
  const { jewelry } = useJewelry();
  const { weapon, hasWeapon, weaponMode, secondaryWeapon, hasSecondaryWeapon, arrows, hasArrows } = useBuildWeapon();

  const isArquero = character.clase === 'Arquero';
  const isDualMode = character.subclase === 'Bárbaro' && weaponMode === 'duales';

  const calc = useMemo(() => {
    if (!hasWeapon) return null;
    const arrowsToUse = isArquero && hasArrows ? arrows : null;
    return calcWeaponDamage(weapon, character, jewelry, arrowsToUse);
  }, [weapon, character, jewelry, hasWeapon, isArquero, hasArrows, arrows]);

  const dualCalc = useMemo(() => {
    if (!isDualMode || !hasWeapon || !hasSecondaryWeapon) return null;
    return calcDualDamage(weapon, secondaryWeapon, character, jewelry);
  }, [isDualMode, weapon, secondaryWeapon, character, jewelry, hasWeapon, hasSecondaryWeapon]);

  const secondaryCalc = useMemo(() => {
    if (!isDualMode || !hasSecondaryWeapon) return null;
    return calcWeaponDamage(secondaryWeapon, character, jewelry);
  }, [isDualMode, secondaryWeapon, character, jewelry, hasSecondaryWeapon]);

  // Lo que se muestra como resultado principal: duales combinados o el arma sola
  const mainCalc = isDualMode && dualCalc ? dualCalc : calc;

  return {
    weapon, secondaryWeapon, hasWeapon, hasArrows, jewelry,
    isArquero, isDualMode, calc, dualCalc, secondaryCalc, mainCalc,
  };
}
