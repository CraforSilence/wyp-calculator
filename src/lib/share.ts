import { compressToBase64, decompressFromBase64 } from 'lz-string';
import type { Weapon, ArrowSet, WeaponMode } from '@/types/weapon';
import type { JewelryItem, JewelrySet } from '@/types/jewelry';
import type { CatalogArmorSet, ArmorSet } from '@/types/armor';
import type { CharacterProfile } from '@/types/character';

export type ShareType = 'weapon' | 'jewelry' | 'armor' | 'build';

const PREFIXES: Record<ShareType, string> = {
  weapon: 'WYP-W:',
  jewelry: 'WYP-J:',
  armor: 'WYP-A:',
  build: 'WYP-B:',
};

const PREFIX_TO_TYPE: Record<string, ShareType> = {
  'WYP-W:': 'weapon',
  'WYP-J:': 'jewelry',
  'WYP-A:': 'armor',
  'WYP-B:': 'build',
};

export interface BuildPayload {
  character: CharacterProfile;
  weapon: Omit<Weapon, 'id' | 'createdAt' | 'isDefault'>;
  weaponMode: WeaponMode;
  secondaryWeapon?: Omit<Weapon, 'id' | 'createdAt' | 'isDefault'>;
  arrows?: ArrowSet;
  armor: ArmorSet;
  jewelry: JewelrySet;
}

export interface ShareResult {
  type: ShareType;
  data: unknown;
}

type ShareTypeLabel = Record<ShareType, string>;

export const SHARE_TYPE_LABELS: ShareTypeLabel = {
  weapon: 'Arma',
  jewelry: 'Joya',
  armor: 'Set de armadura',
  build: 'Build completo',
};

function stripMeta<T extends Record<string, unknown>>(obj: T): Omit<T, 'id' | 'createdAt' | 'isDefault'> {
  const { id, createdAt, isDefault, ...rest } = obj;
  return rest as Omit<T, 'id' | 'createdAt' | 'isDefault'>;
}

export function stripWeapon(w: Weapon): Omit<Weapon, 'id' | 'createdAt' | 'isDefault'> {
  return stripMeta(w as unknown as Record<string, unknown>) as Omit<Weapon, 'id' | 'createdAt' | 'isDefault'>;
}

export function encodeShareCode(type: ShareType, data: unknown): string {
  const json = JSON.stringify(data);
  const compressed = compressToBase64(json);
  return PREFIXES[type] + compressed;
}

export function decodeShareCode(code: string): ShareResult | null {
  const trimmed = code.trim();

  let matchedType: ShareType | null = null;
  let payload = '';

  for (const [prefix, type] of Object.entries(PREFIX_TO_TYPE)) {
    if (trimmed.startsWith(prefix)) {
      matchedType = type;
      payload = trimmed.slice(prefix.length);
      break;
    }
  }

  if (!matchedType || !payload) return null;

  try {
    const json = decompressFromBase64(payload);
    if (!json) return null;
    const data = JSON.parse(json);
    if (!validatePayload(matchedType, data)) return null;
    return { type: matchedType, data };
  } catch {
    return null;
  }
}

function validatePayload(type: ShareType, data: unknown): boolean {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;

  switch (type) {
    case 'weapon':
      return typeof obj.nombre === 'string' && typeof obj.clase === 'string' && typeof obj.subcategoria === 'string';
    case 'jewelry':
      return typeof obj.nombre === 'string' && typeof obj.slot === 'string' && Array.isArray(obj.bonuses);
    case 'armor':
      return typeof obj.nombre === 'string' && typeof obj.clase === 'string' && typeof obj.pieces === 'object';
    case 'build':
      return typeof obj.character === 'object' && typeof obj.weapon === 'object' && typeof obj.armor === 'object';
    default:
      return false;
  }
}

export function getSharePreview(result: ShareResult): string {
  const obj = result.data as Record<string, unknown>;
  switch (result.type) {
    case 'weapon':
      return `Arma: ${obj.nombre}`;
    case 'jewelry':
      return `Joya: ${obj.nombre}`;
    case 'armor':
      return `Armadura: ${obj.nombre}`;
    case 'build': {
      const char = obj.character as Record<string, unknown>;
      const weapon = obj.weapon as Record<string, unknown>;
      return `Build: ${char?.subclase ?? '?'} — ${weapon?.nombre ?? 'Sin arma'}`;
    }
    default:
      return 'Desconocido';
  }
}
