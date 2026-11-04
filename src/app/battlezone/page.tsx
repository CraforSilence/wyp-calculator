'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useI18n, type TFunction } from '@/i18n/I18nProvider';
import { bzStatus, bzLocalWeek, type BzWindow } from '@/lib/battlezone';

const HOUR_TICKS = [0, 6, 12, 18, 24];

function countdown(t: TFunction, ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, '0');
  return h > 0 ? t('{h} h {m} min', { h, m }) : t('{m} min {s} s', { m, s: sec });
}

const same = (a: BzWindow | null, b: BzWindow) => a !== null && a.start.getTime() === b.start.getTime();

export default function BattlezonePage() {
  const { t, lang } = useI18n();
  // Se calcula recién en el cliente: la hora y la zona horaria dependen del navegador
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="max-w-4xl">
      <PageHeader
        title={t('Battlezones')}
        description={t('Horario fijo de las Battlezones de Ra, pasado a tu hora local.')}
      />
      {now ? <BzContent now={now} t={t} locale={lang === 'es' ? 'es-AR' : 'en-GB'} /> : <p className="text-sm text-zinc-500">{t('Cargando…')}</p>}
    </div>
  );
}

function BzContent({ now, t, locale }: { now: Date; t: TFunction; locale: string }) {
  const { current, next, prev } = bzStatus(now);
  const week = bzLocalWeek(now);
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const hour = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  const weekday = new Intl.DateTimeFormat(locale, { weekday: 'long' });
  const range = (w: BzWindow) => `${hour.format(w.start)} – ${hour.format(w.end)}`;

  // Abierta: cuánto pasó de la ventana. Cerrada: cuánto pasó de la espera entre la última y la próxima.
  const [from, to] = current ? [current.start, current.end] : [prev.end, next.start];
  const pct = Math.min(100, ((now.getTime() - from.getTime()) / (to.getTime() - from.getTime())) * 100);
  const nowFrac = (now.getTime() - week[0].day.getTime()) / 86_400_000;

  return (
    <div className="space-y-4">
      {/* Estado actual */}
      <div
        className={`rounded-lg border p-4 sm:p-5 animate-fade-in-up ${
          current ? 'border-emerald-600/50 bg-emerald-500/10' : 'border-amber-600/40 bg-amber-500/5'
        }`}
      >
        <div className="flex flex-wrap items-center gap-4">
          <span className="shrink-0 inline-flex items-center justify-center w-14 h-14 rounded-lg border border-zinc-700 bg-zinc-800 p-2">
            <img src="/icons/battlezone.svg" alt="" className="w-full h-full object-contain" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                {current && <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />}
                <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${current ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
              </span>
              <span className={`text-xs font-semibold uppercase tracking-wide ${current ? 'text-emerald-400' : 'text-zinc-400'}`}>
                {current ? t('BZ abierta') : t('BZ cerrada')}
              </span>
            </div>
            <div className="mt-1 text-sm text-zinc-400">
              {current
                ? t('Abierta de {rango}', { rango: range(current) })
                : t('Próxima: {dia}, {rango}', { dia: weekday.format(next.start), rango: range(next) })}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-zinc-400">{current ? t('Cierra en') : t('Abre en')}</div>
            <div className={`text-2xl sm:text-3xl font-bold tabular-nums ${current ? 'text-emerald-300' : 'text-amber-400'}`}>
              {countdown(t, to.getTime() - now.getTime())}
            </div>
          </div>
        </div>
        <div className="mt-4 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
          <div className={`h-full transition-[width] duration-1000 ${current ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Semana */}
      <Card>
        <SectionHeader title={t('Próximos 7 días')} />
        {/* Mismo margen que la columna de los días (w-28 + gap-x-3) */}
        <div className="hidden sm:block ml-31 mb-1 relative h-4 text-[10px] text-zinc-500 tabular-nums">
          {HOUR_TICKS.map((h) => (
            <span
              key={h}
              className="absolute -translate-x-1/2 first:translate-x-0 last:-translate-x-full"
              style={{ left: `${(h / 24) * 100}%` }}
            >
              {String(h).padStart(2, '0')}
            </span>
          ))}
        </div>
        <ul className="space-y-1">
          {week.map(({ day, windows, segments }, i) => (
            <li
              key={i}
              className={`flex flex-col sm:flex-row sm:items-center gap-x-3 gap-y-1.5 rounded-md px-2 py-2 -mx-2 ${i === 0 ? 'bg-amber-500/5' : ''}`}
            >
              <span className={`sm:w-28 shrink-0 text-sm capitalize ${i === 0 ? 'font-semibold text-amber-400' : 'text-zinc-300'}`}>
                {i === 0 ? t('Hoy') : i === 1 ? t('Mañana') : weekday.format(day)}
              </span>
              <div className="flex-1 min-w-0 space-y-1.5">
                {/* Línea de 24 h */}
                <div className="relative h-3 rounded-full bg-zinc-800/80 overflow-hidden">
                  {HOUR_TICKS.slice(1, -1).map((h) => (
                    <span key={h} className="absolute inset-y-0 w-px bg-zinc-700/60" style={{ left: `${(h / 24) * 100}%` }} />
                  ))}
                  {segments.map((s) => {
                    const on = same(current, s.window);
                    const past = s.window.end <= now;
                    return (
                      <span
                        key={s.window.start.getTime()}
                        title={range(s.window)}
                        className={`absolute inset-y-0 rounded-full ${on ? 'bg-emerald-500' : past ? 'bg-zinc-600' : 'bg-amber-500/80'}`}
                        style={{ left: `${s.from * 100}%`, width: `${(s.to - s.from) * 100}%` }}
                      />
                    );
                  })}
                  {i === 0 && (
                    <span className="absolute -inset-y-0 w-0.5 bg-zinc-100 shadow-[0_0_4px_rgba(255,255,255,0.6)]" style={{ left: `${nowFrac * 100}%` }} />
                  )}
                </div>
                {/* Horarios */}
                <div className="flex flex-wrap gap-1.5">
                  {windows.map((w) => {
                    const on = same(current, w);
                    const past = w.end <= now;
                    const style = on
                      ? 'border-emerald-600/60 bg-emerald-500/15 text-emerald-300'
                      : past
                        ? 'border-zinc-800 text-zinc-600 line-through'
                        : 'border-zinc-700 bg-zinc-800/60 text-zinc-200';
                    return (
                      <span key={w.start.getTime()} className={`rounded border px-2 py-0.5 text-xs tabular-nums ${style}`}>
                        {range(w)}
                      </span>
                    );
                  })}
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-3 pt-3 border-t border-zinc-800/80 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-full bg-emerald-500" />{t('Abierta ahora')}</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-full bg-amber-500/80" />{t('Próximas')}</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-full bg-zinc-600" />{t('Terminadas')}</span>
          <span className="sm:ml-auto">{t('Horas en tu zona horaria ({zona}).', { zona: zone })}</span>
        </div>
      </Card>
    </div>
  );
}
