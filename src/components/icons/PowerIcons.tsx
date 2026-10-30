import { useId, type ReactNode } from 'react';
import { STAT_GLYPHS, SWORD_GLYPH, type StatIconId } from './StatIcons';

// Íconos de poderes del entrenador. Como en el juego, el fondo dice qué tipo de poder es
// (ataque, control, defensa...) y el dibujo de adelante qué hace; una medalla chica en la
// esquina agrega el matiz (sube, baja, en área, marea...). Los dibujos son los del sitio:
// contorno navy, pizarra y dorado, en un cuadro de 32.

const O = '#071f2e';
const B = '#2c4857';
const H = '#4d6b7a';
const G = '#cba76f';
const GL = '#e5c58b';
const GD = '#a99167';
const RED = '#c8524a';
const RED_L = '#e5857a';
const BONE = '#e9e2cf';

export type PowerBg = 'ataque' | 'control' | 'defensa' | 'apoyo' | 'curacion' | 'pasivo' | 'magia';

const BG: Record<PowerBg, [string, string]> = {
  ataque: ['#c4553a', '#5e1d17'],
  control: ['#8a5ac2', '#33205a'],
  defensa: ['#3a8cc4', '#163a5e'],
  apoyo: ['#d3a53c', '#5e4410'],
  curacion: ['#4fae68', '#1b4a2a'],
  pasivo: ['#5d7684', '#1f2c34'],
  magia: ['#34a9b0', '#11444b'],
};

function Line({ d, color, width }: { d: string; color: string; width: number }) {
  return (
    <>
      <path d={d} fill="none" strokeWidth={width + 2.5} />
      <path d={d} fill="none" stroke={color} strokeWidth={width} />
    </>
  );
}

const sparkle = (x: number, y: number, r: number) =>
  `M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z`;

const SHIELD_D = 'M16 2.5L27.5 6V15C27.5 22 22.5 26.5 16 29.5C9.5 26.5 4.5 22 4.5 15V6Z';

const FIGURE = (
  <>
    <path d="M7 29.5C7 21 10.5 16.5 16 16.5C21.5 16.5 25 21 25 29.5Z" fill={B} />
    <path d="M7 29.5C7 21 10.5 16.5 16 16.5V29.5Z" fill={H} stroke="none" />
    <path d="M7 29.5C7 21 10.5 16.5 16 16.5C21.5 16.5 25 21 25 29.5Z" fill="none" />
    <circle cx="16" cy="9" r="5.5" fill={GL} />
  </>
);

/** Dibujos propios de los poderes (además de los de StatIcons) */
const GLYPHS = {
  espada: SWORD_GLYPH,
  espadasCruzadas: (
    <>
      <g transform="matrix(-1 0 0 1 32 0)">{SWORD_GLYPH}</g>
      {SWORD_GLYPH}
    </>
  ),
  escudo: (
    <>
      <path d={SHIELD_D} fill={B} />
      <path d="M16 2.5L4.5 6V15C4.5 22 9.5 26.5 16 29.5Z" fill={H} stroke="none" />
      <path d={SHIELD_D} fill="none" />
      <path d="M16 6.5V25.5M8 13H24" fill="none" stroke={G} strokeWidth={2.25} />
      <circle cx="16" cy="13" r="3" fill={GL} strokeWidth={1.5} />
    </>
  ),
  figura: FIGURE,
  caida: (
    <>
      <path d="M3 27.5C3 23.5 6 21 11 21H27C29 21 30 22.5 30 24V27.5Z" fill={B} />
      <path d="M3 27.5C3 23.5 6 21 11 21H27V24H3Z" fill={H} stroke="none" />
      <path d="M3 27.5C3 23.5 6 21 11 21H27C29 21 30 22.5 30 24V27.5Z" fill="none" />
      <circle cx="7.5" cy="14.5" r="4.5" fill={GL} />
      <path d={sparkle(17, 8, 3.5)} fill={GL} strokeWidth={1.25} />
      <path d={sparkle(25, 12, 2.5)} fill={GL} strokeWidth={1.25} />
    </>
  ),
  espiral: (
    <Line d="M16 16.5C16 14.8 18.6 14.8 18.6 16.8C18.6 19.6 15.2 20.6 13 18.8C10.4 16.6 11.4 11.5 15.6 11.2C20.5 10.8 23.6 14.6 23 19C22.3 24 17 26.4 12.6 25.2C7.6 23.8 5.6 18.5 6.8 13.8C8.2 8.4 13.4 5.6 18.6 6.2" color={GL} width={2.25} />
  ),
  estrellas: (
    <>
      <ellipse cx="16" cy="18" rx="12.5" ry="5" fill="none" stroke={GD} strokeWidth={2} />
      <path d={sparkle(6, 13, 4.5)} fill={GL} strokeWidth={1.5} />
      <path d={sparkle(16, 7, 5.5)} fill={GL} strokeWidth={1.5} />
      <path d={sparkle(26, 13, 4.5)} fill={GL} strokeWidth={1.5} />
      <path d={sparkle(16, 23, 4)} fill={G} strokeWidth={1.5} />
    </>
  ),
  cadena: (
    <>
      <rect x="2.5" y="11" width="15" height="10" rx="5" fill="none" strokeWidth={5.5} />
      <rect x="2.5" y="11" width="15" height="10" rx="5" fill="none" stroke={GD} strokeWidth={2.5} />
      <rect x="14.5" y="11" width="15" height="10" rx="5" fill="none" strokeWidth={5.5} />
      <rect x="14.5" y="11" width="15" height="10" rx="5" fill="none" stroke={G} strokeWidth={2.5} />
      <path d="M14.5 16H17.5" fill="none" stroke={GD} strokeWidth={2.5} />
    </>
  ),
  calavera: (
    <>
      <path d="M16 3C9.5 3 5 7.5 5 13.5C5 17.5 7 20 9.5 21V26.5C9.5 28 10.5 29 12 29H20C21.5 29 22.5 28 22.5 26.5V21C25 20 27 17.5 27 13.5C27 7.5 22.5 3 16 3Z" fill={BONE} />
      <path d="M8.5 13.5C8.5 9 11.5 6.5 15 6" fill="none" stroke="#fff" strokeWidth={2} />
      <circle cx="11.5" cy="15" r="3" fill={O} stroke="none" />
      <circle cx="20.5" cy="15" r="3" fill={O} stroke="none" />
      <path d="M16 18.5L14.5 21.5H17.5Z" fill={O} strokeWidth={1} />
      <path d="M13 24.5V29M16 24.5V29M19 24.5V29" fill="none" strokeWidth={1.5} />
    </>
  ),
  grito: (
    <>
      <path d="M3 12.5H9L17 6V26L9 19.5H3Z" fill={B} />
      <path d="M3 12.5H9L17 6V16H3Z" fill={H} stroke="none" />
      <path d="M3 12.5H9L17 6V26L9 19.5H3Z" fill="none" />
      <Line d="M21 11.5C23 13.5 23 18.5 21 20.5" color={GL} width={2} />
      <Line d="M25 8C28.5 11.5 28.5 20.5 25 24" color={G} width={2} />
    </>
  ),
  w: (
    <path d="M2.5 6H11L16 19L21 6H29.5L23 27H17.5L16 22.5L14.5 27H9Z" fill={G} />
  ),
  gota: (
    <>
      <path d="M16 3C19.5 9 25 14 25 20.5C25 25.5 21 29.5 16 29.5C11 29.5 7 25.5 7 20.5C7 14 12.5 9 16 3Z" fill={RED} />
      <path d="M11.5 20C11.5 17.5 13 15 14.5 13.5" fill="none" stroke={RED_L} strokeWidth={2.5} />
    </>
  ),
  muro: (
    <>
      <rect x="3" y="8" width="26" height="20" rx="1.5" fill={B} />
      <rect x="3" y="8" width="26" height="6.5" fill={H} stroke="none" />
      <rect x="3" y="8" width="26" height="20" rx="1.5" fill="none" />
      <path d="M3 14.5H29M3 21H29M11 8V14.5M21 8V14.5M7 14.5V21M16 14.5V21M25 14.5V21M11 21V28M21 21V28" fill="none" strokeWidth={1.75} />
      <path d="M3 8L6 3.5L9 8M13 8L16 3.5L19 8M23 8L26 3.5L29 8" fill={G} strokeWidth={1.75} />
    </>
  ),
  giro: (
    <>
      <path d="M27 16A11 11 0 1 1 22 6.8" fill="none" strokeWidth={5.5} />
      <path d="M27 16A11 11 0 1 1 22 6.8" fill="none" stroke={GL} strokeWidth={2.75} />
      <path d="M18.5 3L26.5 5L22.5 11.5Z" fill={GL} strokeWidth={1.75} />
      <g transform="translate(8 8) scale(0.5)">{SWORD_GLYPH}</g>
    </>
  ),
  bandera: (
    <>
      <Line d="M7 29.5V3" color={GD} width={2.5} />
      <path d="M8.5 4.5H27L22.5 10.5L27 16.5H8.5Z" fill={RED} />
      <path d="M8.5 4.5H27L24.8 7.5H8.5Z" fill={RED_L} stroke="none" />
      <path d="M8.5 4.5H27L22.5 10.5L27 16.5H8.5Z" fill="none" />
      <circle cx="7" cy="3" r="2" fill={G} strokeWidth={1.5} />
    </>
  ),
  area: (
    <>
      <circle cx="16" cy="16" r="13" fill="none" stroke={GD} strokeWidth={2} strokeDasharray="4 3" />
      <circle cx="16" cy="16" r="8.5" fill="none" stroke={G} strokeWidth={2} />
      <circle cx="16" cy="16" r="3.5" fill={GL} strokeWidth={1.5} />
    </>
  ),
  arco: (
    <>
      <path d="M8 3C20 6 26 13 26 16C26 19 20 26 8 29" fill="none" strokeWidth={5.5} />
      <path d="M8 3C20 6 26 13 26 16C26 19 20 26 8 29" fill="none" stroke={GD} strokeWidth={3} />
      <path d="M8 3V29" fill="none" stroke={GL} strokeWidth={1.25} />
      <Line d="M5 16H24" color={B} width={2} />
      <path d="M30 16L23.5 12V20Z" fill={H} />
      <path d="M2 13L6 16L2 19" fill={G} strokeWidth={1.5} />
    </>
  ),
  hacha: (
    <>
      <Line d="M6 29L22 9" color={GD} width={2.5} />
      <path d="M15 5.5C19 1.5 26 1.5 29.5 6C27 8 26 12 27.5 16.5C22.5 17 18.5 14.5 16.5 11Z" fill={B} />
      <path d="M15 5.5C19 1.5 26 1.5 29.5 6C25 6 20.5 7.5 16.5 11Z" fill={H} stroke="none" />
      <path d="M15 5.5C19 1.5 26 1.5 29.5 6C27 8 26 12 27.5 16.5C22.5 17 18.5 14.5 16.5 11Z" fill="none" />
      <path d="M29.5 6C27 8 26 12 27.5 16.5" fill="none" stroke={GL} strokeWidth={1.5} />
    </>
  ),
  pata: (
    <>
      <path d="M16 15C20.5 15 25 20 25 24C25 27.5 22 28.5 19.5 27.5C17.5 26.8 14.5 26.8 12.5 27.5C10 28.5 7 27.5 7 24C7 20 11.5 15 16 15Z" fill={GD} />
      <ellipse cx="7" cy="12.5" rx="3" ry="4" fill={G} />
      <ellipse cx="12.5" cy="7" rx="3" ry="4" fill={G} />
      <ellipse cx="19.5" cy="7" rx="3" ry="4" fill={G} />
      <ellipse cx="25" cy="12.5" rx="3" ry="4" fill={G} />
    </>
  ),
  tornado: (
    <>
      <Line d="M4 6H28" color={GL} width={2.5} />
      <Line d="M7 11.5H25" color={GL} width={2.5} />
      <Line d="M10 17H22" color={G} width={2.5} />
      <Line d="M12.5 22H19.5" color={G} width={2.5} />
      <Line d="M15 27H17.5" color={GD} width={2.5} />
    </>
  ),
  meteoro: (
    <>
      <path d="M3 3C9 7 14 10 19 13L13 19C10 14 7 9 3 3Z" fill="#f5b85f" strokeWidth={1.5} />
      <path d="M8 3C12 7 16 10 20 12.5M3 8C7 12 10 16 12.5 20" fill="none" stroke="#e07b39" strokeWidth={2} />
      <circle cx="20" cy="20" r="9" fill={GD} />
      <path d="M13 18C14 14 17 12 20.5 12" fill="none" stroke={GL} strokeWidth={2} />
      <circle cx="22.5" cy="22" r="2" fill={B} strokeWidth={1.25} />
      <circle cx="17.5" cy="24.5" r="1.3" fill={B} strokeWidth={1} />
    </>
  ),
  cristal: (
    <>
      <path d="M6 28L4 14L9 8L12 28Z" fill="#7cc4e0" />
      <path d="M12 28L13 6L16.5 2L20 6L21 28Z" fill="#a9dcef" />
      <path d="M13 6L16.5 2V28H12Z" fill="#d3f0fa" stroke="none" />
      <path d="M12 28L13 6L16.5 2L20 6L21 28Z" fill="none" />
      <path d="M21 28L23 10L28 15L27 28Z" fill="#7cc4e0" />
      <path d="M2.5 28.5H29.5" fill="none" strokeWidth={2.5} />
    </>
  ),
  hiedra: (
    <>
      <Line d="M9 30C9 22 22 21 22 13C22 8 17 5 12 7" color="#3d7a4a" width={2.5} />
      <path d="M9 22C4 22 3 17 3 15C7 15 10 17 9 22Z" fill="#5aa36a" strokeWidth={1.5} />
      <path d="M22 17C27 17 29 13 29 11C25 11 22 13 22 17Z" fill="#5aa36a" strokeWidth={1.5} />
      <path d="M15 9C14 5 16 2 18 1.5C19.5 4 18.5 7 15 9Z" fill="#5aa36a" strokeWidth={1.5} />
      <path d="M14 20L11 19M19 16L21.5 18M20 10L23 9" fill="none" strokeWidth={1.5} />
    </>
  ),
  insecto: (
    <>
      <path d="M9 9L5 4M23 9L27 4M8 17H3M24 17H29M9 24L5 28M23 24L27 28" fill="none" strokeWidth={2} />
      <ellipse cx="16" cy="19" rx="8.5" ry="10" fill={B} />
      <path d="M16 9V29" fill="none" strokeWidth={1.5} />
      <path d="M16 9C11 9 7.5 13 7.5 19C7.5 22 9 25 11 27L16 19Z" fill={H} stroke="none" />
      <circle cx="16" cy="8" r="4" fill={GD} />
      <circle cx="12" cy="17" r="1.5" fill={G} stroke="none" />
      <circle cx="20" cy="21" r="1.5" fill={G} stroke="none" />
    </>
  ),
  demonio: (
    <>
      <path d="M8 11C4 9 3 4 4 2C6 5 9 6 11 7.5M24 11C28 9 29 4 28 2C26 5 23 6 21 7.5" fill={BONE} strokeWidth={1.75} />
      <path d="M16 6C22.5 6 26 11 26 17C26 24 21 29.5 16 29.5C11 29.5 6 24 6 17C6 11 9.5 6 16 6Z" fill={RED} />
      <path d="M9.5 17C9.5 12 12 9 15 8.5" fill="none" stroke={RED_L} strokeWidth={2} />
      <path d="M10 16L14.5 18L10 19.5Z M22 16L17.5 18L22 19.5Z" fill="#f2cf5b" strokeWidth={1.25} />
      <path d="M12 24C14.5 25.5 17.5 25.5 20 24" fill="none" strokeWidth={1.75} />
    </>
  ),
  portal: (
    <>
      <ellipse cx="16" cy="16" rx="10.5" ry="14" fill="#8a5ac2" />
      <ellipse cx="16" cy="16" rx="6.5" ry="9.5" fill="#c4a6ea" strokeWidth={1.5} />
      <path d="M16 10C19 11 19.5 15 16 16.5C13 17.5 12.5 21 15.5 22" fill="none" stroke="#fff" strokeWidth={1.75} />
      <ellipse cx="16" cy="16" rx="10.5" ry="14" fill="none" stroke={G} strokeWidth={1} />
    </>
  ),
  cuerno: (
    <>
      <path d="M4 25C6 15 14 7 26 4L28.5 9C19 12 13.5 19 10.5 27.5Z" fill={BONE} />
      <path d="M4 25C6 15 14 7 26 4L26.8 6C16 9.5 9 17 6 26Z" fill="#fff" stroke="none" />
      <path d="M4 25C6 15 14 7 26 4L28.5 9C19 12 13.5 19 10.5 27.5Z" fill="none" />
      <path d="M26 4L28.5 9" fill="none" stroke={G} strokeWidth={4} />
      <path d="M9 18L13.5 21M13.5 12.5L17.5 16" fill="none" stroke={GD} strokeWidth={2} />
    </>
  ),
  invisible: (
    <>
      <path d="M7 29.5C7 21 10.5 16.5 16 16.5C21.5 16.5 25 21 25 29.5Z" fill="none" stroke={GL} strokeWidth={2} strokeDasharray="3 2.5" />
      <circle cx="16" cy="9" r="5.5" fill="none" stroke={GL} strokeWidth={2} strokeDasharray="3 2.5" />
      <path d={sparkle(26, 7, 3.5)} fill={GL} strokeWidth={1.25} />
    </>
  ),
  cupula: (
    <>
      <path d="M3 25C3 14 9 7 16 7C23 7 29 14 29 25Z" fill="#7cc4e0" opacity={0.85} />
      <path d="M8 20C8 15 11 11 15 10" fill="none" stroke="#d3f0fa" strokeWidth={2} />
      <path d="M3 25C3 14 9 7 16 7C23 7 29 14 29 25Z" fill="none" />
      <rect x="1.5" y="25" width="29" height="4" rx="1" fill={G} />
      <circle cx="16" cy="20" r="2.5" fill={B} strokeWidth={1.25} />
    </>
  ),
  luna: (
    <>
      <path d="M20 3C13 4 8 10 8 17C8 24 14 29.5 21 29.5C24 29.5 26.5 28.5 28.5 27C20 27 14.5 21.5 14.5 15C14.5 10 17 5.5 20 3Z" fill="#5a4a8a" />
      <path d="M11.5 17C11.5 12 14 8 17 6" fill="none" stroke="#9d8ad0" strokeWidth={2} />
      <path d={sparkle(24, 9, 3)} fill={GL} strokeWidth={1.25} />
      <path d={sparkle(27, 17, 2.2)} fill={GL} strokeWidth={1.25} />
    </>
  ),
  mano: (
    <>
      <path d="M9 30V17L6 12C5 10 7 8.5 8.5 10L11 13V5C11 3.5 13.5 3.5 13.5 5V12V3.5C13.5 2 16 2 16 3.5V12V4.5C16 3 18.5 3 18.5 4.5V12.5V7C18.5 5.5 21 5.5 21 7V19C21 23 19 25 18 26V30Z" fill={BONE} />
      <path d="M11 13V5M13.5 12V3.5M16 12V4.5" fill="none" stroke="#fff" strokeWidth={1} />
    </>
  ),
  viento: (
    <>
      <Line d="M3 11H19C22 11 23.5 8.5 22.5 6.5C21.5 4.5 18.5 4.5 17.5 6.5" color={GL} width={2.25} />
      <Line d="M3 17H25C28 17 29.5 19.5 28.5 21.5C27.5 23.5 24.5 23.5 23.5 21.5" color={GL} width={2.25} />
      <Line d="M6 23H15C17.5 23 18.5 25 17.5 26.5" color={G} width={2.25} />
    </>
  ),
  roca: (
    <>
      <path d="M4 26L6 13L13 6L24 7L29 16L27 26Z" fill={GD} />
      <path d="M6 13L13 6L24 7L20 13L11 15Z" fill={GL} stroke="none" opacity={0.6} />
      <path d="M4 26L6 13L13 6L24 7L29 16L27 26Z" fill="none" />
      <path d="M11 15L20 13L24 7M20 13L22 26" fill="none" strokeWidth={1.5} />
    </>
  ),
  orbe: (
    <>
      <circle cx="16" cy="16" r="11" fill="#3f7fc4" />
      <circle cx="16" cy="16" r="6" fill="#86b9ea" stroke="none" />
      <circle cx="13" cy="12.5" r="2.5" fill="#fff" stroke="none" />
      <circle cx="16" cy="16" r="11" fill="none" />
      <path d={sparkle(27, 5, 3)} fill={GL} strokeWidth={1.25} />
      <path d={sparkle(5, 26, 2.5)} fill={GL} strokeWidth={1.25} />
    </>
  ),
  abrojo: (
    <>
      <path d="M16 3L18.5 13L29 16L18.5 19L16 29L13.5 19L3 16L13.5 13Z" fill={H} />
      <path d="M16 3L18.5 13L16 16L13.5 13Z M3 16L13.5 13L16 16L13.5 19Z" fill={BONE} stroke="none" opacity={0.6} />
      <path d="M16 3L18.5 13L29 16L18.5 19L16 29L13.5 19L3 16L13.5 13Z" fill="none" />
      <circle cx="16" cy="16" r="2.5" fill={G} strokeWidth={1.25} />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type PowerGlyph = keyof typeof GLYPHS | StatIconId;

function glyph(id: PowerGlyph): ReactNode {
  return (GLYPHS as Record<string, ReactNode>)[id] ?? STAT_GLYPHS[id as StatIconId];
}

/** Medallas de la esquina que no son un dibujo entero */
const BADGES: Record<'arriba' | 'abajo' | 'no', { fill: string; d: string }> = {
  arriba: { fill: '#5aa36a', d: 'M10.5 19.5L16 13L21.5 19.5' },
  abajo: { fill: RED, d: 'M10.5 13L16 19.5L21.5 13' },
  no: { fill: RED, d: 'M11 11L21 21' },
};

export type PowerBadge = keyof typeof BADGES | PowerGlyph;

export interface PowerIconSpec {
  bg: PowerBg;
  glyph: PowerGlyph;
  badge?: PowerBadge;
}

/** Ícono cuadrado de un poder o disciplina */
export function PowerIcon({ spec, className = 'w-10 h-10' }: { spec: PowerIconSpec; className?: string }) {
  const uid = useId().replace(/:/g, '');
  const [c1, c2] = BG[spec.bg];
  const simple = spec.badge ? BADGES[spec.badge as keyof typeof BADGES] : undefined;
  return (
    <svg viewBox="0 0 40 40" className={className} stroke={O} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" aria-hidden>
      <defs>
        <radialGradient id={`pg${uid}`} cx="35%" cy="25%" r="85%">
          <stop offset="0" stopColor={c1} />
          <stop offset="1" stopColor={c2} />
        </radialGradient>
      </defs>
      <rect x="0.5" y="0.5" width="39" height="39" rx="6" fill={`url(#pg${uid})`} stroke="none" />
      {spec.bg === 'pasivo' && <rect x="2" y="2" width="36" height="36" rx="4.5" fill="none" stroke={G} strokeWidth={1} opacity={0.7} />}
      <g transform={spec.badge ? 'translate(3 2.5) scale(0.88)' : 'translate(4 4)'}>{glyph(spec.glyph)}</g>
      {spec.badge && (
        <g transform="translate(23 23)">
          <circle cx="8" cy="8" r="8" fill={simple?.fill ?? '#f4efe2'} strokeWidth={1.5} />
          {simple ? (
            <path d={simple.d} transform="scale(0.5)" fill="none" stroke="#fff" strokeWidth={5} />
          ) : (
            <g transform="translate(2 2) scale(0.375)" strokeWidth={2.5}>{glyph(spec.badge as PowerGlyph)}</g>
          )}
        </g>
      )}
    </svg>
  );
}
