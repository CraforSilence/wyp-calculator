import { DEFAULT_ARMOR_SETS } from './default-armor';
import type { CatalogArmorSet } from '@/types/armor';

/** Sets precargados convertidos a formato catálogo */
export const CATALOG_ARMOR_SETS: CatalogArmorSet[] = DEFAULT_ARMOR_SETS.map((set) => ({
  ...set,
  notas: '',
  isDefault: true,
  createdAt: '2026-06-01T00:00:00.000Z',
}));
