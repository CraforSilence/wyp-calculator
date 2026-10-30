'use client';

import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { IconSelect } from '@/components/ui/IconSelect';
import { SubclassIcon } from '@/components/icons/CharacterIcons';
import { ImportModal } from '@/components/ui/ImportModal';
import { useToast } from '@/components/ui/Toast';
import { useShare } from '@/components/ui/ShareProvider';
import { PowerTile } from '@/components/trainer/PowerTile';
import { PowerDetail } from '@/components/trainer/PowerDetail';
import { PowerIcon } from '@/components/icons/PowerIcons';
import { DISCIPLINE_ICONS } from '@/data/trainer/icons';
import { useTrainer } from '@/hooks/useTrainer';
import { useShareImport } from '@/hooks/useShareImport';
import { useI18n, useT } from '@/i18n/I18nProvider';
import { CLASE_SUBCLASES } from '@/lib/engine/constants';
import { TRAINER_DATA_VERSION } from '@/data/trainer';
import { DISCIPLINE_STEPS, NIVEL_MAX, NIVEL_MIN, PUNTOS_CRISTAL } from '@/data/trainer/rules';
import {
  emptySetup, getTrainer, lowerDiscipline, lowerPower, maxStepForLevel, normalizeSetup, nivelDisciplina,
  pointsLeft, powerCap, raiseDiscipline, raisePower, toSharePayload, totalPoints,
  TRAINER_ERROR_MESSAGES, type TrainerResult,
} from '@/lib/trainer';
import type { Clase, Subclase } from '@/types/character';
import type { ShareResult } from '@/lib/share';

const LEVELS = Array.from({ length: NIVEL_MAX - NIVEL_MIN + 1 }, (_, i) => NIVEL_MAX - i);

function PointsCounter({ label, left, total }: { label: string; left: number; total: number }) {
  const t = useT();
  const over = left < 0;
  const pct = total > 0 ? Math.min(100, Math.max(0, ((total - left) / total) * 100)) : 0;
  return (
    <div className="min-w-36 flex-1">
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <span className="text-zinc-400">{label}</span>
        <span className={`tabular-nums font-semibold ${over ? 'text-red-400' : 'text-zinc-100'}`}>
          {left} <span className="text-zinc-500 font-normal">{t('libres de')} {total}</span>
        </span>
      </div>
      <div className="mt-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
        <div className={`h-full ${over ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${over ? 100 : pct}%` }} />
      </div>
    </div>
  );
}

export default function EntrenadorPage() {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const { share } = useShare();
  const { importShare } = useShareImport();
  const { current, setCurrent, mounted, saved, loaded, saveAs, overwrite, load, remove, reset, maxSaved } = useTrainer();
  const [focus, setFocus] = useState<{ row: number; index: number } | null>({ row: 0, index: 0 });
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [importOpen, setImportOpen] = useState(false);
  /** Acción que reemplazaría lo abierto, esperando que el usuario confirme */
  const [pending, setPending] = useState<(() => void) | null>(null);

  const trainer = getTrainer(current.subclase);
  const setup = current;
  const total = totalPoints(setup);
  const left = trainer ? pointsLeft(setup, trainer) : { disciplina: 0, poder: 0 };

  const apply = (result: TrainerResult) => {
    if (result.ok) setCurrent(result.setup);
    else toast(t(TRAINER_ERROR_MESSAGES[result.error]), 'error');
  };

  const changeLevel = (nivel: number) => setCurrent(normalizeSetup({ ...setup, nivel, cristal: nivel === NIVEL_MAX && setup.cristal }));

  const changeSubclass = (subclase: Subclase) => {
    if (!getTrainer(subclase) || subclase === setup.subclase) return;
    guard(() => {
      reset(emptySetup(subclase, setup.nivel));
      setFocus({ row: 0, index: 0 });
    });
  };

  const resetAll = () => guard(() => {
    reset(emptySetup(setup.subclase, setup.nivel));
    toast(t('Entrenador reiniciado'), 'info');
  });

  const loadSaved = (id: string) => guard(() => {
    load(id);
    setFocus({ row: 0, index: 0 });
    toast(t('Setup cargado'), 'info');
  });

  const subclassOptions = (Object.keys(CLASE_SUBCLASES) as Clase[]).flatMap((clase) =>
    CLASE_SUBCLASES[clase].map((s) => ({ clase, subclase: s })),
  );

  const focused = trainer && focus ? trainer.disciplinas[focus.row]?.poderes[focus.index] : undefined;
  const focusedDetail = trainer && focus && focused ? (
    <PowerDetail
      power={focused}
      discipline={trainer.disciplinas[focus.row]}
      level={setup.poderes[focus.row][focus.index]}
      cap={powerCap(trainer.disciplinas[focus.row], setup.disciplinas[focus.row], focus.index, setup.nivel)}
      nivelPersonaje={setup.nivel}
      onRaise={() => apply(raisePower(setup, trainer, focus.row, focus.index))}
      onLower={() => apply(lowerPower(setup, trainer, focus.row, focus.index))}
    />
  ) : null;

  const summary = useMemo(() => {
    if (!trainer) return [];
    return trainer.disciplinas.map((d, row) => ({
      discipline: d,
      nivel: nivelDisciplina(setup.disciplinas[row]),
      powers: d.poderes
        .map((p, i) => ({ power: p, level: d.warmaster ? (powerCap(d, setup.disciplinas[row], i, setup.nivel) > 0 ? 1 : 0) : setup.poderes[row][i] }))
        .filter((x) => x.level > 0),
    })).filter((x) => x.powers.length > 0 || x.nivel > 1);
  }, [trainer, setup]);

  const openSave = () => {
    setSaveName(loaded?.nombre ?? `${t(setup.subclase)} ${setup.nivel}`);
    setSaveOpen(true);
  };

  const doSaveAs = () => {
    const nombre = saveName.trim() || `${t(setup.subclase)} ${setup.nivel}`;
    if (!saveAs(nombre)) {
      toast(t('Llegaste al máximo de {n} setups guardados. Borrá alguno.', { n: maxSaved }), 'error');
      return;
    }
    toast(t('Setup guardado'), 'success');
    setSaveOpen(false);
  };

  const doOverwrite = () => {
    if (!loaded) return;
    overwrite(loaded.id, saveName.trim() || loaded.nombre);
    toast(t('Cambios guardados'), 'success');
    setSaveOpen(false);
  };

  const handleImport = (result: ShareResult) => {
    const outcome = importShare(result);
    toast(t(outcome.message), 'success');
    setImportOpen(false);
  };

  const dirty = loaded ? JSON.stringify(loaded.setup) !== JSON.stringify(setup) : false;
  // Se pierde algo si el guardado abierto tiene cambios, o si lo abierto no está guardado y tiene puntos
  const unsaved = loaded ? dirty : setup.disciplinas.some((d) => d > 0) || setup.poderes.some((r) => r.some((l) => l > 0));

  /** Corre la acción, o pide confirmación antes si reemplazaría algo sin guardar */
  function guard(action: () => void) {
    if (unsaved) setPending(() => action);
    else action();
  }

  return (
    <div>
      <PageHeader
        title={t('Entrenador')}
        description={t('Repartí los puntos de disciplina y de poder como en el entrenador del juego. Guardá tus setups y compartilos con un link.')}
        actions={
          <>
            <Button variant="secondary" onClick={() => setImportOpen(true)}>{t('Importar')}</Button>
            <Button variant="secondary" onClick={() => share('trainer', toSharePayload(setup, loaded?.nombre))} disabled={!trainer}>{t('Compartir')}</Button>
            <Button onClick={openSave} disabled={!trainer}>{t('Guardar')}</Button>
          </>
        }
      />

      {/* Personaje y puntos */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-4 flex flex-wrap items-end gap-4">
        <IconSelect
          label={t('Subclase')}
          value={setup.subclase}
          onChange={(v) => changeSubclass(v as Subclase)}
          options={subclassOptions.map((o) => ({ value: o.subclase, label: o.subclase, group: o.clase }))}
          renderIcon={(v) => <SubclassIcon subclase={v as Subclase} className="w-[1.4em] h-[1.4em]" />}
          className="min-w-44"
        />
        <div className="flex flex-col gap-1">
          <label htmlFor="t-nivel" className="text-xs text-zinc-400 font-medium">{t('Nivel')}</label>
          <select
            id="t-nivel"
            value={setup.nivel}
            onChange={(e) => changeLevel(Number(e.target.value))}
            className="bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500 tabular-nums"
          >
            {LEVELS.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <label className={`flex items-center gap-2 text-sm pb-1.5 ${setup.nivel === NIVEL_MAX ? 'text-zinc-300 cursor-pointer' : 'text-zinc-600'}`} title={t('Cristal rojo del nigromante: +{n} puntos de poder al nivel 60', { n: PUNTOS_CRISTAL })}>
          <input
            type="checkbox"
            className="accent-amber-500"
            checked={setup.cristal}
            disabled={setup.nivel !== NIVEL_MAX}
            onChange={(e) => setCurrent({ ...setup, cristal: e.target.checked })}
          />
          {t('Cristal del nigromante')} <span className="text-xs text-zinc-500">(+{PUNTOS_CRISTAL})</span>
        </label>
        <div className="flex flex-1 flex-wrap gap-4 min-w-64">
          <PointsCounter label={t('Puntos de disciplina')} left={left.disciplina} total={total.disciplina} />
          <PointsCounter label={t('Puntos de poder')} left={left.poder} total={total.poder} />
        </div>
        <Button variant="ghost" size="sm" onClick={resetAll}>
          {t('Reiniciar')}
        </Button>
        {(left.disciplina < 0 || left.poder < 0) && (
          <p className="w-full text-xs text-red-400">{t('Te pasaste de puntos para este nivel. Bajá alguna disciplina o poder.')}</p>
        )}
        {loaded && (
          <p className="w-full text-xs text-zinc-500">
            {t('Abierto: {nombre}', { nombre: loaded.nombre })}{dirty && <span className="text-amber-500"> · {t('con cambios sin guardar')}</span>}
          </p>
        )}
      </div>

      {!mounted ? null : !trainer ? (
        <div className="rounded-lg border-2 border-dashed border-zinc-800 px-6 py-10 text-center text-sm text-zinc-400">
          {t('Esta subclase todavía no está cargada en el entrenador.')}
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px] items-start">
          {/* Disciplinas */}
          <div className="space-y-2">
            {trainer.disciplinas.map((d, row) => {
              const step = setup.disciplinas[row];
              const maxStep = maxStepForLevel(setup.nivel, d);
              const next = DISCIPLINE_STEPS[step + 1];
              const nextCost = next ? next.costo - DISCIPLINE_STEPS[step].costo : 0;
              const wmLocked = d.warmaster && maxStep < 0;
              const focusInRow = focus?.row === row;
              return (
                <div key={d.id} className={`bg-zinc-900 border rounded-lg p-3 ${d.warmaster ? 'border-amber-800/40' : 'border-zinc-800'}`}>
                  <div className="flex flex-col gap-3">
                    {/* Disciplina */}
                    <div className="flex items-center gap-x-3 gap-y-1">
                      <div className="min-w-0 flex-1 flex items-center gap-2">
                        {DISCIPLINE_ICONS[d.id] && <PowerIcon spec={DISCIPLINE_ICONS[d.id]} className="w-8 h-8 shrink-0" />}
                        <div className="min-w-0">
                        <div className="text-base font-semibold text-zinc-100 truncate">{d.nombre[lang]}</div>
                        <div className="text-[11px] text-zinc-500">
                          {wmLocked
                            ? t('Solo nivel 60')
                            : next
                              ? next.nivelPersonaje > setup.nivel
                                ? t('Siguiente: nivel {n} de personaje', { n: next.nivelPersonaje })
                                : t('Siguiente: {n} pts', { n: nextCost })
                              : t('Al máximo')}
                        </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button size="sm" variant="secondary" onClick={() => apply(lowerDiscipline(setup, trainer, row))} disabled={step === 0} aria-label={t('Bajar {disciplina}', { disciplina: d.nombre[lang] })}>−</Button>
                        <span className="w-8 text-center text-lg font-bold tabular-nums text-amber-400">{nivelDisciplina(step)}</span>
                        <Button size="sm" onClick={() => apply(raiseDiscipline(setup, trainer, row))} disabled={wmLocked || !next || step + 1 > maxStep} aria-label={t('Subir {disciplina}', { disciplina: d.nombre[lang] })}>+</Button>
                      </div>
                    </div>

                    {/* Poderes */}
                    <div className={`grid gap-2 flex-1 ${d.warmaster ? 'grid-cols-5' : 'grid-cols-4 min-[420px]:grid-cols-5 sm:grid-cols-10'}`}>
                      {d.poderes.map((p, i) => (
                        <PowerTile
                          key={p.id}
                          power={p}
                          level={setup.poderes[row][i]}
                          cap={powerCap(d, step, i, setup.nivel)}
                          warmaster={d.warmaster}
                          selected={focusInRow && focus?.index === i}
                          onFocus={() => setFocus({ row, index: i })}
                          onRaise={() => { if (!d.warmaster) apply(raisePower(setup, trainer, row, i)); }}
                          onLower={() => { if (!d.warmaster) apply(lowerPower(setup, trainer, row, i)); }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* En pantallas chicas el detalle va debajo de la fila */}
                  {focusInRow && focusedDetail && (
                    <div className="xl:hidden mt-3 pt-3 border-t border-zinc-800">{focusedDetail}</div>
                  )}
                </div>
              );
            })}
            <p className="text-xs text-zinc-500 pt-1">
              {t('Clic en un poder para subirlo, clic derecho o Shift + clic para bajarlo. P = pasivo, A = aura, I = instancia.')}{' '}
              {t('Datos del juego versión {v}.', { v: TRAINER_DATA_VERSION })}
            </p>
          </div>

          {/* Detalle y resumen */}
          <aside className="space-y-4 xl:sticky xl:top-16">
            {focusedDetail && (
              <div className="hidden xl:block bg-zinc-900 border border-zinc-800 rounded-lg p-4">{focusedDetail}</div>
            )}

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <h2 className="text-sm font-semibold text-zinc-200 mb-2">{t('Resumen')}</h2>
              {summary.length === 0 ? (
                <p className="text-xs text-zinc-500">{t('Todavía no repartiste puntos.')}</p>
              ) : (
                <ul className="space-y-2 text-xs">
                  {summary.map(({ discipline, nivel, powers }) => (
                    <li key={discipline.id}>
                      <span className="text-zinc-300 font-medium">{discipline.nombre[lang]}</span>{' '}
                      <span className="text-amber-400 tabular-nums">{nivel}</span>
                      {powers.length > 0 && (
                        <div className="text-zinc-400">
                          {powers.map(({ power, level }) => (discipline.warmaster ? power.nombre[lang] : `${power.nombre[lang]} ${level}`)).join(' · ')}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <h2 className="text-sm font-semibold text-zinc-200 mb-2">{t('Mis setups')} <span className="text-zinc-500 font-normal">({saved.length})</span></h2>
              {saved.length === 0 ? (
                <p className="text-xs text-zinc-500">{t('Guardá tu setup para tenerlo a mano o compartirlo.')}</p>
              ) : (
                <ul className="divide-y divide-zinc-800">
                  {saved.map((s) => (
                    <li key={s.id} className="py-2 flex items-center gap-2">
                      <button
                        onClick={() => { if (s.id !== loaded?.id || dirty) loadSaved(s.id); }}
                        className={`min-w-0 flex-1 text-left cursor-pointer ${loaded?.id === s.id ? 'text-amber-400' : 'text-zinc-200 hover:text-amber-300'}`}
                      >
                        <div className="text-sm truncate">{s.nombre}</div>
                        <div className="text-[11px] text-zinc-500">{t(s.setup.subclase)} · {t('nivel')} {s.setup.nivel}</div>
                      </button>
                      <Button size="sm" variant="ghost" onClick={() => share('trainer', toSharePayload(s.setup, s.nombre))}>{t('Compartir')}</Button>
                      <Button size="sm" variant="danger-ghost" onClick={() => { remove(s.id); toast(t('Setup borrado'), 'info'); }} aria-label={t('Borrar {nombre}', { nombre: s.nombre })}>✕</Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      )}

      <Modal open={saveOpen} onClose={() => setSaveOpen(false)} title={t('Guardar setup')} size="md">
        <form onSubmit={(e) => { e.preventDefault(); if (loaded) doOverwrite(); else doSaveAs(); }} className="space-y-4">
          <div>
            <label htmlFor="t-save-name" className="block text-sm text-zinc-300 mb-1">{t('Nombre')}</label>
            <input
              id="t-save-name"
              autoFocus
              value={saveName}
              maxLength={60}
              onChange={(e) => setSaveName(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setSaveOpen(false)}>{t('Cancelar')}</Button>
            {loaded ? (
              <>
                <Button type="button" variant="secondary" onClick={doSaveAs}>{t('Guardar como nuevo')}</Button>
                <Button type="submit">{t('Guardar cambios')}</Button>
              </>
            ) : (
              <Button type="submit">{t('Guardar')}</Button>
            )}
          </div>
        </form>
      </Modal>

      <Modal open={pending !== null} onClose={() => setPending(null)} title={t('¿Descartar los cambios?')} size="md">
        <p className="text-sm text-zinc-300">
          {loaded
            ? t('«{nombre}» tiene cambios sin guardar. Si seguís, se pierden.', { nombre: loaded.nombre })
            : t('El setup abierto no está guardado. Si seguís, se pierde.')}
        </p>
        <div className="flex flex-wrap justify-end gap-2 mt-4">
          <Button variant="ghost" onClick={() => setPending(null)}>{t('Cancelar')}</Button>
          <Button variant="secondary" onClick={() => { setPending(null); openSave(); }}>{t('Guardar primero')}</Button>
          <Button variant="danger" onClick={() => { const action = pending; setPending(null); action?.(); }}>{t('Descartar y seguir')}</Button>
        </div>
      </Modal>

      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} expectedType="trainer" onImport={handleImport} />
    </div>
  );
}
