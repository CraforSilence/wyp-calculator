'use client';

import type { CharacterProfile } from '@/types/character';
import { SUBCLASE_MAIN_STAT, ATTRIBUTE_MULTIPLIERS, ARMOR_CLASSES, CRIT_BASE } from '@/lib/engine/constants';
import { RAZAS_POR_REINO, PUNTOS_CREACION, raceBase, firstRaceFor, type Raza, type Reino } from '@/data/races';
import { ATTR_LABELS, ATTR_ORDER, baseStats, reinoDe, usesRaceBase, type AttrKey } from '@/lib/character';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useT } from '@/i18n/I18nProvider';

interface StatsPanelProps {
  character: CharacterProfile;
  onUpdate: (updates: Partial<CharacterProfile>) => void;
}

const REINOS: Reino[] = ['Alsius', 'Ignis', 'Syrtis'];
const selectClass = 'bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30';

export function StatsPanel({ character, onUpdate }: StatsPanelProps) {
  const t = useT();
  const mainStat = SUBCLASE_MAIN_STAT[character.subclase];
  const attrMult = ATTRIBUTE_MULTIPLIERS[character.subclase];
  const armorClass = ARMOR_CLASSES[character.subclase];
  const critBase = CRIT_BASE[character.subclase];
  const reino = reinoDe(character);
  const raza = character.raza ?? firstRaceFor(character.clase, reino);
  const base = raceBase(raza, character.clase);
  const isBase = usesRaceBase(character);

  const updateStat = (stat: AttrKey, value: number) => {
    onUpdate({ stats: { ...character.stats, [stat]: value } });
  };

  // Al cambiar de raza o reino, si los atributos eran los iniciales se cargan los de la nueva raza
  const changeRace = (nuevaRaza: Raza, nuevoReino: Reino) => {
    const stats = isBase ? baseStats(nuevaRaza, character.clase) : null;
    onUpdate({ raza: nuevaRaza, reino: nuevoReino, ...(stats ? { stats } : {}) });
  };

  const changeRealm = (nuevoReino: Reino) => {
    const keep = RAZAS_POR_REINO[nuevoReino].includes(raza) && raceBase(raza, character.clase);
    changeRace(keep ? raza : firstRaceFor(character.clase, nuevoReino), nuevoReino);
  };

  return (
    <Card title={t('Atributos del personaje')}>
      <div className="space-y-4">
        <div className="rounded-md border border-sky-800/50 bg-sky-900/15 px-3 py-2.5 text-sm text-zinc-300">
          <p className="font-medium text-sky-300">{t('Cómo cargarlos')}</p>
          <p className="mt-1">
            {t('Copiá los valores de la ventana Atributos del juego, con tu nivel actual, pero')}{' '}
            <strong className="text-zinc-100">{t('sin arma, armadura ni joyería que sumen atributos')}</strong>{' '}
            {t('y sin buffs activos (Coloso, Fuerza de oso, Bendición…).')}
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            {t('Lo que suman tu arma, tu joyería y tu armadura lo calculamos nosotros con lo que cargues en los pasos siguientes; si lo dejás puesto, se cuenta dos veces.')}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="pj-reino" className="text-xs text-zinc-400 font-medium">{t('Reino')}</label>
            <select id="pj-reino" value={reino} onChange={(e) => changeRealm(e.target.value as Reino)} className={selectClass}>
              {REINOS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="pj-raza" className="text-xs text-zinc-400 font-medium">{t('Raza')}</label>
            <select id="pj-raza" value={raza} onChange={(e) => changeRace(e.target.value as Raza, reino)} className={selectClass}>
              {RAZAS_POR_REINO[reino].map((r) => {
                const ok = !!raceBase(r, character.clase);
                return (
                  <option key={r} value={r} disabled={!ok}>
                    {t(r)}{ok ? '' : ` (${t('no puede ser {clase}', { clase: t(character.clase) })})`}
                  </option>
                );
              })}
            </select>
          </div>
          <Input
            label={t('Nivel')}
            type="number"
            min={1}
            max={60}
            value={character.nivel ?? 60}
            onChange={(e) => onUpdate({ nivel: Math.min(60, Math.max(1, Number(e.target.value) || 1)) })}
          />
        </div>

        <div className={`flex flex-wrap items-center gap-2 text-xs rounded px-2.5 py-1.5 ${isBase ? 'bg-amber-600/10 text-amber-300' : 'bg-zinc-800/60 text-zinc-400'}`}>
          {isBase ? (
            <span>
              {t('Por ahora son los atributos iniciales de {raza} {clase} (nivel 1, sin los {n} puntos libres). Cargá los tuyos para ver tu daño real.', {
                raza: t(raza), clase: t(character.clase), n: PUNTOS_CREACION,
              })}
            </span>
          ) : (
            <>
              <span className="flex-1">{t('Usando tus atributos.')}</span>
              {base && (
                <Button size="sm" variant="ghost" onClick={() => onUpdate({ stats: { ...base } })}>
                  {t('Volver a los iniciales de {raza}', { raza: t(raza) })}
                </Button>
              )}
            </>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {ATTR_ORDER.map((stat) => {
            const isMain = stat === mainStat;
            return (
              <div key={stat} className={`${isMain ? 'ring-1 ring-amber-500/50 rounded-lg p-2' : 'p-2'}`}>
                <Input
                  label={`${t(ATTR_LABELS[stat])}${isMain ? ` (${t('Principal')})` : ''}`}
                  type="number"
                  min={1}
                  max={400}
                  value={character.stats[stat] ?? base?.[stat] ?? 20}
                  onChange={(e) => updateStat(stat, Number(e.target.value))}
                />
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-3">
          <Input
            label={t("Crit Mult")}
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
            <span className="text-zinc-500">{t("Crit Base:")}</span>{' '}
            <span className="text-zinc-200">{critBase}%</span>
          </div>
          <div className="bg-zinc-800/50 rounded p-2">
            <span className="text-zinc-500">{t("Mult. Atributo:")}</span>{' '}
            <span className="text-zinc-200">x{attrMult}</span>
          </div>
          <div className="bg-zinc-800/50 rounded p-2">
            <span className="text-zinc-500">{t('Clase de Armadura:')}</span>{' '}
            <span className="text-zinc-200">{armorClass}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
