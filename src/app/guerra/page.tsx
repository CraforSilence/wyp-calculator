'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { WarMap, ShieldIcon } from '@/components/war/WarMap';
import { GemIcon } from '@/components/war/GemShape';
import { useI18n, type TFunction } from '@/i18n/I18nProvider';
import { REALMS, officialUrl, kindOf, type Realm, type World, type WarStatus, type WarBuilding } from '@/lib/war';

const REFRESH_MS = 60_000;
const SNAP_KEY = (w: World) => `regnum-war-snap-${w}`;
const LOG_KEY = 'regnum-war-log';
const LOG_MAX = 10;
const world: World = 'ra';

const REALM_STYLE: Record<Realm, { text: string; bg: string; border: string; fill: string }> = {
  Alsius: { text: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-600/50', fill: '#38bdf8' },
  Ignis: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-600/50', fill: '#f87171' },
  Syrtis: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-600/50', fill: '#34d399' },
};

/** Cambio detectado entre dos lecturas, guardado en este navegador. */
type WarEvent =
  | { t: number; world: World; kind: 'fort'; num: number; name: string; location: Realm; from: Realm; to: Realm }
  | { t: number; world: World; kind: 'gem'; origin: Realm; from: Realm | null; to: Realm | null };

interface Snapshot { owners: Record<number, Realm>; gems: Record<Realm, (Realm | null)[]> }

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function writeJSON(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

function snapshotOf(s: WarStatus): Snapshot {
  return {
    owners: Object.fromEntries(s.buildings.map((b) => [b.num, b.owner])),
    gems: Object.fromEntries(s.realms.map((r) => [r.realm, r.gems])) as Snapshot['gems'],
  };
}

/** Compara la lectura anterior con la nueva y arma la lista de cambios. */
function diff(prev: Snapshot, next: WarStatus): WarEvent[] {
  const t = Date.now();
  const events: WarEvent[] = [];
  for (const b of next.buildings) {
    const from = prev.owners[b.num];
    if (from && from !== b.owner) events.push({ t, world: next.world, kind: 'fort', num: b.num, name: b.name, location: b.location, from, to: b.owner });
  }
  // Gemas: para cada reino de origen, en qué altares estaban y en cuáles están ahora
  const altarsOf = (gems: Snapshot['gems'], origin: Realm) =>
    REALMS.flatMap((altar) => (gems[altar] ?? []).filter((g) => g === origin).map(() => altar));
  const nextGems = snapshotOf(next).gems;
  for (const origin of REALMS) {
    const before = altarsOf(prev.gems, origin);
    const after = altarsOf(nextGems, origin);
    const gone = [...before];
    const added: Realm[] = [];
    for (const a of after) {
      const i = gone.indexOf(a);
      if (i >= 0) gone.splice(i, 1); else added.push(a);
    }
    while (gone.length || added.length) {
      events.push({ t, world: next.world, kind: 'gem', origin, from: gone.shift() ?? null, to: added.shift() ?? null });
    }
  }
  return events;
}

function ago(t: TFunction, ms: number) {
  const s = Math.max(0, Math.round((Date.now() - ms) / 1000));
  if (s < 60) return t('recién');
  if (s < 3600) return t('hace {n} min', { n: Math.floor(s / 60) });
  if (s < 86400) return t('hace {n} h', { n: Math.floor(s / 3600) });
  return t('hace {n} d', { n: Math.floor(s / 86400) });
}

function RealmName({ realm }: { realm: Realm }) {
  return <span className={`font-semibold ${REALM_STYLE[realm].text}`}>{realm}</span>;
}

function eventText(t: TFunction, e: WarEvent) {
  if (e.kind === 'fort') {
    if (e.to === e.location) return t('{reino} recuperó {fuerte}', { reino: e.to, fuerte: e.name });
    return t('{reino} capturó {fuerte} (era de {antes})', { reino: e.to, fuerte: e.name, antes: e.from });
  }
  if (e.from && e.to) return t('Una gema de {origen} pasó del altar de {a} al de {b}', { origen: e.origin, a: e.from, b: e.to });
  if (e.to) return t('Una gema de {origen} llegó al altar de {b}', { origen: e.origin, b: e.to });
  return t('Una gema de {origen} salió del altar de {a}', { origen: e.origin, a: e.from ?? '?' });
}

export default function GuerraPage() {
  const { t, lang } = useI18n();
  const [status, setStatus] = useState<WarStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<WarEvent[]>([]);
  const [, tick] = useState(0);
  const lastReq = useRef(0);

  useEffect(() => {
    setLog(readJSON<WarEvent[]>(LOG_KEY, []).slice(0, LOG_MAX));
  }, []);

  const load = useCallback(async () => {
    // Si cambia el idioma mientras carga, la respuesta vieja se descarta
    const req = ++lastReq.current;
    setLoading(true);
    try {
      const res = await fetch(`/api/guerra?world=${world}&lang=${lang}`, { cache: 'no-store' });
      const data = await res.json();
      if (req !== lastReq.current) return;
      if (!res.ok || data.error) throw new Error(data.error || `HTTP ${res.status}`);
      const next = data as WarStatus;
      const prev = readJSON<Snapshot | null>(SNAP_KEY(world), null);
      if (prev) {
        const events = diff(prev, next);
        if (events.length) {
          const merged = [...events, ...readJSON<WarEvent[]>(LOG_KEY, [])].slice(0, LOG_MAX);
          writeJSON(LOG_KEY, merged);
          setLog(merged);
        }
      }
      writeJSON(SNAP_KEY(world), snapshotOf(next));
      setStatus(next);
      setError(null);
    } catch (e) {
      if (req === lastReq.current) setError(e instanceof Error ? e.message : String(e));
    } finally {
      if (req === lastReq.current) setLoading(false);
    }
  }, [lang]);

  // Primera carga, al cambiar de idioma y cada minuto con la pestaña visible
  useEffect(() => {
    load();
    const id = setInterval(() => { if (!document.hidden) load(); }, REFRESH_MS);
    const onVisible = () => { if (!document.hidden) load(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', onVisible); };
  }, [load]);

  // Refresca los "hace X min"
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const worldLog = log.filter((e) => e.world === world);
  const byRealm = (r: Realm) => status?.buildings.filter((b) => b.location === r) ?? [];
  const held = (r: Realm) => status?.buildings.filter((b) => b.owner === r).length ?? 0;
  const invaded = status?.buildings.filter((b) => b.kind === 'muralla' && b.owner !== b.location) ?? [];

  return (
    <div>
      <PageHeader
        title={t('Guerra')}
        description={t('Fuertes, castillos, gemas y reliquias de cada reino, según la página oficial. Se actualiza solo cada minuto.')}
        actions={
          <Button size="sm" variant="secondary" onClick={load} disabled={loading}>
            {loading ? t('Actualizando…') : t('Actualizar')}
          </Button>
        }
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-800/60 bg-red-950/30 px-4 py-3 text-sm text-red-300">
          {status
            ? t('No se pudo actualizar ({error}). Se muestran los últimos datos.', { error })
            : t('No se pudo leer la página oficial ({error}). Probá de nuevo en un rato.', { error })}
        </div>
      )}

      {!status && !error && <p className="text-sm text-zinc-500">{t('Cargando estado de guerra…')}</p>}

      {status && (
        <>
          {invaded.length > 0 && (
            <div className="mb-4 rounded-lg border border-amber-600/60 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
              {invaded.map((b) => (
                <p key={b.num}>{t('¡{reino} está invadiendo {victima}! Tiene la {muralla}.', { reino: b.owner, victima: b.location, muralla: b.name })}</p>
              ))}
            </div>
          )}

          {/* Resumen por reino */}
          <div className="grid gap-3 sm:grid-cols-3 mb-4">
            {status.realms.map((r) => {
              const st = REALM_STYLE[r.realm];
              const own = r.gems.filter((g) => g === r.realm).length;
              const foreign = r.gems.filter((g) => g && g !== r.realm).length;
              return (
                <div key={r.realm} className={`rounded-lg border ${st.border} ${st.bg} p-4`}>
                  <div className="flex items-baseline justify-between">
                    <span className={`text-lg font-bold ${st.text}`}>{r.realm}</span>
                    <span className="text-sm text-zinc-300">
                      <span className="text-xl font-bold text-zinc-100 tabular-nums">{held(r.realm)}</span> / 12 {t('fuertes')}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-xs text-zinc-400">{t('Altar')}</span>
                    <span className="flex gap-0.5">
                      {r.gems.map((g, i) => (
                        <GemIcon key={i} className="w-6 h-6" origin={g} label={g ? t('Gema de {reino}', { reino: g }) : t('Lugar vacío')} />
                      ))}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-500 mt-1 text-right">
                    {t('{n} propias', { n: own })}{foreign > 0 && <> · <span className="text-amber-400">{t('{n} robadas', { n: foreign })}</span></>}
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-xs text-zinc-400">{t('Reliquias')}</span>
                    <span className="flex gap-1">
                      {r.relics.map((rel) => {
                        const away = rel.location !== rel.name;
                        const label = away
                          ? t('Reliquia de {nombre}, en {lugar}', { nombre: rel.name, lugar: rel.location })
                          : t('Reliquia de {nombre}, en su lugar', { nombre: rel.name });
                        return (
                          <img
                            key={rel.id}
                            src={`/api/guerra/imagen?reliquia=${rel.id}`}
                            alt={label}
                            title={label}
                            width={20}
                            height={20}
                            className={`w-5 h-5 rounded ${away ? 'ring-2 ring-amber-500' : ''}`}
                          />
                        );
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,500px)]">
            {/* Fuertes por reino */}
            <Card>
              <div className="grid gap-5 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {REALMS.map((realm) => (
                  <div key={realm}>
                    <SectionHeader title={t('Territorio de {reino}', { reino: realm })} />
                    <ul className="space-y-1.5">
                      {byRealm(realm).map((b) => <BuildingRow key={b.num} b={b} t={t} />)}
                    </ul>
                  </div>
                ))}
              </div>
            </Card>

            {/* Mapa con los dueños en vivo */}
            <Card className="self-start">
              <WarMap buildings={status.buildings} realms={status.realms} t={t} />
            </Card>
          </div>

          {/* Cambios vistos */}
          <Card className="mt-4">
            <SectionHeader title={t('Últimos cambios')} help={t('La página oficial no publica un historial. Estos cambios los detecta tu navegador comparando una lectura con la anterior, así que solo aparecen los que pasaron mientras tenías WypForge abierto (o entre una visita y otra).')}>
              {worldLog.length > 0 && (
                <button
                  onClick={() => { const rest = log.filter((e) => e.world !== world); writeJSON(LOG_KEY, rest); setLog(rest); }}
                  className="text-xs text-zinc-500 hover:text-zinc-300 cursor-pointer"
                >
                  {t('Borrar')}
                </button>
              )}
            </SectionHeader>
            {worldLog.length === 0 ? (
              <p className="text-sm text-zinc-500">{t('Todavía no hay cambios. Dejá la página abierta y van a ir apareciendo acá.')}</p>
            ) : (
              <ul className="divide-y divide-zinc-800/70">
                {worldLog.map((e, i) => {
                  return (
                    <li key={i} className="flex items-center gap-2 py-1.5 text-sm">
                      {e.kind === 'fort'
                        ? <ShieldIcon owner={e.to} kind={kindOf(e.name)} className="w-6 h-6 shrink-0" />
                        : <GemIcon origin={e.origin} label={t('Gema de {reino}', { reino: e.origin })} className="w-6 h-6 shrink-0" />}
                      <span className="text-zinc-300 flex-1">{eventText(t, e)}</span>
                      <span className="text-xs text-zinc-500 shrink-0" title={new Date(e.t).toLocaleString()}>{ago(t, e.t)}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <p className="mt-4 text-xs text-zinc-500">
            {t('Fuente:')}{' '}
            <a href={officialUrl(world, lang)} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300">
              {t('estado de guerra oficial')}
            </a>
            {status.officialUpdate && <> · {t('Actualizada: {fecha}', { fecha: status.officialUpdate })}</>}
            {' · '}{t('Leída {cuando}', { cuando: ago(t, status.fetchedAt) })}
          </p>
        </>
      )}
    </div>
  );
}

function BuildingRow({ b, t }: { b: WarBuilding; t: TFunction }) {
  const lost = b.owner !== b.location;
  const st = REALM_STYLE[b.owner];
  return (
    <li className={`flex items-center gap-2 rounded border px-2 py-1.5 ${lost ? `${st.border} ${st.bg}` : 'border-zinc-800'}`}>
      <span className="w-5 text-xs text-zinc-500 tabular-nums text-right shrink-0">{b.num}</span>
      <ShieldIcon owner={b.owner} kind={b.kind} className="w-7 h-7 -my-1 shrink-0" />
      <span className="flex-1 min-w-0 text-sm text-zinc-200 truncate" title={b.name}>
        {b.name}
      </span>
      {lost && <span className="text-xs shrink-0">{t('en manos de')} <RealmName realm={b.owner} /></span>}
    </li>
  );
}
