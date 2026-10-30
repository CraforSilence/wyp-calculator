'use client';

import { useCharacter } from '@/hooks/useCharacter';
import { ClassSelector } from '@/components/character/ClassSelector';
import { StatsPanel } from '@/components/character/StatsPanel';
import { CLASE_SUBCLASES } from '@/lib/engine/constants';
import { onClassChange } from '@/lib/character';
import type { Clase } from '@/types/character';
import { useT } from '@/i18n/I18nProvider';

export function BuildPersonaje() {
  const t = useT();
  const { character, updateCharacter } = useCharacter();

  const handleClaseChange = (clase: Clase) => {
    const defaultSubclase = CLASE_SUBCLASES[clase][0];
    updateCharacter({ clase, subclase: defaultSubclase, ...onClassChange(character, clase) });
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
