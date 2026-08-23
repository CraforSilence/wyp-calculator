'use client';

import type { Clase, Subclase } from '@/types/character';
import { CLASE_SUBCLASES } from '@/lib/engine/constants';

interface ClassSelectorProps {
  selectedClase: Clase;
  selectedSubclase: Subclase;
  onSelectClase: (clase: Clase) => void;
  onSelectSubclase: (subclase: Subclase) => void;
}

const CLASE_INFO: Record<Clase, { icon: string; stat: string; color: string }> = {
  Guerrero: { icon: '\u2694\uFE0F', stat: 'STR', color: 'border-red-500 bg-red-950/30' },
  Arquero: { icon: '\uD83C\uDFF9', stat: 'DXT', color: 'border-green-500 bg-green-950/30' },
  Mago: { icon: '\uD83D\uDD2E', stat: 'INT', color: 'border-blue-500 bg-blue-950/30' },
};

export function ClassSelector({ selectedClase, selectedSubclase, onSelectClase, onSelectSubclase }: ClassSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {(Object.keys(CLASE_INFO) as Clase[]).map((clase) => {
          const info = CLASE_INFO[clase];
          const active = selectedClase === clase;
          return (
            <button
              key={clase}
              onClick={() => {
                onSelectClase(clase);
                onSelectSubclase(CLASE_SUBCLASES[clase][0]);
              }}
              className={`p-4 rounded-lg border-2 transition-all text-center cursor-pointer ${
                active
                  ? `${info.color} shadow-lg`
                  : 'border-zinc-700 bg-zinc-900 hover:border-zinc-600'
              }`}
            >
              <div className="text-3xl mb-1">{info.icon}</div>
              <div className="text-sm font-semibold">{clase}</div>
              <div className="text-xs text-zinc-400">{info.stat}</div>
            </button>
          );
        })}
      </div>

      <div className="flex gap-2">
        {CLASE_SUBCLASES[selectedClase].map((sub) => (
          <button
            key={sub}
            onClick={() => onSelectSubclase(sub)}
            className={`flex-1 px-4 py-2 rounded border text-sm font-medium transition-colors cursor-pointer ${
              selectedSubclase === sub
                ? 'border-amber-500 bg-amber-600/20 text-amber-400'
                : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600'
            }`}
          >
            {sub}
          </button>
        ))}
      </div>
    </div>
  );
}
