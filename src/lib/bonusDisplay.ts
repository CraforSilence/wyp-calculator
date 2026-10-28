import { DAMAGE_TYPE_LABELS, ALL_DAMAGE_TYPES } from '@/lib/engine/constants';
import type { StatIconId } from '@/components/icons/StatIcons';
import type { DamageTypeName } from '@/types/weapon';

/**
 * Ícono y grupo de cada bonus, para que los selectores se lean de un vistazo. Las claves son
 * las de armadura y joyeria, y los nombres que usan los bonus de arma ("Fuerza", "Dano Fuego").
 */
type BonusGroup = 'Atributos' | 'Daño' | 'Crítico' | 'Velocidad' | 'Resistencias' | 'Otros';

const ATTRIBUTE: Record<string, StatIconId> = {
  fuerza: 'fuerza', STR: 'fuerza', Fuerza: 'fuerza',
  destreza: 'destreza', DXT: 'destreza', Destreza: 'destreza',
  inteligencia: 'inteligencia', INT: 'inteligencia', Inteligencia: 'inteligencia',
  constitucion: 'constitucion', CON: 'constitucion', Constitucion: 'constitucion',
  concentracion: 'concentracion', FOC: 'concentracion', Concentracion: 'concentracion',
  classAttribute: 'atributoClase', 'Atributo de clase %': 'atributoClase',
};

const CRIT: Record<string, StatIconId> = {
  critChance: 'critChance', 'Chance de critico %': 'critChance',
  'Dano critico %': 'critDmg',
};

const SPEED: Record<string, StatIconId> = {
  velocidadAtaque: 'attackSpeed', attackSpeed: 'attackSpeed', 'Vel ataque %': 'attackSpeed',
  velocidadIncantacion: 'castSpeed', castSpeed: 'castSpeed', 'Vel invocacion %': 'castSpeed',
  velocidadMovimiento: 'moveSpeed', velocidadMovimientoBZ: 'moveSpeed',
};

const RESIST: Record<string, StatIconId> = {
  resistirFisico: 'resistFisico', resistirMagico: 'resistMagico',
  resistirCortante: 'cortante', resistirPunzante: 'punzante', resistirAplastante: 'aplastante',
  resistirFuego: 'fuego', resistirHielo: 'hielo', resistirElectricidad: 'electrico',
  armaduraPct: 'armadura', bloqueo: 'bloqueo',
  reduccionMelee: 'reduccionMelee', reduccionRango: 'reduccionRango',
};

const OTHER: Record<string, StatIconId> = {
  vida: 'vida', mana: 'mana', rangoAtaque: 'rango', bonusCuracion: 'curacion', weaponDmgPct: 'weaponDmg',
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

/** Ícono de un bonus (se dibuja con <BonusIcon>). */
export function bonusIconId(key: string): StatIconId | undefined {
  return damageTypeOf(key) ?? ATTRIBUTE[key] ?? CRIT[key] ?? SPEED[key] ?? RESIST[key] ?? OTHER[key];
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

/** Opciones de un selector de bonus agrupadas por tipo (el ícono va al lado del selector). */
export function bonusSelectOptions(keys: readonly string[], labelOf: (key: string) => string = (k) => k) {
  return keys
    .map((k) => ({ value: k, label: labelOf(k), group: bonusGroup(k) }))
    .sort((a, b) => GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group));
}
