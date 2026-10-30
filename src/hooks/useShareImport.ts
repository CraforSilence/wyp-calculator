'use client';

import { useCallback } from 'react';
import { useWeapons } from '@/hooks/useWeapons';
import { useJewelryItems } from '@/hooks/useJewelryItems';
import { useArmorSets } from '@/hooks/useArmorSets';
import { useCharacter } from '@/hooks/useCharacter';
import { useBuildWeapon } from '@/hooks/useBuildWeapon';
import { useArmor } from '@/hooks/useArmor';
import { useJewelry } from '@/hooks/useJewelry';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useTrainer } from '@/hooks/useTrainer';
import { fromSharePayload, type TrainerSharePayload } from '@/lib/trainer';
import { SHARE_TYPE_ROUTES, stripWeapon } from '@/lib/share';
import type { ShareResult, BuildPayload, ComparePayload, SharedWeapon } from '@/lib/share';
import type { Weapon } from '@/types/weapon';
import type { JewelryItem } from '@/types/jewelry';
import type { CatalogArmorSet } from '@/types/armor';

export const COMPARE_SELECTED_KEY = 'regnum-compare-selected';
const MAX_COMPARE = 5;

export interface ImportOptions {
  /** Comparativo: reemplazar tambien el personaje por el de quien lo compartio */
  withCharacter?: boolean;
}

export interface ImportOutcome {
  /** Seccion donde quedo cargado */
  href: string;
  message: string;
}

/** JSON con las claves ordenadas, para comparar armas sin depender del orden de los campos. */
function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    return `{${Object.keys(obj).filter((k) => obj[k] !== undefined).sort()
      .map((k) => `${JSON.stringify(k)}:${stableJson(obj[k])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

/**
 * Carga lo que trae un codigo de compartir en el lugar que corresponde. Lo usan el import
 * general (/importar) y el de cada pagina, asi los dos se comportan igual.
 */
export function useShareImport() {
  const { weapons, addWeapon } = useWeapons();
  const { addItem } = useJewelryItems();
  const { addSet } = useArmorSets();
  const { updateCharacter } = useCharacter();
  const { setWeapon, setWeaponMode, setSecondaryWeapon, setArrows } = useBuildWeapon();
  const { loadPieces, updateSet } = useArmor();
  const { updatePiece } = useJewelry();
  const [, setCompareIds] = useLocalStorage<string[]>(COMPARE_SELECTED_KEY, []);
  const { importSetup } = useTrainer();

  const importShare = useCallback((result: ShareResult, options: ImportOptions = {}): ImportOutcome => {
    const href = SHARE_TYPE_ROUTES[result.type];

    switch (result.type) {
      case 'weapon':
        addWeapon(result.data as Omit<Weapon, 'id' | 'createdAt'>);
        return { href, message: 'Arma importada' };

      case 'jewelry':
        addItem(result.data as Omit<JewelryItem, 'id' | 'createdAt'>);
        return { href, message: 'Joya importada' };

      case 'armor': {
        const data = result.data as Omit<CatalogArmorSet, 'id' | 'createdAt' | 'isDefault'>;
        addSet({ ...data, isDefault: false });
        return { href, message: 'Set importado' };
      }

      case 'build': {
        const data = result.data as BuildPayload;
        updateCharacter(data.character);
        setWeapon({ ...data.weapon, id: 'build-weapon', createdAt: '', isDefault: false } as Weapon);
        setWeaponMode(data.weaponMode || '2manos');
        if (data.secondaryWeapon) {
          setSecondaryWeapon({ ...data.secondaryWeapon, id: 'build-weapon-secondary', createdAt: '', isDefault: false } as Weapon);
        }
        if (data.arrows) setArrows(data.arrows);
        if (data.armor) {
          const { pieces, ...armorRest } = data.armor;
          loadPieces(pieces || {});
          updateSet(armorRest);
        }
        if (data.jewelry) {
          const j = data.jewelry;
          if (j.anillo1) updatePiece('anillo1', j.anillo1.bonuses || []);
          if (j.anillo2) updatePiece('anillo2', j.anillo2.bonuses || []);
          if (j.amuleto) updatePiece('amuleto', j.amuleto.bonuses || []);
        }
        return { href, message: 'Build importado' };
      }

      case 'compare': {
        const data = result.data as ComparePayload;
        // Si ya tenes la misma arma visible (precargada o importada antes) se usa esa en vez de duplicarla
        const known = new Map(weapons.map((w) => [stableJson(stripWeapon(w)), w.id]));
        const ids: string[] = [];
        let added = 0;
        for (const w of data.weapons.slice(0, MAX_COMPARE)) {
          const key = stableJson(w as SharedWeapon);
          let id = known.get(key) ?? null;
          if (!id) {
            id = addWeapon(w);
            if (id) { known.set(key, id); added++; }
          }
          if (id && !ids.includes(id)) ids.push(id);
        }
        setCompareIds(ids);
        if (options.withCharacter) updateCharacter(data.character);
        const extra = added > 0 ? ` (${added} ${added === 1 ? 'arma nueva' : 'armas nuevas'} en Mis armas)` : '';
        return { href, message: `Comparativo importado${extra}` };
      }

      case 'trainer': {
        const payload = result.data as TrainerSharePayload;
        const setup = fromSharePayload(payload);
        if (!setup) return { href, message: 'Setup no válido' };
        importSetup(setup, payload.nm || `${payload.s} ${payload.n}`);
        return { href, message: 'Setup importado' };
      }
    }
  }, [weapons, addWeapon, addItem, addSet, updateCharacter, setWeapon, setWeaponMode, setSecondaryWeapon, setArrows, loadPieces, updateSet, updatePiece, setCompareIds, importSetup]);

  return { importShare };
}
