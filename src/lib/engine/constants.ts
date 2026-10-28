import type { Clase, Subclase, MainStat } from '@/types/character';
import type { ArmorSlot, ArmorBonusType, ProtectionQuality, ArmorPiece, ArmorRareza, ArmorFamilia } from '@/types/armor';
import type { DamageTypeName, MuescaSpeedType, MuescaType, Rareza } from '@/types/weapon';
import type { JewelryBonusType } from '@/types/jewelry';

// Multiplicador de atributo por subclase
export const ATTRIBUTE_MULTIPLIERS: Record<Subclase, number> = {
  'Bárbaro': 2.0,
  'Caballero': 1.5,
  'Tirador': 1.5,
  'Cazador': 1.0,
  'Brujo': 1.75,
  'Conjurador': 1.3,
};

// Crit base por subclase
export const CRIT_BASE: Record<Subclase, number> = {
  'Bárbaro': 5.6,
  'Caballero': 5.6,
  'Cazador': 5.6,
  'Tirador': 5.6,
  'Conjurador': 5.6,
  'Brujo': 5.6,
};

// Clase de armadura por subclase
export const ARMOR_CLASSES: Record<Subclase, number> = {
  'Bárbaro': 1.40,
  'Caballero': 1.40,
  'Cazador': 1.30,
  'Tirador': 1.35,
  'Conjurador': 1.20,
  'Brujo': 1.20,
};

// Stat principal por subclase
export const SUBCLASE_MAIN_STAT: Record<Subclase, MainStat> = {
  'Bárbaro': 'STR',
  'Caballero': 'STR',
  'Cazador': 'DXT',
  'Tirador': 'DXT',
  'Conjurador': 'INT',
  'Brujo': 'INT',
};

// Mapa clase → subclases
export const CLASE_SUBCLASES: Record<Clase, Subclase[]> = {
  'Guerrero': ['Bárbaro', 'Caballero'],
  'Arquero': ['Cazador', 'Tirador'],
  'Mago': ['Conjurador', 'Brujo'],
};

// Velocidades de ataque (segundos por golpe)
export const VELOCIDADES: Record<string, number> = {
  lenta: 2.20,
  media: 1.90,
  rapida: 1.50,
};

// Distribución de item de armadura (porcentaje como decimal)
export const ITEM_DISTRIBUTION: Record<ArmorSlot, number> = {
  pechera: 0.28,
  casco: 0.24,
  perneras: 0.20,
  hombreras: 0.16,
  guanteletes: 0.12,
  escudo: 0.25,
  brazalete: 0.20,
  tunica: 0.64, // torso + brazos + piernas (0.28 + 0.16 + 0.20)
};

// Factores de calidad de protección
export const PROTECTION_FACTORS: Record<ProtectionQuality, number> = {
  'Muy Mala': 0.2,
  'Mala': 0.35,
  'Normal': 0.5,
  'Buena': 0.65,
  'Muy Buena': 0.8,
};

// Tipos de daño físico y mágico
export const PHYSICAL_DAMAGE_TYPES: DamageTypeName[] = ['cortante', 'punzante', 'aplastante'];
export const MAGICAL_DAMAGE_TYPES: DamageTypeName[] = ['fuego', 'hielo', 'electrico'];
export const ALL_DAMAGE_TYPES: DamageTypeName[] = [...PHYSICAL_DAMAGE_TYPES, ...MAGICAL_DAMAGE_TYPES];

// Labels para UI
export const DAMAGE_TYPE_LABELS: Record<DamageTypeName, string> = {
  punzante: 'Punzante',
  aplastante: 'Aplastante',
  cortante: 'Cortante',
  electrico: 'Eléctrico',
  hielo: 'Hielo',
  fuego: 'Fuego',
};

// Muescas: tipos de velocidad (no son daño, son % de velocidad)
export const MUESCA_SPEED_TYPES: MuescaSpeedType[] = ['attackSpeed', 'castSpeed'];

// Muescas: todos los tipos seleccionables (6 daños + 2 velocidades)
export const MUESCA_TYPES: MuescaType[] = [...ALL_DAMAGE_TYPES, ...MUESCA_SPEED_TYPES];

// Slots de bonus y muescas que permite cada rareza de arma. `bonusTypes` limita los tipos
// de bonus posibles (sin definir = cualquiera): las Arcanas solo traen chance de critico.
export const RAREZA_SLOTS: Record<Rareza, { bonus: number; muescas: number; bonusTypes?: readonly string[] }> = {
  'Mágica': { bonus: 3, muescas: 1 },
  'Épica': { bonus: 4, muescas: 1 },
  'Legendaria': { bonus: 5, muescas: 1 },
  'Arcana': { bonus: 1, muescas: 2, bonusTypes: ['Chance de critico %'] },
};

export const ARMOR_RAREZAS: ArmorRareza[] = ['Mágica', 'Épica', 'Legendaria', 'Arcana', 'Artesano'];

/**
 * Bonus por pieza de armadura segun la rareza. Artesano = `null`: trae bonus fijos (los del set
 * precargado) y en el Build no se editan.
 */
export const ARMOR_RAREZA_BONUS: Record<ArmorRareza, number | null> = {
  'Mágica': 3,
  'Épica': 4,
  'Legendaria': 5,
  'Arcana': 0,
  'Artesano': null,
};

/** Rareza efectiva de una pieza: la propia, la de su set, o Legendaria para datos viejos. */
export function pieceRareza(piece: Pick<ArmorPiece, 'rareza'> | undefined, setRareza?: ArmorRareza): ArmorRareza {
  return piece?.rareza ?? setRareza ?? 'Legendaria';
}

/**
 * Mejoras de armadura (Resistir +1% / +2%) por pieza segun el set. Los magos tienen menos
 * piezas y por eso cada una lleva mas. El escudo y el brazalete no llevan mejoras.
 */
export const ARMOR_UPGRADES_POR_FAMILIA: Record<ArmorFamilia, { mago: number; resto: number }> = {
  magnanitas: { mago: 7, resto: 4 },
  champion: { mago: 5, resto: 3 },
  dragon: { mago: 4, resto: 2 },
};

/** Maximo de mejoras de una pieza. Sin familia (armadura cargada a mano) se usa el mayor de su clase. */
export function maxArmorUpgrades(familia: ArmorFamilia | undefined, clase: Clase, slot: ArmorSlot): number {
  if (!familia) return clase === 'Mago' ? 7 : 4;
  if (slot === 'escudo' || slot === 'brazalete') return 0;
  const limits = ARMOR_UPGRADES_POR_FAMILIA[familia];
  return clase === 'Mago' ? limits.mago : limits.resto;
}

/** Opciones de bonus de arma permitidas para una rareza. */
export function bonusOptionsForRareza(rareza: Rareza, all: readonly string[]): { value: string; label: string }[] {
  const allowed = RAREZA_SLOTS[rareza].bonusTypes;
  return all.filter((t) => !allowed || allowed.includes(t)).map((t) => ({ value: t, label: t }));
}

// Labels para muescas en UI
export const MUESCA_TYPE_LABELS: Record<MuescaType, string> = {
  ...DAMAGE_TYPE_LABELS,
  attackSpeed: 'Vel. Ataque %',
  castSpeed: 'Vel. Invocación %',
};

/** true si la muesca es un modificador de velocidad (no daño) */
export function isMuescaSpeedType(tipo: string): tipo is MuescaSpeedType {
  return (MUESCA_SPEED_TYPES as string[]).includes(tipo);
}

export const ARMOR_SLOT_LABELS: Record<ArmorSlot, string> = {
  pechera: 'Pechera',
  casco: 'Casco',
  perneras: 'Perneras',
  hombreras: 'Hombreras',
  guanteletes: 'Guanteletes',
  escudo: 'Escudo',
  brazalete: 'Brazalete',
  tunica: 'Túnica',
};

export const ARMOR_SLOT_LABEL_OVERRIDES: Partial<Record<Clase, Partial<Record<ArmorSlot, string>>>> = {
  'Mago': { casco: 'Sombrero', guanteletes: 'Guantes' },
};

// Slots de armadura por clase
export const ARMOR_SLOTS_POR_CLASE: Record<Clase, ArmorSlot[]> = {
  'Guerrero': ['pechera', 'casco', 'perneras', 'hombreras', 'guanteletes', 'escudo'],
  'Arquero': ['pechera', 'casco', 'perneras', 'hombreras', 'guanteletes'],
  'Mago': ['tunica', 'casco', 'guanteletes', 'brazalete'],
};

// El escudo es exclusivo del Caballero: el Bárbaro pega a dos manos
const SLOTS_SIN_ESCUDO = ARMOR_SLOTS_POR_CLASE['Guerrero'].filter((s) => s !== 'escudo');

/** Slots de armadura que puede usar cada subclase */
export const ARMOR_SLOTS_POR_SUBCLASE: Record<Subclase, ArmorSlot[]> = {
  'Caballero': ARMOR_SLOTS_POR_CLASE['Guerrero'],
  'Bárbaro': SLOTS_SIN_ESCUDO,
  'Cazador': ARMOR_SLOTS_POR_CLASE['Arquero'],
  'Tirador': ARMOR_SLOTS_POR_CLASE['Arquero'],
  'Conjurador': ARMOR_SLOTS_POR_CLASE['Mago'],
  'Brujo': ARMOR_SLOTS_POR_CLASE['Mago'],
};

/** Slots segun subclase si se conoce; si no, todos los de la clase */
export function armorSlotsFor(clase: Clase, subclase?: string | null): ArmorSlot[] {
  if (subclase && subclase in ARMOR_SLOTS_POR_SUBCLASE) return ARMOR_SLOTS_POR_SUBCLASE[subclase as Subclase];
  return ARMOR_SLOTS_POR_CLASE[clase];
}

// Subcategorías por clase
export const SUBCATEGORIAS_POR_CLASE: Record<Clase, string[]> = {
  'Guerrero': ['Lanza', 'Maza', 'Espada', 'Hacha', 'Martillo', 'Florin', 'Garrote'],
  'Arquero': ['Arco Corto', 'Arco Largo'],
  'Mago': ['Baculo'],
};

// Subcategorías por subclase (armas específicas de cada subclase)
export const SUBCATEGORIAS_POR_SUBCLASE: Record<Subclase, string[]> = {
  'Caballero': ['Lanza', 'Maza', 'Espada'],
  'Bárbaro': ['Hacha', 'Martillo', 'Florin', 'Garrote'],
  'Cazador': ['Arco Corto'],
  'Tirador': ['Arco Largo'],
  'Conjurador': ['Baculo'],
  'Brujo': ['Baculo'],
};

// Tipos de bonus de joyería disponibles
export const JEWELRY_BONUS_TYPES: JewelryBonusType[] = [
  'dano_punzante', 'dano_aplastante', 'dano_cortante',
  'dano_electrico', 'dano_hielo', 'dano_fuego',
  'vida', 'mana',
  'STR', 'DXT', 'INT', 'CON',
  'classAttribute',
  'attackSpeed', 'castSpeed',
  'weaponDmgPct',
  'critChance',
  'reduccionMelee', 'reduccionRango',
];

/** Hoy el anillo o amuleto con mas bonus tiene 4. */
export const JEWELRY_MAX_BONUSES = 4;

// Labels para bonus de joyería
export const JEWELRY_BONUS_LABELS: Record<JewelryBonusType, string> = {
  dano_punzante: 'Daño Punzante',
  dano_aplastante: 'Daño Aplastante',
  dano_cortante: 'Daño Cortante',
  dano_electrico: 'Daño Eléctrico',
  dano_hielo: 'Daño Hielo',
  dano_fuego: 'Daño Fuego',
  vida: 'Vida',
  mana: 'Mana',
  STR: 'Fuerza',
  DXT: 'Destreza',
  INT: 'Inteligencia',
  CON: 'Constitución',
  classAttribute: 'Atributo de Clase',
  attackSpeed: 'Vel. Ataque %',
  castSpeed: 'Vel. Invocación %',
  weaponDmgPct: '% Daño de Arma',
  critChance: 'Chance de Crítico %',
  reduccionMelee: 'Daño Melee recibido -%',
  reduccionRango: 'Daño Rango recibido -%',
};

// Categorías de bonus de joyería para el resumen
export const JEWELRY_BONUS_CATEGORIES: Record<string, JewelryBonusType[]> = {
  'Daño': ['dano_punzante', 'dano_aplastante', 'dano_cortante', 'dano_electrico', 'dano_hielo', 'dano_fuego'],
  'Stats': ['STR', 'DXT', 'INT', 'CON', 'classAttribute'],
  'Velocidad': ['attackSpeed', 'castSpeed'],
  'Combate': ['critChance'],
  'Defensa': ['reduccionMelee', 'reduccionRango'],
  'Otros': ['vida', 'mana', 'weaponDmgPct'],
};

// Tipos de bonus de armadura disponibles
export const ARMOR_BONUS_TYPES: ArmorBonusType[] = [
  'vida', 'mana', 'constitucion', 'fuerza',
  'concentracion', 'inteligencia', 'destreza',
  'velocidadAtaque', 'velocidadIncantacion',
  'critChance',
  'armaduraPct', 'rangoAtaque', 'velocidadMovimiento', 'velocidadMovimientoBZ', 'bonusCuracion',
  'resistirFisico', 'resistirMagico',
  'resistirFuego', 'resistirHielo', 'resistirElectricidad',
  'resistirAplastante', 'resistirCortante', 'resistirPunzante',
  'bloqueo',
];

// Bonus que solo aplican a escudos
export const SHIELD_ONLY_BONUS_TYPES: ArmorBonusType[] = ['bloqueo'];

// Labels para bonus de armadura
export const ARMOR_BONUS_LABELS: Record<ArmorBonusType, string> = {
  vida: 'Vida',
  mana: 'Mana',
  constitucion: 'Constitución',
  fuerza: 'Fuerza',
  concentracion: 'Concentración',
  inteligencia: 'Inteligencia',
  destreza: 'Destreza',
  velocidadAtaque: 'Vel. Ataque %',
  velocidadIncantacion: 'Vel. Invocación %',
  critChance: 'Chance de Crítico %',
  armaduraPct: 'Armadura %',
  rangoAtaque: 'Rango de Ataque %',
  velocidadMovimiento: 'Vel. Movimiento %',
  velocidadMovimientoBZ: 'Vel. Movimiento % (BZ)',
  bonusCuracion: 'Bonus de Curación %',
  resistirFisico: 'Res. Daño Físico %',
  resistirMagico: 'Res. Daño Mágico %',
  resistirFuego: 'Res. Fuego %',
  resistirHielo: 'Res. Hielo %',
  resistirElectricidad: 'Res. Electricidad %',
  resistirAplastante: 'Res. Aplastante %',
  resistirCortante: 'Res. Cortante %',
  resistirPunzante: 'Res. Punzante %',
  bloqueo: 'Bloqueo',
};

// Iconos por slot de armadura
export const ARMOR_SLOT_ICONS: Record<ArmorSlot, string> = {
  pechera: '/icons/pechera.svg',
  casco: '/icons/casco.svg',
  perneras: '/icons/perneras.svg',
  hombreras: '/icons/hombreras.svg',
  guanteletes: '/icons/guanteletes.svg',
  escudo: '/icons/escudo.svg',
  brazalete: '/icons/brazalete.svg',
  tunica: '/icons/tunica.svg',
};

// Iconos de joyería
export const JEWELRY_ICONS: Record<string, string> = {
  anillo1: '/icons/anillo.svg',
  anillo2: '/icons/anillo.svg',
  amuleto: '/icons/amuleto.svg',
};

// Mapa subcategoría → categoría para cálculos de habilidades
export const SUBCATEGORIA_TO_CATEGORIA: Record<string, string> = {
  'Lanza': 'lanza',
  'Maza': 'maza',
  'Espada': 'espada',
  'Hacha': 'hacha',
  'Martillo': 'martillo',
  'Florin': 'florin',
  'Garrote': 'garrote',
  'Arco Corto': 'arco_corto',
  'Arco Largo': 'arco_largo',
  'Baculo': 'baculo',
};
