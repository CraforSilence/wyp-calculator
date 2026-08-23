'use client';

import { useCharacter } from '@/hooks/useCharacter';
import { ClassSelector } from '@/components/character/ClassSelector';
import { StatsPanel } from '@/components/character/StatsPanel';
import { CLASE_SUBCLASES } from '@/lib/engine/constants';
import type { Clase } from '@/types/character';

export function BuildPersonaje() {
  const { character, updateCharacter } = useCharacter();

  const handleClaseChange = (clase: Clase) => {
    const defaultSubclase = CLASE_SUBCLASES[clase][0];
    updateCharacter({ clase, subclase: defaultSubclase });
  };

  return (
    <div className="space-y-6">
      <ClassSelector
        selectedClase={character.clase}
        selectedSubclase={character.subclase}
        onSelectClase={handleClaseChange}
        onSelectSubclase={(sub) => updateCharacter({ subclase: sub })}
      />
      <StatsPanel character={character} onUpdate={updateCharacter} />
    </div>
  );
}
