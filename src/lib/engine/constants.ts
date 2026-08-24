import type { Clase, Subclase, MainStat } from '@/types/character';
import type { ArmorSlot, ArmorBonusType, ProtectionQuality } from '@/types/armor';
import type { DamageTypeName } from '@/types/weapon';
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
export const PHYSICAL_DAMAGE_TYPES: DamageTypeName[] = ['punzante', 'aplastante', 'cortante'];
export const MAGICAL_DAMAGE_TYPES: DamageTypeName[] = ['electrico', 'hielo', 'fuego'];
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

// Slots de armadura por clase
export const ARMOR_SLOTS_POR_CLASE: Record<Clase, ArmorSlot[]> = {
  'Guerrero': ['pechera', 'casco', 'perneras', 'hombreras', 'guanteletes', 'escudo'],
  'Arquero': ['pechera', 'casco', 'perneras', 'hombreras', 'guanteletes'],
  'Mago': ['tunica', 'casco', 'brazalete'],
};

// Subcategorías por clase
export const SUBCATEGORIAS_POR_CLASE: Record<Clase, string[]> = {
  'Guerrero': ['Lanza', 'Maza', 'Espada', 'Hacha', 'Martillo', 'Florin', 'Garrote'],
  'Arquero': ['Arco Corto', 'Arco Largo'],
  'Mago': ['Baculo'],
};

// Tipos de bonus de joyería disponibles
export const JEWELRY_BONUS_TYPES: JewelryBonusType[] = [
  'dano_punzante', 'dano_aplastante', 'dano_cortante',
  'dano_electrico', 'dano_hielo', 'dano_fuego',
  'vida', 'mana',
  'STR', 'DXT', 'INT', 'CON',
  'attackSpeed', 'castSpeed',
  'weaponDmgPct',
  'critChance',
];

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
  attackSpeed: 'Vel. Ataque %',
  castSpeed: 'Vel. Invocación %',
  weaponDmgPct: '% Daño de Arma',
  critChance: 'Chance de Crítico %',
};

// Categorías de bonus de joyería para el resumen
export const JEWELRY_BONUS_CATEGORIES: Record<string, JewelryBonusType[]> = {
  'Daño': ['dano_punzante', 'dano_aplastante', 'dano_cortante', 'dano_electrico', 'dano_hielo', 'dano_fuego'],
  'Stats': ['STR', 'DXT', 'INT', 'CON'],
  'Velocidad': ['attackSpeed', 'castSpeed'],
  'Combate': ['critChance'],
  'Otros': ['vida', 'mana', 'weaponDmgPct'],
};

// Tipos de bonus de armadura disponibles
export const ARMOR_BONUS_TYPES: ArmorBonusType[] = [
  'vida', 'mana', 'constitucion', 'fuerza',
  'velocidadAtaque', 'velocidadIncantacion',
  'armaduraPct',
];

// Labels para bonus de armadura
export const ARMOR_BONUS_LABELS: Record<ArmorBonusType, string> = {
  vida: 'Vida',
  mana: 'Mana',
  constitucion: 'Constitución',
  fuerza: 'Fuerza',
  velocidadAtaque: 'Vel. Ataque %',
  velocidadIncantacion: 'Vel. Invocación %',
  armaduraPct: 'Armadura %',
};

// Iconos por slot de armadura
export const ARMOR_SLOT_ICONS: Record<ArmorSlot, string> = {
  pechera: '/icons/pechera.png',
  casco: '/icons/casco.png',
  perneras: '/icons/perneras.png',
  hombreras: '/icons/hombreras.png',
  guanteletes: '/icons/guanteletes.png',
  escudo: '/icons/escudo.png',
  brazalete: '/icons/escudo.png',
  tunica: '/icons/pechera.png',
};

// Iconos de joyería
export const JEWELRY_ICONS: Record<string, string> = {
  anillo1: '/icons/anillo.png',
  anillo2: '/icons/anillo.png',
  amuleto: '/icons/amuleto.png',
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
