/**
 * Horario fijo de las Battlezones de Ra, en hora UTC. Índice 0 = domingo (igual que
 * Date.getUTCDay). Cada ventana es [hora de apertura, hora de cierre].
 */
export const BZ_SCHEDULE_UTC: [number, number][][] = [
  [[13, 16], [18, 21]],
  [[3, 6], [13, 16], [20, 23]],
  [[13, 16], [18, 21]],
  [[13, 16], [20, 23]],
  [[3, 6], [13, 16], [18, 21]],
  [[13, 17], [20, 23]],
  [[3, 6], [13, 16], [20, 23]],
];

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

export interface BzWindow { start: Date; end: Date }

/** Ventanas de `days` días UTC seguidos, empezando `fromDay` días después de hoy (UTC). */
export function bzWindows(now: Date, fromDay: number, days: number): BzWindow[] {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const out: BzWindow[] = [];
  for (let k = fromDay; k < fromDay + days; k++) {
    const dayStart = today + k * DAY;
    for (const [a, b] of BZ_SCHEDULE_UTC[new Date(dayStart).getUTCDay()]) {
      out.push({ start: new Date(dayStart + a * HOUR), end: new Date(dayStart + b * HOUR) });
    }
  }
  return out;
}

/** La BZ abierta ahora (si hay), la próxima en abrir y la última que cerró. */
export function bzStatus(now: Date): { current: BzWindow | null; next: BzWindow; prev: BzWindow } {
  const ws = bzWindows(now, -2, 10);
  return {
    current: ws.find((w) => w.start <= now && now < w.end) ?? null,
    next: ws.find((w) => w.start > now)!,
    prev: ws.filter((w) => w.end <= now).at(-1)!,
  };
}

export interface BzDay {
  day: Date;
  /** Ventanas que abren este día (hora local). */
  windows: BzWindow[];
  /** Tramos de este día que caen dentro de una BZ, en fracción del día (0 a 1). Incluye la cola de una ventana que empezó el día anterior. */
  segments: { from: number; to: number; window: BzWindow }[];
}

/** Los próximos 7 días en hora local (hoy primero). */
export function bzLocalWeek(now: Date): BzDay[] {
  const ws = bzWindows(now, -2, 11);
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    const start = day.getTime();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i + 1).getTime();
    const len = end - start;
    return {
      day,
      windows: ws.filter((w) => w.start.getTime() >= start && w.start.getTime() < end),
      segments: ws
        .filter((w) => w.end.getTime() > start && w.start.getTime() < end)
        .map((w) => ({
          from: Math.max(0, (w.start.getTime() - start) / len),
          to: Math.min(1, (w.end.getTime() - start) / len),
          window: w,
        })),
    };
  });
}
