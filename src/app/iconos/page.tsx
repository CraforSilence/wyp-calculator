'use client';

import type { ReactNode } from 'react';
import { ClassIcon, SubclassIcon } from '@/components/icons/CharacterIcons';
import { StatIcon, type StatIconId } from '@/components/icons/StatIcons';
import { CLASE_SUBCLASES } from '@/lib/engine/constants';
import type { Clase } from '@/types/character';

// Página de prueba (sin link en la navegación) para revisar los íconos.
const EQUIPO = [
  'arma', 'flechas', 'anillo', 'amuleto', 'casco', 'hombreras',
  'pechera', 'guanteletes', 'perneras', 'escudo', 'brazalete', 'tunica',
];
const STATS: StatIconId[] = [
  'punzante', 'cortante', 'aplastante', 'fuego', 'hielo', 'electrico',
  'fuerza', 'destreza', 'inteligencia', 'constitucion', 'concentracion', 'atributoClase',
  'critChance', 'critDmg', 'attackSpeed', 'castSpeed', 'moveSpeed', 'weaponDmg',
  'resistFisico', 'resistMagico', 'armadura', 'bloqueo', 'reduccionMelee', 'reduccionRango',
  'vida', 'mana', 'curacion', 'rango',
];
const SIZES = ['w-5 h-5', 'w-8 h-8', 'w-16 h-16', 'w-24 h-24'];

function IconCard({ label, render }: { label: string; render: (size: string) => ReactNode }) {
  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-4 flex flex-col items-center gap-3">
      <div className="flex items-end gap-4">{SIZES.map((s) => <span key={s}>{render(s)}</span>)}</div>
      <span className="text-sm text-zinc-300">{label}</span>
    </div>
  );
}

export default function IconosPage() {
  const clases = Object.keys(CLASE_SUBCLASES) as Clase[];
  const subclases = clases.flatMap((c) => CLASE_SUBCLASES[c]);
  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Íconos de personaje</h1>
      <h2 className="text-lg font-semibold text-amber-400">Clases</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {clases.map((c) => <IconCard key={c} label={c} render={(s) => <ClassIcon clase={c} className={s} />} />)}
      </div>
      <h2 className="text-lg font-semibold text-amber-400">Daño y bonus</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
        {STATS.map((id) => (
          <div key={id} className="rounded-lg border border-zinc-700 bg-zinc-900 p-3 flex flex-col items-center gap-2">
            <div className="flex items-end gap-2">
              <StatIcon id={id} className="w-4 h-4" />
              <StatIcon id={id} className="w-6 h-6" />
              <StatIcon id={id} className="w-12 h-12" />
            </div>
            <span className="text-xs text-zinc-400">{id}</span>
          </div>
        ))}
      </div>
      <h2 className="text-lg font-semibold text-amber-400">Equipo</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {EQUIPO.map((n) => <IconCard key={n} label={n} render={(s) => <img src={`/icons/${n}.svg`} alt="" className={s} />} />)}
      </div>
      <h2 className="text-lg font-semibold text-amber-400">Subclases</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {subclases.map((sub) => <IconCard key={sub} label={sub} render={(s) => <SubclassIcon subclase={sub} className={s} />} />)}
      </div>
    </main>
  );
}
