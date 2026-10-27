import { DAMAGE_TYPE_ICONS, DAMAGE_TYPE_LABELS, ALL_DAMAGE_TYPES } from '@/lib/engine/constants';
import type { DamageTypeName } from '@/types/weapon';

/**
 * Icono y grupo de cada bonus, para que los selectores se lean de un vistazo. Las claves son
 * las de armadura y joyeria, y los nombres que usan los bonus de arma ("Fuerza", "Dano Fuego").
 */
type BonusGroup = 'Atributos' | 'Daño' | 'Crítico' | 'Velocidad' | 'Resistencias' | 'Otros';

const ATTRIBUTE: Record<string, string> = {
  fuerza: '💪', STR: '💪', Fuerza: '💪',
  destreza: '🎯', DXT: '🎯', Destreza: '🎯',
  inteligencia: '🧠', INT: '🧠', Inteligencia: '🧠',
  constitucion: '🧱', CON: '🧱', Constitucion: '🧱',
  concentracion: '🧘', FOC: '🧘', Concentracion: '🧘',
  classAttribute: '⭐', 'Atributo de clase %': '⭐',
};

const CRIT: Record<string, string> = {
  critChance: '💥', 'Chance de critico %': '💥',
  'Dano critico %': '💢',
};

const SPEED: Record<string, string> = {
  velocidadAtaque: '⏩', attackSpeed: '⏩', 'Vel ataque %': '⏩',
  velocidadIncantacion: '✨', castSpeed: '✨',
  velocidadMovimiento: '👟', velocidadMovimientoBZ: '👟',
};

const RESIST: Record<string, string> = {
  resistirFisico: '🪖', resistirMagico: '🔮',
  resistirCortante: DAMAGE_TYPE_ICONS.cortante, resistirPunzante: DAMAGE_TYPE_ICONS.punzante,
  resistirAplastante: DAMAGE_TYPE_ICONS.aplastante, resistirFuego: DAMAGE_TYPE_ICONS.fuego,
  resistirHielo: DAMAGE_TYPE_ICONS.hielo, resistirElectricidad: DAMAGE_TYPE_ICONS.electrico,
  armaduraPct: '🛡️', bloqueo: '🔰',
  reduccionMelee: '🤺', reduccionRango: '🪃',
};

const OTHER: Record<string, string> = {
  vida: '❤️', mana: '💧', rangoAtaque: '📏', bonusCuracion: '💚', weaponDmgPct: '🗡️',
};

/** Tipo de dano al que apunta un bonus de dano ("dano_fuego", "Dano Fuego"), si lo es. */
function damageTypeOf(key: string): DamageTypeName | undefined {
  if (key.startsWith('dano_')) {
    const t = key.slice(5) as DamageTypeName;
    return ALL_DAMAGE_TYPES.includes(t) ? t : undefined;
  }
  if (key.startsWith('Dano ')) {
    const label = key.slice(5);
    return ALL_DAMAGE_TYPES.find((t) => DAMAGE_TYPE_LABELS[t] === label);
  }
  if ((ALL_DAMAGE_TYPES as string[]).includes(key)) return key as DamageTypeName;
  return undefined;
}

export function bonusIcon(key: string): string {
  const dmg = damageTypeOf(key);
  if (dmg) return DAMAGE_TYPE_ICONS[dmg];
  return ATTRIBUTE[key] ?? CRIT[key] ?? SPEED[key] ?? RESIST[key] ?? OTHER[key] ?? '•';
}

export function bonusGroup(key: string): BonusGroup {
  if (damageTypeOf(key) || key === 'weaponDmgPct') return 'Daño';
  if (key in ATTRIBUTE) return 'Atributos';
  if (key in CRIT) return 'Crítico';
  if (key in SPEED) return 'Velocidad';
  if (key in RESIST) return 'Resistencias';
  return 'Otros';
}

const GROUP_ORDER: BonusGroup[] = ['Atributos', 'Daño', 'Crítico', 'Velocidad', 'Resistencias', 'Otros'];

/** Opciones de un selector de bonus con icono y agrupadas por tipo. */
export function bonusSelectOptions(keys: readonly string[], labelOf: (key: string) => string = (k) => k) {
  return keys
    .map((k) => ({ value: k, label: `${bonusIcon(k)}  ${labelOf(k)}`, group: bonusGroup(k) }))
    .sort((a, b) => GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group));
}
