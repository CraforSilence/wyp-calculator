'use client';

import type { TFunction } from '@/i18n/I18nProvider';
import type { Realm, WarBuilding, WarRealm } from '@/lib/war';
import { GemShape, REALM_TONES } from './GemShape';

// Mapa de guerra propio: ilustración de fondo (public/guerra/mapa.webp, 1024×1024, hecha con
// Leonardo a partir del mapa oficial) y encima, en SVG, los escudos de cada fuerte con el color
// de su dueño actual, las murallas y las gemas de cada altar. Las coordenadas son en píxeles de
// esa imagen: si se cambia la ilustración, hay que reubicarlas.

export const REALM_FILL: Record<Realm, string> = { Alsius: '#38bdf8', Ignis: '#f87171', Syrtis: '#34d399' };
const NAVY = '#071f2e';
const GOLD = '#cba76f';
const GOLD_LIGHT = '#e5c58b';

const MAP_SRC = '/guerra/mapa.webp';
const SIZE = 1024;

/** Posición de cada fuerte en la ilustración (número → x, y). */
const POS: Record<number, [number, number]> = {
  1: [478, 215], 2: [448, 395], 3: [272, 448], 4: [322, 344],
  5: [560, 292], 6: [604, 410], 7: [762, 500], 8: [660, 320],
  9: [308, 535], 10: [480, 552], 11: [596, 788], 12: [393, 657],
};

/** Murallas dibujadas en la ilustración (para pintarlas del color de quien las tiene). */
const WALLS: Record<number, [number, number][]> = {
  4: [[218, 445], [260, 402], [300, 368], [340, 322], [370, 295]],
  8: [[598, 218], [630, 266], [660, 320], [690, 372], [720, 428]],
  12: [[297, 617], [340, 640], [393, 657], [440, 680], [488, 700]],
};

/** Altar de gemas de cada reino, en la zona interior detrás de su muralla. */
const ALTAR: Record<Realm, [number, number]> = { Alsius: [170, 300], Ignis: [830, 260], Syrtis: [400, 830] };

const line = (pts: [number, number][]) => 'M' + pts.map(([x, y]) => `${x},${y}`).join(' L');

// Escudo en la grilla de 64×64 de los íconos (public/icons): base oscura, mitad izquierda
// clara sin contorno, contorno navy, ribete dorado doble (navy + dorado) y emblema dorado.
const SHIELD = 'M11 9H53V30C53 45 44 54.5 32 61C20 54.5 11 45 11 30Z';
const SHIELD_LEFT = 'M11 9H32V61C20 54.5 11 45 11 30Z';
const SHIELD_TRIM = 'M16.5 14.5H47.5V30C47.5 41.5 41 49 32 54.5C23 49 16.5 41.5 16.5 30Z';

function Shield({ owner, kind }: { owner: Realm; kind: WarBuilding['kind'] }) {
  const tone = REALM_TONES[owner];
  return (
    <g transform="translate(-32,-35)" stroke={NAVY} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round">
      {kind === 'castillo' && (
        <>
          <path d="M17 11V1H23V5H29V1H35V5H41V1H47V11Z" fill="#a99167" />
          <path d="M17 11V1H23V5H29V1H32V11Z" fill={GOLD} stroke="none" />
          <path d="M17 11V1H23V5H29V1H35V5H41V1H47V11Z" fill="none" />
        </>
      )}
      <path d={SHIELD} fill={tone.base} />
      <path d={SHIELD_LEFT} fill={tone.light} stroke="none" />
      <path d={SHIELD} fill="none" />
      <path d={SHIELD_TRIM} fill="none" strokeWidth={5.5} />
      <path d={SHIELD_TRIM} fill="none" stroke={GOLD} strokeWidth={2.5} />
      {kind === 'fuerte' && (
        <path d="M32 21L39 31L32 41L25 31Z" fill={GOLD_LIGHT} strokeWidth={2} />
      )}
      {kind === 'castillo' && (
        <path d="M32 20L34.9 27.1L42.5 27.5L36.6 32.3L38.5 39.7L32 35.6L25.5 39.7L27.4 32.3L21.5 27.5L29.1 27.1Z" fill={GOLD_LIGHT} strokeWidth={2} />
      )}
      {kind === 'muralla' && (
        <>
          <path d="M21 22H43V41H21Z" fill={GOLD} strokeWidth={2} />
          <path d="M21 22H32V41H21Z" fill={GOLD_LIGHT} stroke="none" />
          <path d="M21 22H43V41H21ZM21 28.5H43M21 34.5H43M27 22V28.5M37 22V28.5M32 28.5V34.5M27 34.5V41M37 34.5V41" fill="none" strokeWidth={1.75} />
        </>
      )}
      <circle cx={16.5} cy={14.5} r={1.8} fill={GOLD_LIGHT} strokeWidth={1.25} />
      <circle cx={47.5} cy={14.5} r={1.8} fill={GOLD_LIGHT} strokeWidth={1.25} />
    </g>
  );
}

function Marker({ b, t }: { b: WarBuilding; t: TFunction }) {
  const [x, y] = POS[b.num] ?? [SIZE / 2, SIZE / 2];
  const lost = b.owner !== b.location;
  // El escudo mide 64 de grilla: 1 = 64 px en la ilustración de 1024
  const scale = b.kind === 'castillo' ? 1.15 : b.kind === 'muralla' ? 1.05 : 1;
  const label = lost ? `${b.num}. ${b.name} — ${t('en manos de')} ${b.owner}` : `${b.num}. ${b.name} — ${b.owner}`;
  const fill = REALM_FILL[b.owner];
  return (
    <g transform={`translate(${x},${y})`} aria-label={label} className="cursor-help">
      <title>{label}</title>
      {lost && (
        <circle r={40 * scale} fill={fill} fillOpacity={0.15} stroke={fill} strokeWidth={3}>
          <animate attributeName="r" values={`${36 * scale};${52 * scale};${36 * scale}`} dur="2.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.95;0.1;0.95" dur="2.4s" repeatCount="indefinite" />
        </circle>
      )}
      <ellipse cy={28 * scale} rx={20 * scale} ry={5 * scale} fill="#000" opacity={0.4} />
      <g transform={`scale(${scale})`}>
        <Shield owner={b.owner} kind={b.kind} />
      </g>
      <g transform={`translate(0,${36 * scale + 10})`}>
        <rect x={-15} y={-11} width={30} height={21} rx={10.5} fill={NAVY} fillOpacity={0.92} stroke={GOLD} strokeWidth={1.6} />
        <text y={5} textAnchor="middle" fontSize={14} fontWeight={700} fill={GOLD_LIGHT}>{b.num}</text>
      </g>
    </g>
  );
}

function Altar({ realm, gems, t }: { realm: Realm; gems: (Realm | null)[]; t: TFunction }) {
  const [x, y] = ALTAR[realm];
  const held = gems.filter(Boolean) as Realm[];
  const slots = Math.max(held.length, 1);
  const w = slots * 34 + 16;
  const label = `${t('Altar')} ${realm}: ${held.length ? held.map((g) => t('Gema de {reino}', { reino: g })).join(', ') : t('Lugar vacío')}`;
  return (
    <g transform={`translate(${x},${y})`} aria-label={label} className="cursor-help">
      <title>{label}</title>
      <rect x={-w / 2} y={-24} width={w} height={48} rx={10} fill={NAVY} fillOpacity={0.88} stroke={REALM_FILL[realm]} strokeWidth={2} />
      <rect x={-w / 2 + 3.5} y={-20.5} width={w - 7} height={41} rx={7.5} fill="none" stroke={GOLD} strokeOpacity={0.5} strokeWidth={1} />
      {held.length === 0
        ? <text y={5} textAnchor="middle" fontSize={14} fill="#71717a">—</text>
        : held.map((g, i) => (
            <g key={i} transform={`translate(${-w / 2 + 25 + i * 34},1) scale(0.5)`}><GemShape origin={g} /></g>
          ))}
      <text y={42} textAnchor="middle" fontSize={13} fontWeight={700} letterSpacing={1} fill={GOLD_LIGHT} stroke={NAVY} strokeWidth={4} paintOrder="stroke">
        {t('ALTAR')}
      </text>
    </g>
  );
}

export function WarMap({ buildings, realms, t }: { buildings: WarBuilding[]; realms: WarRealm[]; t: TFunction }) {
  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full h-auto rounded select-none" role="img" aria-label={t('Mapa de guerra')}>
      <image href={MAP_SRC} x={0} y={0} width={SIZE} height={SIZE} />

      {/* Murallas del color de quien las tiene */}
      {Object.entries(WALLS).map(([num, pts]) => {
        const owner = buildings.find((b) => b.num === +num)?.owner;
        if (!owner) return null;
        return (
          <g key={num} fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d={line(pts)} stroke={NAVY} strokeWidth={9} opacity={0.6} />
            <path d={line(pts)} stroke={REALM_FILL[owner]} strokeWidth={4} strokeDasharray="10 7" opacity={0.9} />
          </g>
        );
      })}

      {realms.map((r) => <Altar key={r.realm} realm={r.realm} gems={r.gems} t={t} />)}
      {buildings.map((b) => <Marker key={b.num} b={b} t={t} />)}
    </svg>
  );
}

/** Escudo suelto como ícono (lista de fuertes, últimos cambios). */
export function ShieldIcon({ owner, kind, className = 'w-5 h-5' }: { owner: Realm; kind: WarBuilding['kind']; className?: string }) {
  return (
    <svg viewBox="-34 -37 68 68" className={className} aria-hidden>
      <Shield owner={owner} kind={kind} />
    </svg>
  );
}
