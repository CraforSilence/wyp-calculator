'use client';

import { useLocalStorage } from './useLocalStorage';
import type { CharacterProfile } from '@/types/character';
import { RACE_BASE, firstRaceFor, raceBase } from '@/data/races';

// Por defecto: los atributos iniciales de la raza, hasta que el jugador cargue los suyos
const DEFAULT_RAZA = 'Nordo' as const;
const DEFAULT_CHARACTER: CharacterProfile = {
  clase: 'Guerrero',
  subclase: 'Caballero',
  raza: DEFAULT_RAZA,
  nivel: 60,
  stats: { ...RACE_BASE[DEFAULT_RAZA].Guerrero! },
  critBase: 5.6,
  critMult: 1.5,
};

/** Personajes guardados antes de que existieran raza y nivel: se completan sin tocar sus atributos */
function migrateCharacter(raw: unknown): CharacterProfile | undefined {
  const c = raw as CharacterProfile;
  if (!c || typeof c !== 'object' || !c.stats || (c.raza && c.nivel)) return undefined;
  const raza = c.raza && raceBase(c.raza, c.clase) ? c.raza : firstRaceFor(c.clase);
  const base = raceBase(raza, c.clase);
  return {
    ...c,
    raza,
    nivel: c.nivel ?? 60,
    stats: { ...c.stats, CON: c.stats.CON ?? base?.CON, CONC: c.stats.CONC ?? base?.CONC },
  };
}

export function useCharacter() {
  const [character, setCharacter] = useLocalStorage<CharacterProfile>('regnum-character', DEFAULT_CHARACTER, { migrate: migrateCharacter });

  const updateCharacter = (updates: Partial<CharacterProfile>) => {
    setCharacter((prev) => ({ ...prev, ...updates }));
  };

  return { character, updateCharacter, DEFAULT_CHARACTER };
}
