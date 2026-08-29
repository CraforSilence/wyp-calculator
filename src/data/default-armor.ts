import type { DefaultArmorSet } from '@/types/armor';

const MAGNANTIAS_CABALLERO_PF = {
  cortante: 'Mala' as const,
  punzante: 'Mala' as const,
  aplastante: 'Mala' as const,
  fuego: 'Buena' as const,
  hielo: 'Buena' as const,
  electrico: 'Buena' as const,
};

const MAGNANTIAS_BARBARO_PF = {
  cortante: 'Mala' as const,
  punzante: 'Mala' as const,
  aplastante: 'Mala' as const,
  fuego: 'Buena' as const,
  hielo: 'Buena' as const,
  electrico: 'Buena' as const,
};

const MAGNANTIAS_TIRADOR_PF = {
  cortante: 'Normal' as const,
  punzante: 'Mala' as const,
  aplastante: 'Normal' as const,
  fuego: 'Buena' as const,
  hielo: 'Buena' as const,
  electrico: 'Mala' as const,
};

const MAGNANTIAS_CAZADOR_PF = {
  cortante: 'Normal' as const,
  punzante: 'Mala' as const,
  aplastante: 'Normal' as const,
  fuego: 'Buena' as const,
  hielo: 'Buena' as const,
  electrico: 'Mala' as const,
};

const MAGNANTIAS_BRUJO_PF = {
  cortante: 'Buena' as const,
  punzante: 'Buena' as const,
  aplastante: 'Buena' as const,
  fuego: 'Mala' as const,
  hielo: 'Mala' as const,
  electrico: 'Mala' as const,
};

const MAGNANTIAS_CONJURADOR_PF = {
  cortante: 'Buena' as const,
  punzante: 'Buena' as const,
  aplastante: 'Buena' as const,
  fuego: 'Mala' as const,
  hielo: 'Mala' as const,
  electrico: 'Mala' as const,
};

export const DEFAULT_ARMOR_SETS: DefaultArmorSet[] = [
  {
    id: 'magnantias-caballero',
    nombre: 'Set de Magnanitas de Caballero',
    clase: 'Guerrero',
    subclase: 'Caballero',
    pieces: {
      pechera: {
        slot: 'pechera',
        pba: 255, bcmt: 17,
        protectionFactors: { ...MAGNANTIAS_CABALLERO_PF },
        bonusProteccionPct: {},
        bonuses: [],
        upgrades: [],
      },
      casco: {
        slot: 'casco',
        pba: 255, bcmt: 17,
        protectionFactors: { ...MAGNANTIAS_CABALLERO_PF },
        bonusProteccionPct: {},
        bonuses: [],
        upgrades: [],
      },
      perneras: {
        slot: 'perneras',
        pba: 255, bcmt: 17,
        protectionFactors: { ...MAGNANTIAS_CABALLERO_PF },
        bonusProteccionPct: {},
        bonuses: [],
        upgrades: [],
      },
      hombreras: {
        slot: 'hombreras',
        pba: 255, bcmt: 17,
        protectionFactors: { ...MAGNANTIAS_CABALLERO_PF },
        bonusProteccionPct: {},
        bonuses: [],
        upgrades: [],
      },
      guanteletes: {
        slot: 'guanteletes',
        pba: 255, bcmt: 17,
        protectionFactors: { ...MAGNANTIAS_CABALLERO_PF },
        bonusProteccionPct: {},
        bonuses: [],
        upgrades: [],
      },
      escudo: {
        slot: 'escudo',
        pba: 255, bcmt: 17,
        protectionFactors: { ...MAGNANTIAS_CABALLERO_PF },
        bonusProteccionPct: {},
        bonuses: [],
        upgrades: [],
      },
    },
    bonusConjunto: [
      { type: 'armaduraPct', value: 10 },
      { type: 'constitucion', value: 10 },
    ],
  },
  {
    id: 'magnantias-barbaro',
    nombre: 'Set de Magnanitas de Bárbaro',
    clase: 'Guerrero',
    subclase: 'Bárbaro',
    pieces: {
      pechera: { slot: 'pechera', pba: 255, bcmt: 17, protectionFactors: { ...MAGNANTIAS_BARBARO_PF }, bonusProteccionPct: {}, bonuses: [], upgrades: [] },
      casco: { slot: 'casco', pba: 255, bcmt: 17, protectionFactors: { ...MAGNANTIAS_BARBARO_PF }, bonusProteccionPct: {}, bonuses: [], upgrades: [] },
      perneras: { slot: 'perneras', pba: 255, bcmt: 17, protectionFactors: { ...MAGNANTIAS_BARBARO_PF }, bonusProteccionPct: {}, bonuses: [], upgrades: [] },
      hombreras: { slot: 'hombreras', pba: 255, bcmt: 17, protectionFactors: { ...MAGNANTIAS_BARBARO_PF }, bonusProteccionPct: {}, bonuses: [], upgrades: [] },
      guanteletes: { slot: 'guanteletes', pba: 255, bcmt: 17, protectionFactors: { ...MAGNANTIAS_BARBARO_PF }, bonusProteccionPct: {}, bonuses: [], upgrades: [] },
      escudo: { slot: 'escudo', pba: 255, bcmt: 17, protectionFactors: { ...MAGNANTIAS_BARBARO_PF }, bonusProteccionPct: {}, bonuses: [], upgrades: [] },
    },
    bonusConjunto: [
      { type: 'critChance', value: 10 },
      { type: 'fuerza', value: 10 },
    ],
  },
  {
    id: 'magnantias-tirador',
    nombre: 'Set de Magnanitas de Tirador',
    clase: 'Arquero',
    subclase: 'Tirador',
    pieces: {
      pechera: { slot: 'pechera', pba: 255, bcmt: 17, protectionFactors: { ...MAGNANTIAS_TIRADOR_PF }, bonusProteccionPct: {}, bonuses: [], upgrades: [] },
      casco: { slot: 'casco', pba: 255, bcmt: 17, protectionFactors: { ...MAGNANTIAS_TIRADOR_PF }, bonusProteccionPct: {}, bonuses: [], upgrades: [] },
      perneras: { slot: 'perneras', pba: 255, bcmt: 17, protectionFactors: { ...MAGNANTIAS_TIRADOR_PF }, bonusProteccionPct: {}, bonuses: [], upgrades: [] },
      hombreras: { slot: 'hombreras', pba: 255, bcmt: 17, protectionFactors: { ...MAGNANTIAS_TIRADOR_PF }, bonusProteccionPct: {}, bonuses: [], upgrades: [] },
      guanteletes: { slot: 'guanteletes', pba: 255, bcmt: 17, protectionFactors: { ...MAGNANTIAS_TIRADOR_PF }, bonusProteccionPct: {}, bonuses: [], upgrades: [] },
    },
    bonusConjunto: [
      { type: 'rangoAtaque', value: 10 },
      { type: 'destreza', value: 12 },
    ],
  },
  {
    id: 'magnantias-cazador',
    nombre: 'Set de Magnanitas de Cazador',
    clase: 'Arquero',
    subclase: 'Cazador',
    pieces: {
      pechera: { slot: 'pechera', pba: 255, bcmt: 17, protectionFactors: { ...MAGNANTIAS_CAZADOR_PF }, bonusProteccionPct: {}, bonuses: [], upgrades: [] },
      casco: { slot: 'casco', pba: 255, bcmt: 17, protectionFactors: { ...MAGNANTIAS_CAZADOR_PF }, bonusProteccionPct: {}, bonuses: [], upgrades: [] },
      perneras: { slot: 'perneras', pba: 255, bcmt: 17, protectionFactors: { ...MAGNANTIAS_CAZADOR_PF }, bonusProteccionPct: {}, bonuses: [], upgrades: [] },
      hombreras: { slot: 'hombreras', pba: 255, bcmt: 17, protectionFactors: { ...MAGNANTIAS_CAZADOR_PF }, bonusProteccionPct: {}, bonuses: [], upgrades: [] },
      guanteletes: { slot: 'guanteletes', pba: 255, bcmt: 17, protectionFactors: { ...MAGNANTIAS_CAZADOR_PF }, bonusProteccionPct: {}, bonuses: [], upgrades: [] },
    },
    bonusConjunto: [
      { type: 'rangoAtaque', value: 12 },
      { type: 'destreza', value: 10 },
    ],
  },
  {
    id: 'magnantias-brujo',
    nombre: 'Set de Magnanitas de Brujo',
    clase: 'Mago',
    subclase: 'Brujo',
    pieces: {
      tunica: { slot: 'tunica', pba: 255, bcmt: 17, protectionFactors: { ...MAGNANTIAS_BRUJO_PF }, bonusProteccionPct: {}, bonuses: [], upgrades: [] },
      casco: { slot: 'casco', pba: 255, bcmt: 17, protectionFactors: { ...MAGNANTIAS_BRUJO_PF }, bonusProteccionPct: {}, bonuses: [], upgrades: [] },
      guanteletes: { slot: 'guanteletes', pba: 255, bcmt: 17, protectionFactors: { ...MAGNANTIAS_BRUJO_PF }, bonusProteccionPct: {}, bonuses: [], upgrades: [] },
      brazalete: { slot: 'brazalete', pba: 255, bcmt: 17, protectionFactors: { ...MAGNANTIAS_BRUJO_PF }, bonusProteccionPct: {}, bonuses: [], upgrades: [] },
    },
    bonusConjunto: [
      { type: 'velocidadIncantacion', value: 15 },
      { type: 'inteligencia', value: 10 },
    ],
  },
  {
    id: 'magnantias-conjurador',
    nombre: 'Set de Magnanitas de Conjurador',
    clase: 'Mago',
    subclase: 'Conjurador',
    pieces: {
      tunica: { slot: 'tunica', pba: 255, bcmt: 17, protectionFactors: { ...MAGNANTIAS_CONJURADOR_PF }, bonusProteccionPct: {}, bonuses: [], upgrades: [] },
      casco: { slot: 'casco', pba: 255, bcmt: 17, protectionFactors: { ...MAGNANTIAS_CONJURADOR_PF }, bonusProteccionPct: {}, bonuses: [], upgrades: [] },
      guanteletes: { slot: 'guanteletes', pba: 255, bcmt: 17, protectionFactors: { ...MAGNANTIAS_CONJURADOR_PF }, bonusProteccionPct: {}, bonuses: [], upgrades: [] },
      brazalete: { slot: 'brazalete', pba: 255, bcmt: 17, protectionFactors: { ...MAGNANTIAS_CONJURADOR_PF }, bonusProteccionPct: {}, bonuses: [], upgrades: [] },
    },
    bonusConjunto: [
      { type: 'velocidadIncantacion', value: 10 },
      { type: 'inteligencia', value: 15 },
    ],
  },
  {
    id: 'champion-caballero',
    nombre: 'Set Champion de Caballero',
    clase: 'Guerrero',
    subclase: 'Caballero',
    pieces: {
      pechera: { slot: 'pechera', pba: 250, bcmt: 9, protectionFactors: { cortante: 'Normal', punzante: 'Normal', aplastante: 'Normal', fuego: 'Normal', hielo: 'Normal', electrico: 'Normal' }, bonusProteccionPct: {}, bonuses: [{ type: 'constitucion', value: 5 }], upgrades: [] },
      casco: { slot: 'casco', pba: 250, bcmt: 9, protectionFactors: { cortante: 'Normal', punzante: 'Normal', aplastante: 'Normal', fuego: 'Normal', hielo: 'Normal', electrico: 'Normal' }, bonusProteccionPct: {}, bonuses: [{ type: 'mana', value: 150 }], upgrades: [] },
      perneras: { slot: 'perneras', pba: 250, bcmt: 9, protectionFactors: { cortante: 'Normal', punzante: 'Normal', aplastante: 'Normal', fuego: 'Normal', hielo: 'Normal', electrico: 'Normal' }, bonusProteccionPct: {}, bonuses: [{ type: 'velocidadMovimiento', value: 5 }], upgrades: [] },
      hombreras: { slot: 'hombreras', pba: 250, bcmt: 9, protectionFactors: { cortante: 'Normal', punzante: 'Normal', aplastante: 'Normal', fuego: 'Normal', hielo: 'Normal', electrico: 'Normal' }, bonusProteccionPct: {}, bonuses: [{ type: 'constitucion', value: 5 }], upgrades: [] },
      guanteletes: { slot: 'guanteletes', pba: 250, bcmt: 9, protectionFactors: { cortante: 'Normal', punzante: 'Normal', aplastante: 'Normal', fuego: 'Normal', hielo: 'Normal', electrico: 'Normal' }, bonusProteccionPct: {}, bonuses: [{ type: 'critChance', value: 15 }], upgrades: [] },
      escudo: { slot: 'escudo', pba: 250, bcmt: 9, protectionFactors: { cortante: 'Normal', punzante: 'Normal', aplastante: 'Normal', fuego: 'Normal', hielo: 'Normal', electrico: 'Normal' }, bonusProteccionPct: {}, bonuses: [{ type: 'bloqueo', value: 15 }, { type: 'constitucion', value: 5 }], upgrades: [] },
    },
    bonusConjunto: [
      { type: 'constitucion', value: 10 },
      { type: 'velocidadMovimientoBZ', value: 10 },
    ],
  },
  {
    id: 'champion-barbaro',
    nombre: 'Set Champion de Bárbaro',
    clase: 'Guerrero',
    subclase: 'Bárbaro',
    pieces: {
      pechera: { slot: 'pechera', pba: 250, bcmt: 9, protectionFactors: { cortante: 'Normal', punzante: 'Normal', aplastante: 'Normal', fuego: 'Normal', hielo: 'Normal', electrico: 'Normal' }, bonusProteccionPct: {}, bonuses: [{ type: 'constitucion', value: 5 }], upgrades: [] },
      casco: { slot: 'casco', pba: 250, bcmt: 9, protectionFactors: { cortante: 'Normal', punzante: 'Normal', aplastante: 'Normal', fuego: 'Normal', hielo: 'Normal', electrico: 'Normal' }, bonusProteccionPct: {}, bonuses: [{ type: 'mana', value: 150 }], upgrades: [] },
      perneras: { slot: 'perneras', pba: 250, bcmt: 9, protectionFactors: { cortante: 'Normal', punzante: 'Normal', aplastante: 'Normal', fuego: 'Normal', hielo: 'Normal', electrico: 'Normal' }, bonusProteccionPct: {}, bonuses: [{ type: 'velocidadAtaque', value: 10 }], upgrades: [] },
      hombreras: { slot: 'hombreras', pba: 250, bcmt: 9, protectionFactors: { cortante: 'Normal', punzante: 'Normal', aplastante: 'Normal', fuego: 'Normal', hielo: 'Normal', electrico: 'Normal' }, bonusProteccionPct: {}, bonuses: [{ type: 'fuerza', value: 5 }], upgrades: [] },
      guanteletes: { slot: 'guanteletes', pba: 250, bcmt: 9, protectionFactors: { cortante: 'Normal', punzante: 'Normal', aplastante: 'Normal', fuego: 'Normal', hielo: 'Normal', electrico: 'Normal' }, bonusProteccionPct: {}, bonuses: [{ type: 'critChance', value: 15 }], upgrades: [] },
    },
    bonusConjunto: [
      { type: 'fuerza', value: 10 },
      { type: 'velocidadMovimientoBZ', value: 10 },
    ],
  },
  {
    id: 'champion-conjurador',
    nombre: 'Set Champion de Conjurador',
    clase: 'Mago',
    subclase: 'Conjurador',
    pieces: {
      tunica: { slot: 'tunica', pba: 250, bcmt: 7, protectionFactors: { cortante: 'Normal', punzante: 'Normal', aplastante: 'Normal', fuego: 'Normal', hielo: 'Normal', electrico: 'Normal' }, bonusProteccionPct: {}, bonuses: [{ type: 'constitucion', value: 7 }], upgrades: [] },
      casco: { slot: 'casco', pba: 250, bcmt: 7, protectionFactors: { cortante: 'Normal', punzante: 'Normal', aplastante: 'Normal', fuego: 'Normal', hielo: 'Normal', electrico: 'Normal' }, bonusProteccionPct: {}, bonuses: [], upgrades: [] },
      guanteletes: { slot: 'guanteletes', pba: 250, bcmt: 7, protectionFactors: { cortante: 'Normal', punzante: 'Normal', aplastante: 'Normal', fuego: 'Normal', hielo: 'Normal', electrico: 'Normal' }, bonusProteccionPct: {}, bonuses: [{ type: 'velocidadIncantacion', value: 10 }], upgrades: [] },
      brazalete: { slot: 'brazalete', pba: 250, bcmt: 7, protectionFactors: { cortante: 'Normal', punzante: 'Normal', aplastante: 'Normal', fuego: 'Normal', hielo: 'Normal', electrico: 'Normal' }, bonusProteccionPct: {}, bonuses: [{ type: 'mana', value: 150 }], upgrades: [] },
    },
    bonusConjunto: [
      { type: 'inteligencia', value: 10 },
      { type: 'velocidadMovimientoBZ', value: 10 },
    ],
  },
  {
    id: 'champion-brujo',
    nombre: 'Set Champion de Brujo',
    clase: 'Mago',
    subclase: 'Brujo',
    pieces: {
      tunica: { slot: 'tunica', pba: 250, bcmt: 7, protectionFactors: { cortante: 'Normal', punzante: 'Normal', aplastante: 'Normal', fuego: 'Normal', hielo: 'Normal', electrico: 'Normal' }, bonusProteccionPct: {}, bonuses: [{ type: 'constitucion', value: 10 }], upgrades: [] },
      casco: { slot: 'casco', pba: 250, bcmt: 9, protectionFactors: { cortante: 'Normal', punzante: 'Normal', aplastante: 'Normal', fuego: 'Normal', hielo: 'Normal', electrico: 'Normal' }, bonusProteccionPct: {}, bonuses: [], upgrades: [] },
      guanteletes: { slot: 'guanteletes', pba: 250, bcmt: 7, protectionFactors: { cortante: 'Normal', punzante: 'Normal', aplastante: 'Normal', fuego: 'Normal', hielo: 'Normal', electrico: 'Normal' }, bonusProteccionPct: {}, bonuses: [{ type: 'velocidadIncantacion', value: 7 }], upgrades: [] },
      brazalete: { slot: 'brazalete', pba: 250, bcmt: 7, protectionFactors: { cortante: 'Normal', punzante: 'Normal', aplastante: 'Normal', fuego: 'Normal', hielo: 'Normal', electrico: 'Normal' }, bonusProteccionPct: {}, bonuses: [{ type: 'mana', value: 150 }], upgrades: [] },
    },
    bonusConjunto: [
      { type: 'inteligencia', value: 10 },
      { type: 'velocidadMovimientoBZ', value: 10 },
    ],
  },
  {
    id: 'champion-cazador',
    nombre: 'Set Champion de Cazador',
    clase: 'Arquero',
    subclase: 'Cazador',
    pieces: {
      pechera: { slot: 'pechera', pba: 250, bcmt: 9, protectionFactors: { cortante: 'Normal', punzante: 'Normal', aplastante: 'Normal', fuego: 'Normal', hielo: 'Normal', electrico: 'Normal' }, bonusProteccionPct: {}, bonuses: [{ type: 'constitucion', value: 5 }], upgrades: [] },
      casco: { slot: 'casco', pba: 250, bcmt: 9, protectionFactors: { cortante: 'Normal', punzante: 'Normal', aplastante: 'Normal', fuego: 'Normal', hielo: 'Normal', electrico: 'Normal' }, bonusProteccionPct: {}, bonuses: [{ type: 'mana', value: 150 }], upgrades: [] },
      perneras: { slot: 'perneras', pba: 250, bcmt: 9, protectionFactors: { cortante: 'Normal', punzante: 'Normal', aplastante: 'Normal', fuego: 'Normal', hielo: 'Normal', electrico: 'Normal' }, bonusProteccionPct: {}, bonuses: [{ type: 'velocidadIncantacion', value: 5 }], upgrades: [] },
      hombreras: { slot: 'hombreras', pba: 250, bcmt: 9, protectionFactors: { cortante: 'Normal', punzante: 'Normal', aplastante: 'Normal', fuego: 'Normal', hielo: 'Normal', electrico: 'Normal' }, bonusProteccionPct: {}, bonuses: [{ type: 'constitucion', value: 5 }], upgrades: [] },
      guanteletes: { slot: 'guanteletes', pba: 250, bcmt: 9, protectionFactors: { cortante: 'Normal', punzante: 'Normal', aplastante: 'Normal', fuego: 'Normal', hielo: 'Normal', electrico: 'Normal' }, bonusProteccionPct: {}, bonuses: [{ type: 'velocidadAtaque', value: 7 }], upgrades: [] },
    },
    bonusConjunto: [
      { type: 'destreza', value: 10 },
      { type: 'velocidadMovimientoBZ', value: 10 },
    ],
  },
  {
    id: 'champion-tirador',
    nombre: 'Set Champion de Tirador',
    clase: 'Arquero',
    subclase: 'Tirador',
    pieces: {
      pechera: { slot: 'pechera', pba: 250, bcmt: 9, protectionFactors: { cortante: 'Normal', punzante: 'Normal', aplastante: 'Normal', fuego: 'Normal', hielo: 'Normal', electrico: 'Normal' }, bonusProteccionPct: {}, bonuses: [{ type: 'constitucion', value: 5 }], upgrades: [] },
      casco: { slot: 'casco', pba: 250, bcmt: 9, protectionFactors: { cortante: 'Normal', punzante: 'Normal', aplastante: 'Normal', fuego: 'Normal', hielo: 'Normal', electrico: 'Normal' }, bonusProteccionPct: {}, bonuses: [{ type: 'mana', value: 200 }], upgrades: [] },
      perneras: { slot: 'perneras', pba: 250, bcmt: 9, protectionFactors: { cortante: 'Normal', punzante: 'Normal', aplastante: 'Normal', fuego: 'Normal', hielo: 'Normal', electrico: 'Normal' }, bonusProteccionPct: {}, bonuses: [{ type: 'destreza', value: 10 }], upgrades: [] },
      hombreras: { slot: 'hombreras', pba: 250, bcmt: 9, protectionFactors: { cortante: 'Normal', punzante: 'Normal', aplastante: 'Normal', fuego: 'Normal', hielo: 'Normal', electrico: 'Normal' }, bonusProteccionPct: {}, bonuses: [{ type: 'constitucion', value: 5 }], upgrades: [] },
      guanteletes: { slot: 'guanteletes', pba: 250, bcmt: 9, protectionFactors: { cortante: 'Normal', punzante: 'Normal', aplastante: 'Normal', fuego: 'Normal', hielo: 'Normal', electrico: 'Normal' }, bonusProteccionPct: {}, bonuses: [{ type: 'critChance', value: 15 }], upgrades: [] },
    },
    bonusConjunto: [
      { type: 'destreza', value: 10 },
      { type: 'velocidadMovimientoBZ', value: 10 },
    ],
  },
  {
    id: 'dragon-guerrero',
    nombre: 'Set Dragon de Guerrero (Alasthor/Tenax/Vesper)',
    clase: 'Guerrero',
    pieces: {
      pechera: {
        slot: 'pechera',
        pba: 220, bcmt: 9,
        protectionFactors: { cortante: 'Normal', punzante: 'Normal', aplastante: 'Normal', fuego: 'Normal', hielo: 'Normal', electrico: 'Normal' },
        bonusProteccionPct: {},
        bonuses: [],
        upgrades: [],
      },
      casco: {
        slot: 'casco',
        pba: 220, bcmt: 9,
        protectionFactors: { cortante: 'Normal', punzante: 'Normal', aplastante: 'Normal', fuego: 'Normal', hielo: 'Normal', electrico: 'Normal' },
        bonusProteccionPct: {},
        bonuses: [],
        upgrades: [],
      },
      perneras: {
        slot: 'perneras',
        pba: 220, bcmt: 9,
        protectionFactors: { cortante: 'Normal', punzante: 'Normal', aplastante: 'Normal', fuego: 'Normal', hielo: 'Normal', electrico: 'Normal' },
        bonusProteccionPct: {},
        bonuses: [],
        upgrades: [],
      },
      hombreras: {
        slot: 'hombreras',
        pba: 220, bcmt: 9,
        protectionFactors: { cortante: 'Normal', punzante: 'Normal', aplastante: 'Normal', fuego: 'Normal', hielo: 'Normal', electrico: 'Normal' },
        bonusProteccionPct: {},
        bonuses: [],
        upgrades: [],
      },
      guanteletes: {
        slot: 'guanteletes',
        pba: 220, bcmt: 9,
        protectionFactors: { cortante: 'Normal', punzante: 'Normal', aplastante: 'Normal', fuego: 'Normal', hielo: 'Normal', electrico: 'Normal' },
        bonusProteccionPct: {},
        bonuses: [],
        upgrades: [],
      },
      escudo: {
        slot: 'escudo',
        pba: 220, bcmt: 9,
        protectionFactors: { cortante: 'Normal', punzante: 'Normal', aplastante: 'Normal', fuego: 'Normal', hielo: 'Normal', electrico: 'Normal' },
        bonusProteccionPct: {},
        bonuses: [],
        upgrades: [],
      },
    },
    bonusConjunto: [],
    bonusConjuntoPorSubclase: {
      Caballero: [
        { type: 'vida', value: 150 },
        { type: 'resistirFisico', value: 15 },
        { type: 'constitucion', value: 7 },
      ],
      Bárbaro: [
        { type: 'vida', value: 150 },
        { type: 'critChance', value: 20 },
        { type: 'fuerza', value: 7 },
      ],
    },
  },
  {
    id: 'dragon-arquero',
    nombre: 'Set Dragon de Arquero (Alasthor/Tenax/Vesper)',
    clase: 'Arquero',
    pieces: {
      pechera: { slot: 'pechera', pba: 220, bcmt: 7, protectionFactors: { cortante: 'Normal', punzante: 'Normal', aplastante: 'Normal', fuego: 'Normal', hielo: 'Normal', electrico: 'Normal' }, bonusProteccionPct: {}, bonuses: [], upgrades: [] },
      casco: { slot: 'casco', pba: 220, bcmt: 7, protectionFactors: { cortante: 'Normal', punzante: 'Normal', aplastante: 'Normal', fuego: 'Normal', hielo: 'Normal', electrico: 'Normal' }, bonusProteccionPct: {}, bonuses: [], upgrades: [] },
      perneras: { slot: 'perneras', pba: 220, bcmt: 7, protectionFactors: { cortante: 'Normal', punzante: 'Normal', aplastante: 'Normal', fuego: 'Normal', hielo: 'Normal', electrico: 'Normal' }, bonusProteccionPct: {}, bonuses: [], upgrades: [] },
      hombreras: { slot: 'hombreras', pba: 220, bcmt: 7, protectionFactors: { cortante: 'Normal', punzante: 'Normal', aplastante: 'Normal', fuego: 'Normal', hielo: 'Normal', electrico: 'Normal' }, bonusProteccionPct: {}, bonuses: [], upgrades: [] },
      guanteletes: { slot: 'guanteletes', pba: 220, bcmt: 7, protectionFactors: { cortante: 'Normal', punzante: 'Normal', aplastante: 'Normal', fuego: 'Normal', hielo: 'Normal', electrico: 'Normal' }, bonusProteccionPct: {}, bonuses: [], upgrades: [] },
    },
    bonusConjunto: [],
    bonusConjuntoPorSubclase: {
      Cazador: [
        { type: 'mana', value: 200 },
        { type: 'velocidadAtaque', value: 10 },
        { type: 'velocidadMovimiento', value: 5 },
      ],
      Tirador: [
        { type: 'mana', value: 150 },
        { type: 'concentracion', value: 10 },
        { type: 'destreza', value: 7 },
      ],
    },
  },
  {
    id: 'dragon-mago',
    nombre: 'Set Dragon de Mago (Alasthor/Tenax/Vesper)',
    clase: 'Mago',
    pieces: {
      tunica: { slot: 'tunica', pba: 220, bcmt: 7, protectionFactors: { cortante: 'Normal', punzante: 'Normal', aplastante: 'Normal', fuego: 'Normal', hielo: 'Normal', electrico: 'Normal' }, bonusProteccionPct: {}, bonuses: [], upgrades: [] },
      casco: { slot: 'casco', pba: 220, bcmt: 7, protectionFactors: { cortante: 'Normal', punzante: 'Normal', aplastante: 'Normal', fuego: 'Normal', hielo: 'Normal', electrico: 'Normal' }, bonusProteccionPct: {}, bonuses: [], upgrades: [] },
      guanteletes: { slot: 'guanteletes', pba: 220, bcmt: 7, protectionFactors: { cortante: 'Normal', punzante: 'Normal', aplastante: 'Normal', fuego: 'Normal', hielo: 'Normal', electrico: 'Normal' }, bonusProteccionPct: {}, bonuses: [], upgrades: [] },
      brazalete: { slot: 'brazalete', pba: 220, bcmt: 7, protectionFactors: { cortante: 'Normal', punzante: 'Normal', aplastante: 'Normal', fuego: 'Normal', hielo: 'Normal', electrico: 'Normal' }, bonusProteccionPct: {}, bonuses: [], upgrades: [] },
    },
    bonusConjunto: [],
    bonusConjuntoPorSubclase: {
      Conjurador: [
        { type: 'mana', value: 300 },
        { type: 'velocidadIncantacion', value: 15 },
        { type: 'bonusCuracion', value: 10 },
      ],
      Brujo: [
        { type: 'mana', value: 300 },
        { type: 'velocidadIncantacion', value: 15 },
        { type: 'inteligencia', value: 7 },
      ],
    },
  },
];
