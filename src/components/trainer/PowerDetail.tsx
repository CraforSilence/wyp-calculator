'use client';

import type { Discipline, Localized, Power, PowerEffect } from '@/data/trainer';
import { DISCIPLINE_STEPS, PODER_MAX } from '@/data/trainer/rules';
import { stepToUnlock } from '@/lib/trainer';
import { useI18n } from '@/i18n/I18nProvider';
import { Button } from '@/components/ui/Button';
import { PowerIcon } from '@/components/icons/PowerIcons';
import { POWER_ICONS } from '@/data/trainer/icons';

const KIND_LABEL: Record<Power['tipo'], string> = {
  pasivo: 'Pasivo',
  constante: 'Constante',
  directo: 'Directo',
  activable: 'Activable',
  aura: 'Aura',
};

const GCD_LABEL: Record<NonNullable<Power['recargaGlobal']>, string> = {
  'muy-corta': 'Muy corta',
  corta: 'Corta',
  normal: 'Normal',
  larga: 'Larga',
  'muy-larga': 'Muy larga',
};

const EFFECT_STYLE: Record<PowerEffect['kind'], string> = {
  buff: 'text-emerald-400',
  debuff: 'text-red-400',
  dano: 'text-amber-400',
  contra: 'text-zinc-400',
};

const EFFECT_GROUP: Record<PowerEffect['kind'], string> = {
  buff: 'A vos o tus aliados',
  debuff: 'Al enemigo',
  dano: 'Daño',
  contra: 'Lo que te cuesta',
};

interface PowerDetailProps {
  power: Power;
  discipline: Discipline;
  level: number;
  cap: number;
  /** Nivel del personaje, para explicar qué hace falta si está bloqueado */
  nivelPersonaje: number;
  onRaise: () => void;
  onLower: () => void;
}

export function PowerDetail({ power, discipline, level, cap, nivelPersonaje, onRaise, onLower }: PowerDetailProps) {
  const { lang, t } = useI18n();
  const L = (x: Localized) => x[lang];
  const show = (v: string | Localized) => (typeof v === 'string' ? v : L(v));
  const wm = !!discipline.warmaster;
  const locked = cap === 0;
  const unlockStep = DISCIPLINE_STEPS[stepToUnlock(discipline, discipline.poderes.indexOf(power))];

  // Filas de la tabla por nivel: lo que cambia con el nivel. Lo fijo va en la lista de arriba.
  const perLevel: { label: string; values: readonly (string | number)[]; className?: string }[] = [];
  const fixed: { label: string; value: string; className?: string }[] = [];
  if (Array.isArray(power.mana)) perLevel.push({ label: t('Maná'), values: power.mana });
  else if (power.mana !== undefined) fixed.push({ label: t('Maná'), value: String(power.mana) });
  if (Array.isArray(power.duracion)) perLevel.push({ label: t('Duración (s)'), values: power.duracion });
  else if (power.duracion !== undefined) fixed.push({ label: t('Duración'), value: `${power.duracion} s` });
  if (power.recarga !== undefined) fixed.push({ label: t('Recarga'), value: `${power.recarga} s` });
  if (power.invocacion) fixed.push({ label: t('Invocación'), value: `${power.invocacion} s` });
  if (power.recargaGlobal) fixed.push({ label: t('Recarga global'), value: t(GCD_LABEL[power.recargaGlobal]) });
  if (power.rango) fixed.push({ label: t('Rango'), value: `${power.rango} m` });
  if (power.area) fixed.push({ label: t('Área'), value: `${power.area} m` });

  const effectsFixed: PowerEffect[] = [];
  for (const e of power.efectos) {
    if (Array.isArray(e.value)) perLevel.push({ label: L(e.label), values: e.value.map(show), className: EFFECT_STYLE[e.kind] });
    else effectsFixed.push(e);
  }

  const flags = [
    power.intervaloArma && t('Depende del intervalo del arma'),
    power.bloqueable100 && t('Solo se bloquea con 100% de bloqueo'),
    power.resistible100 && t('Solo se resiste con 100% de resistencia'),
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        {POWER_ICONS[power.id] && <PowerIcon spec={POWER_ICONS[power.id]} className="w-12 h-12 shrink-0 rounded-md" />}
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-wider text-zinc-500">{L(discipline.nombre)} · {t(KIND_LABEL[power.tipo])}</div>
          <h3 className="text-base font-semibold text-zinc-100">{L(power.nombre)}</h3>
          <p className="text-sm text-zinc-400 mt-1">{L(power.descripcion)}</p>
        </div>
      </div>

      {wm ? (
        <div className={`text-xs rounded px-2 py-1.5 ${locked ? 'bg-zinc-800 text-zinc-400' : 'bg-amber-600/15 text-amber-300'}`}>
          {locked
            ? nivelPersonaje < 60
              ? t('Los poderes de Warmaster son solo para nivel 60.')
              : t('Se habilita con {disciplina} en nivel {n}.', { disciplina: L(discipline.nombre), n: unlockStep?.nivel ?? '?' })
            : t('Habilitado. Los poderes de Warmaster no gastan puntos de poder.')}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={onLower} disabled={level === 0} aria-label={t('Bajar nivel')}>−</Button>
          <span className="text-sm text-zinc-200 tabular-nums whitespace-nowrap">
            {t('Nivel')} <span className="font-bold text-amber-400">{level}</span> / {PODER_MAX}
          </span>
          <Button size="sm" onClick={onRaise} disabled={locked || level >= cap} aria-label={t('Subir nivel')}>+</Button>
          <span className="text-xs text-zinc-500 ml-auto text-right">
            {locked
              ? t('Bloqueado: {disciplina} en nivel {n}', { disciplina: L(discipline.nombre), n: unlockStep?.nivel ?? '?' })
              : cap < PODER_MAX
                ? t('Hasta {n} con la disciplina actual', { n: cap })
                : null}
          </span>
        </div>
      )}

      {fixed.length > 0 && (
        <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
          {fixed.map((f) => (
            <div key={f.label} className="flex justify-between gap-2 border-b border-zinc-800/70 py-0.5">
              <dt className="text-zinc-500">{f.label}</dt>
              <dd className="text-zinc-200 tabular-nums">{f.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {effectsFixed.length > 0 && (
        <ul className="text-xs space-y-0.5">
          {effectsFixed.map((e, i) => (
            <li key={i} className={EFFECT_STYLE[e.kind]}>
              <span className="text-zinc-500">{t(EFFECT_GROUP[e.kind])}: </span>
              {L(e.label)}{e.value === true ? '' : ` ${show(e.value as string | Localized)}`}
            </li>
          ))}
        </ul>
      )}

      {perLevel.length > 0 && (
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-xs tabular-nums">
            <thead>
              <tr className="text-zinc-500">
                <th className="text-left font-normal px-1 py-1" />
                {Array.from({ length: PODER_MAX }, (_, i) => (
                  <th key={i} className={`font-medium px-1 py-1 text-center ${!wm && i + 1 === level ? 'text-amber-400' : ''}`}>{i + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {perLevel.map((row) => (
                <tr key={row.label} className="border-t border-zinc-800/70">
                  <td className={`px-1 py-1 text-left ${row.className ?? 'text-zinc-400'}`}>{row.label}</td>
                  {row.values.map((v, i) => (
                    <td
                      key={i}
                      className={`px-1 py-1 text-center ${!wm && i + 1 === level ? 'bg-amber-600/15 text-amber-200 font-semibold' : i + 1 > Math.max(cap, level) ? 'text-zinc-600' : 'text-zinc-300'}`}
                    >
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {flags.length > 0 && (
        <ul className="text-[11px] text-zinc-500 list-disc pl-4 space-y-0.5">
          {flags.map((f) => <li key={f}>{f}</li>)}
        </ul>
      )}
    </div>
  );
}
