'use client';

import type { CharacterProfile, MainStat } from '@/types/character';
import { SUBCLASE_MAIN_STAT, ATTRIBUTE_MULTIPLIERS, ARMOR_CLASSES, CRIT_BASE } from '@/lib/engine/constants';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

interface StatsPanelProps {
  character: CharacterProfile;
  onUpdate: (updates: Partial<CharacterProfile>) => void;
}

const STAT_LABELS: Record<MainStat, string> = {
  STR: 'Fuerza',
  DXT: 'Destreza',
  INT: 'Inteligencia',
};

export function StatsPanel({ character, onUpdate }: StatsPanelProps) {
  const mainStat = SUBCLASE_MAIN_STAT[character.subclase];
  const attrMult = ATTRIBUTE_MULTIPLIERS[character.subclase];
  const armorClass = ARMOR_CLASSES[character.subclase];
  const critBase = CRIT_BASE[character.subclase];

  const updateStat = (stat: MainStat, value: number) => {
    onUpdate({ stats: { ...character.stats, [stat]: value } });
  };

  return (
    <Card title="Stats del Personaje">
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {(['STR', 'DXT', 'INT'] as MainStat[]).map((stat) => {
            const isMain = stat === mainStat;
            return (
              <div key={stat} className={`${isMain ? 'ring-1 ring-amber-500/50 rounded-lg p-2' : 'p-2'}`}>
                <Input
                  label={`${STAT_LABELS[stat]}${isMain ? ' (Principal)' : ''}`}
                  type="number"
                  min={1}
                  max={200}
                  value={character.stats[stat]}
                  onChange={(e) => updateStat(stat, Number(e.target.value))}
                />
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-3">
          <Input
            label="Crit Mult"
            type="number"
            step="0.1"
            min={1}
            max={5}
            value={character.critMult}
            onChange={(e) => onUpdate({ critMult: Number(e.target.value) })}
          />
        </div>

        <div className="grid grid-cols-3 gap-3 text-xs text-zinc-400">
          <div className="bg-zinc-800/50 rounded p-2">
            <span className="text-zinc-500">Crit Base:</span>{' '}
            <span className="text-zinc-200">{critBase}%</span>
          </div>
          <div className="bg-zinc-800/50 rounded p-2">
            <span className="text-zinc-500">Mult. Atributo:</span>{' '}
            <span className="text-zinc-200">x{attrMult}</span>
          </div>
          <div className="bg-zinc-800/50 rounded p-2">
            <span className="text-zinc-500">Clase Armadura:</span>{' '}
            <span className="text-zinc-200">{armorClass}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
