'use client';

import { useLocalStorage } from './useLocalStorage';
import type { CharacterProfile } from '@/types/character';

const DEFAULT_CHARACTER: CharacterProfile = {
  clase: 'Guerrero',
  subclase: 'Caballero',
  stats: { STR: 84, DXT: 20, INT: 20 },
  critBase: 5.6,
  critMult: 1.5,
};

export function useCharacter() {
  const [character, setCharacter] = useLocalStorage<CharacterProfile>('regnum-character', DEFAULT_CHARACTER);

  const updateCharacter = (updates: Partial<CharacterProfile>) => {
    setCharacter((prev) => ({ ...prev, ...updates }));
  };

  return { character, updateCharacter, DEFAULT_CHARACTER };
}
