'use client';

import type { Power } from '@/data/trainer';
import { PODER_MAX } from '@/data/trainer/rules';
import { useI18n } from '@/i18n/I18nProvider';
import { PowerIcon } from '@/components/icons/PowerIcons';
import { POWER_ICONS } from '@/data/trainer/icons';

/** Iniciales del poder, mientras no tengamos íconos propios */
function initials(name: string): string {
  const words = name.split(/\s+/).filter((w) => w.length > 2 || /^[A-ZÁÉÍÓÚ]/.test(w));
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).replace(/^./, (c) => c.toUpperCase());
}

const KIND_BADGE: Record<Power['tipo'], { letter: string; className: string } | null> = {
  pasivo: { letter: 'P', className: 'bg-emerald-700/80 text-emerald-100' },
  aura: { letter: 'A', className: 'bg-sky-700/80 text-sky-100' },
  activable: { letter: 'I', className: 'bg-violet-700/80 text-violet-100' },
  constante: null,
  directo: null,
};

interface PowerTileProps {
  power: Power;
  level: number;
  /** Nivel máximo que permite la disciplina ahora (0 = bloqueado) */
  cap: number;
  warmaster?: boolean;
  selected: boolean;
  onRaise: () => void;
  onLower: () => void;
  onFocus: () => void;
}

export function PowerTile({ power, level, cap, warmaster, selected, onRaise, onLower, onFocus }: PowerTileProps) {
  const { lang, t } = useI18n();
  const name = power.nombre[lang];
  const locked = cap === 0;
  const active = warmaster ? !locked : level > 0;
  const badge = KIND_BADGE[power.tipo];

  const spec = POWER_ICONS[power.id];
  const state = locked
    ? 'border-zinc-800 bg-zinc-900 text-zinc-600'
    : active
      ? 'border-amber-500 bg-amber-600/15 text-amber-300'
      : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-500';

  return (
    <div className="flex flex-col items-center gap-1 min-w-0">
      <button
        type="button"
        onClick={(e) => { onFocus(); if (e.shiftKey) onLower(); else onRaise(); }}
        onContextMenu={(e) => { e.preventDefault(); onFocus(); onLower(); }}
        onMouseEnter={onFocus}
        onFocus={onFocus}
        aria-label={`${name}: ${warmaster ? t(active ? 'Habilitado' : 'Bloqueado') : `${level}/${PODER_MAX}`}`}
        className={`relative w-full aspect-square max-w-14 rounded-md border-2 overflow-hidden flex items-center justify-center font-bold text-sm transition-colors cursor-pointer select-none ${state} ${locked && !spec ? 'opacity-60' : ''} ${selected ? 'ring-2 ring-amber-300 ring-offset-1 ring-offset-zinc-900' : ''}`}
      >
        {spec ? (
          <PowerIcon spec={spec} className={`absolute inset-0 w-full h-full ${locked ? 'grayscale opacity-40' : !active ? 'saturate-50 opacity-75' : ''}`} />
        ) : initials(name)}
        {badge && (
          <span className={`absolute top-0 left-0 w-3.5 h-3.5 rounded-br-sm text-[9px] leading-[14px] text-center font-bold ${badge.className}`} aria-hidden>
            {badge.letter}
          </span>
        )}
      </button>
      {!warmaster && (
        <span className="flex justify-center gap-0.5" aria-hidden>
          {Array.from({ length: PODER_MAX }, (_, i) => (
            <span
              key={i}
              className={`w-1.5 h-1.5 rounded-full ${
                i < level ? 'bg-amber-400' : i < cap ? 'border border-zinc-500' : 'bg-zinc-800'
              }`}
            />
          ))}
        </span>
      )}
      <span title={name} className={`text-xs leading-tight tracking-tight text-center line-clamp-3 -mx-1 w-[calc(100%+0.5rem)] [overflow-wrap:anywhere] ${active ? 'text-zinc-100 font-medium' : 'text-zinc-400'}`}>{name}</span>
    </div>
  );
}
