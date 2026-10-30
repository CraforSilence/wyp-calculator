import type { ReactNode } from 'react';
import type { DamageTypeName } from '@/types/weapon';
import { bonusIconId } from '@/lib/bonusDisplay';

// Íconos de tipos de daño y de bonus, en el estilo del logo (contorno navy, pizarra y dorado)
// con colores propios para los elementos. Van en línea con el texto: por defecto miden 1.2em.

const O = '#071f2e';  // contorno
const B = '#2c4857';  // cuerpo
const H = '#4d6b7a';  // cara iluminada
const G = '#cba76f';  // dorado
const GL = '#e5c58b'; // dorado claro
const GD = '#a99167'; // dorado oscuro
const FIRE = '#e07b39', FIRE_L = '#f5b85f';
const ICE = '#7cc4e0', ICE_L = '#d3f0fa';
const BOLT = '#f2cf5b';
const RED = '#c8524a', RED_L = '#e5857a';
const MANA = '#3f7fc4', MANA_L = '#86b9ea';
const HEAL = '#5aa36a';

export type StatIconId =
  | DamageTypeName
  | 'fuerza' | 'destreza' | 'inteligencia' | 'constitucion' | 'concentracion' | 'atributoClase'
  | 'critChance' | 'critDmg'
  | 'attackSpeed' | 'castSpeed' | 'moveSpeed'
  | 'resistFisico' | 'resistMagico' | 'armadura' | 'bloqueo' | 'reduccionMelee' | 'reduccionRango'
  | 'vida' | 'mana' | 'rango' | 'curacion' | 'weaponDmg';

const DEFAULT_CLASS = 'inline-block w-[1.2em] h-[1.2em] align-[-0.25em] shrink-0';

export function StatIcon({ id, className = DEFAULT_CLASS, title }: { id: StatIconId; className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      stroke={O}
      strokeWidth={2}
      strokeLinejoin="round"
      strokeLinecap="round"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      {STAT_GLYPHS[id]}
    </svg>
  );
}

export function DamageIcon({ type, className, title }: { type: DamageTypeName; className?: string; title?: string }) {
  return <StatIcon id={type} className={className} title={title} />;
}

/** Ícono de un bonus por su clave (de arma, armadura, joyería o muesca). Nada si no tiene. */
export function BonusIcon({ bonus, className }: { bonus: string; className?: string }) {
  const id = bonusIconId(bonus);
  return id ? <StatIcon id={id} className={className} /> : null;
}

// ── Piezas ─────────────────────────────────────────────────────────────────

function Line({ d, color, width }: { d: string; color: string; width: number }) {
  return (
    <>
      <path d={d} fill="none" strokeWidth={width + 2.5} />
      <path d={d} fill="none" stroke={color} strokeWidth={width} />
    </>
  );
}

const star = (cx: number, cy: number, points: number, outer: number, inner: number, rot = -90) =>
  Array.from({ length: points * 2 }, (_, i) => {
    const r = i % 2 ? inner : outer;
    const a = ((rot + (i * 180) / points) * Math.PI) / 180;
    return `${i ? 'L' : 'M'}${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;
  }).join('') + 'Z';

const sparkle = (x: number, y: number, r: number) =>
  `M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z`;

// Espada en diagonal, punta arriba a la derecha.
export const SWORD_GLYPH = (
  <>
    <path d="M9.5 19L23 5.5L28 4L26.5 9L13 22.5Z" fill={B} />
    <path d="M9.5 19L23 5.5L28 4L11 21Z" fill={H} stroke="none" />
    <path d="M9.5 19L23 5.5L28 4L26.5 9L13 22.5Z" fill="none" />
    <Line d="M11 21L6 26" color={GD} width={2.5} />
    <Line d="M6.5 16.5L15.5 25.5" color={G} width={2.5} />
    <circle cx="4.5" cy="27.5" r="2" fill={G} strokeWidth={1.5} />
  </>
);

// Flecha en diagonal, punta arriba a la derecha.
const ARROW = (
  <>
    <Line d="M6 26L21 11" color={GD} width={2.75} />
    <path d="M29 3L25 15L21 11L17 7Z" fill={H} />
    <path d="M9 23L5 23L2.5 25.5L6 26Z" fill={G} strokeWidth={1.5} />
    <path d="M9 23L9 27L6.5 29.5L6 26Z" fill={G} strokeWidth={1.5} />
  </>
);

const SHIELD_D = 'M16 2.5L27.5 6V15C27.5 22 22.5 26.5 16 29.5C9.5 26.5 4.5 22 4.5 15V6Z';
const shield = (emblem: ReactNode) => (
  <>
    <path d={SHIELD_D} fill={B} />
    <path d="M16 2.5L4.5 6V15C4.5 22 9.5 26.5 16 29.5Z" fill={H} stroke="none" />
    <path d={SHIELD_D} fill="none" />
    {emblem}
  </>
);

// Medalla chica abajo a la derecha (para "reduce" y "aumenta").
const badge = (symbol: string) => (
  <>
    <circle cx="24.5" cy="24.5" r="6.5" fill={G} />
    <path d={symbol} fill="none" strokeWidth={2.25} />
  </>
);
const MINUS = 'M21.5 24.5H27.5';
const UP = 'M21.5 26L24.5 22.5L27.5 26';

const HEART_D = 'M16 28C9 23 3 18 3 11.5C3 7 6.5 4 10 4C12.8 4 14.8 5.6 16 7.8C17.2 5.6 19.2 4 22 4C25.5 4 29 7 29 11.5C29 18 23 23 16 28Z';
const heart = (fill: string, light: string, extra?: ReactNode) => (
  <>
    <path d={HEART_D} fill={fill} />
    <path d="M10 7.5C7.5 7.5 6 9.5 6 12" fill="none" stroke={light} strokeWidth={2.5} />
    {extra}
  </>
);

const burst = (fill: string, inner: string, extra?: ReactNode) => (
  <>
    <path d={star(16, 16, 8, 14.5, 7)} fill={fill} />
    <path d={star(16, 16, 8, 8, 4, -67.5)} fill={inner} stroke="none" />
    {extra}
  </>
);

const snowflake = (() => {
  const arms: string[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    const p = (r: number, da = 0) => `${(16 + r * Math.sin(a + da)).toFixed(2)} ${(16 - r * Math.cos(a + da)).toFixed(2)}`;
    arms.push(`M16 16L${p(13)}`, `M${p(8)}L${p(11, 0.35)}`, `M${p(8)}L${p(11, -0.35)}`);
  }
  return arms.join('');
})();

// ── Íconos ─────────────────────────────────────────────────────────────────

/** Dibujos sueltos (viewBox 32), para armar otros íconos como los de poderes */
export const STAT_GLYPHS: Record<StatIconId, ReactNode> = {
  // Daño
  punzante: ARROW,
  cortante: (
    <>
      <path d="M8 23C13 18 19 11 28 3C27 12 21 19 11 26Z" fill={B} />
      <path d="M8 23C13 18 19 11 28 3C22 11 16 18 9.5 24.5Z" fill={H} stroke="none" />
      <path d="M8 23C13 18 19 11 28 3C27 12 21 19 11 26Z" fill="none" />
      <Line d="M5 20L14 29" color={G} width={2.5} />
      <Line d="M9.5 24.5L4 30" color={GD} width={2.5} />
    </>
  ),
  aplastante: (
    <>
      <Line d="M6 29L17 15" color={GD} width={2.5} />
      <g transform="rotate(38 19 11)">
        <rect x="10" y="5.5" width="18" height="11" rx="1.5" fill={B} />
        <rect x="10" y="5.5" width="18" height="5" fill={H} stroke="none" />
        <rect x="10" y="5.5" width="18" height="11" rx="1.5" fill="none" />
        <rect x="17" y="5.5" width="4" height="11" fill={G} strokeWidth={1.5} />
      </g>
    </>
  ),
  fuego: (
    <>
      <path d="M16 2C18 8 25.5 10.5 25.5 19C25.5 25 21.5 29.5 16 29.5C10.5 29.5 6.5 25 6.5 19C6.5 14 9.5 11.5 11 7.5C13 10.5 13 12.5 13.5 14C15 10 15 6.5 16 2Z" fill={FIRE} />
      <path d="M16 13C17.5 17 21.5 18.5 21.5 22.5C21.5 25.5 19 27.5 16 27.5C13 27.5 10.5 25.5 10.5 22.5C10.5 19.5 12.5 18 14 16C15 17.5 15.5 15.5 16 13Z" fill={FIRE_L} stroke="none" />
      <path d="M16 20C17 22 18.5 22.5 18.5 24.5C18.5 26 17.5 27 16 27C14.5 27 13.5 26 13.5 24.5C13.5 22.5 15 22 16 20Z" fill={GL} stroke="none" />
    </>
  ),
  hielo: (
    <>
      <path d={snowflake} fill="none" strokeWidth={5} />
      <path d={snowflake} fill="none" stroke={ICE} strokeWidth={2.25} />
      <path d={star(16, 16, 6, 4.5, 4.5, -90)} fill={ICE_L} strokeWidth={1.5} />
    </>
  ),
  electrico: (
    <>
      <path d="M19.5 2L6.5 18H15L12 30L25.5 12.5H17Z" fill={BOLT} />
      <path d="M19.5 2L6.5 18H11L17 8Z" fill={GL} stroke="none" />
      <path d="M19.5 2L6.5 18H15L12 30L25.5 12.5H17Z" fill="none" />
    </>
  ),

  // Atributos
  // Puño cerrado (guantelete)
  fuerza: (
    <>
      <path d="M8 15H25V22C25 26 22 28.5 18 28.5H14C10.5 28.5 8 26 8 22.5Z" fill={B} />
      {[7.5, 12, 16.5, 21].map((x) => <rect key={x} x={x} y="5" width="4.5" height="12" rx="2.25" fill={H} />)}
      <path d="M4.5 16C4.5 13 7 12 9.5 13.5L18.5 18C20.5 19 20 22.5 17.5 22.5H10C6.5 22.5 4.5 19.5 4.5 16Z" fill={H} />
      <rect x="10" y="26.5" width="13" height="4" rx="1" fill={G} />
    </>
  ),
  destreza: (
    <>
      <circle cx="14" cy="18" r="11.5" fill={B} />
      <circle cx="14" cy="18" r="7.5" fill="none" stroke={G} strokeWidth={2.5} />
      <circle cx="14" cy="18" r="3" fill={GL} strokeWidth={1.5} />
      <Line d="M14 18L25 7" color={GD} width={2} />
      <path d="M24 4L30 4L28 8L22 10Z" fill={G} strokeWidth={1.5} />
    </>
  ),
  inteligencia: (
    <>
      <path d="M2.5 9V27C8 25.5 12 26 16 28.5C20 26 24 25.5 29.5 27V9Z" fill={B} />
      <path d="M16 8C12.5 5.5 8 5 4.5 6V24C8 23 12.5 23.5 16 26Z" fill={GL} />
      <path d="M16 8C19.5 5.5 24 5 27.5 6V24C24 23 19.5 23.5 16 26Z" fill={G} />
      <path d="M7.5 11C10 10.5 12 11 13.5 12M7.5 15C10 14.5 12 15 13.5 16M18.5 12C20 11 22 10.5 24.5 11M18.5 16C20 15 22 14.5 24.5 15" fill="none" strokeWidth={1.5} />
    </>
  ),
  constitucion: shield(
    <path d="M16 23C12 20 9 17.5 9 14C9 11.5 11 10 12.8 10C14.3 10 15.4 10.9 16 12C16.6 10.9 17.7 10 19.2 10C21 10 23 11.5 23 14C23 17.5 20 20 16 23Z" fill={RED} strokeWidth={1.5} />,
  ),
  concentracion: (
    <>
      <path d="M2.5 16C7.5 8 24.5 8 29.5 16C24.5 24 7.5 24 2.5 16Z" fill={GL} />
      <circle cx="16" cy="16" r="5.5" fill={B} />
      <circle cx="16" cy="16" r="2.2" fill={O} stroke="none" />
      <circle cx="14" cy="14" r="1.3" fill={ICE_L} stroke="none" />
      <path d={sparkle(16, 4, 3)} fill={G} strokeWidth={1.25} />
    </>
  ),
  atributoClase: (
    <>
      <path d={star(16, 16.5, 5, 14, 6)} fill={G} />
      <path d={star(16, 16.5, 5, 7, 3)} fill={GL} stroke="none" />
    </>
  ),

  // Crítico
  critChance: burst(G, GL),
  critDmg: burst(RED, RED_L, (
    <>
      <path d="M16 9.5V17.5" fill="none" strokeWidth={3} />
      <circle cx="16" cy="21.5" r="1.6" fill={O} stroke="none" />
    </>
  )),

  // Velocidad
  attackSpeed: (
    <>
      {SWORD_GLYPH}
      <path d="M3 9H10M2 13H7M6 5H12" fill="none" stroke={GL} strokeWidth={2} />
    </>
  ),
  castSpeed: (
    <>
      <path d="M8.5 6.5H23.5C23.5 12 18 14 18 16C18 18 23.5 20 23.5 25.5H8.5C8.5 20 14 18 14 16C14 14 8.5 12 8.5 6.5Z" fill={B} />
      <path d="M11 9H21C20 12 17 13.5 16 15C15 13.5 12 12 11 9Z" fill={GL} stroke="none" />
      <path d="M10.5 25C11.5 21.5 15 20 16 19C17 20 20.5 21.5 21.5 25Z" fill={GL} stroke="none" />
      <rect x="6" y="3" width="20" height="4" rx="1.2" fill={G} />
      <rect x="6" y="25" width="20" height="4" rx="1.2" fill={G} />
      <path d={sparkle(28.5, 16, 3.5)} fill={GL} strokeWidth={1.25} />
    </>
  ),
  moveSpeed: (
    <>
      <path d="M2 11C3 8 7 6.5 10 8L9.5 16C7 13.5 4 12.5 2 14Z" fill={GL} strokeWidth={1.5} />
      <path d="M10 4H18V18L26 21C28.5 22 29.5 24 29.5 27H10Z" fill={B} />
      <path d="M10 4H14V27H10Z" fill={H} stroke="none" />
      <path d="M10 4H18V18L26 21C28.5 22 29.5 24 29.5 27H10Z" fill="none" />
      <path d="M10.5 9H17.5" stroke={G} strokeWidth={2} />
      <rect x="9" y="26" width="21" height="3.5" rx="1" fill={G} />
    </>
  ),

  // Defensa
  resistFisico: shield(
    <>
      <Line d="M16 8V20" color={G} width={2.5} />
      <Line d="M12 18.5H20" color={G} width={2.5} />
      <Line d="M16 21V24" color={GD} width={2} />
    </>,
  ),
  resistMagico: shield(<path d={sparkle(16, 15, 7.5)} fill={GL} strokeWidth={1.5} />),
  armadura: shield(<Line d="M16 9.5V21.5M10 15.5H22" color={G} width={3} />),
  bloqueo: (
    <>
      <circle cx="13" cy="16" r="11.5" fill={B} />
      <path d="M13 4.5A11.5 11.5 0 0 0 13 27.5Z" fill={H} stroke="none" />
      <circle cx="13" cy="16" r="11.5" fill="none" />
      <circle cx="13" cy="16" r="8" fill="none" stroke={G} strokeWidth={1.75} />
      <circle cx="13" cy="16" r="3.5" fill={G} strokeWidth={1.5} />
      <path d="M27 8L30.5 5M28 16H31.5M27 24L30.5 27" fill="none" stroke={GL} strokeWidth={2} />
    </>
  ),
  reduccionMelee: <>{SWORD_GLYPH}{badge(MINUS)}</>,
  reduccionRango: <>{ARROW}{badge(MINUS)}</>,

  // Otros
  vida: heart(RED, RED_L),
  mana: (
    <>
      <path d="M16 2.5C19 8 25.5 13.5 25.5 20C25.5 25.5 21.5 29.5 16 29.5C10.5 29.5 6.5 25.5 6.5 20C6.5 13.5 13 8 16 2.5Z" fill={MANA} />
      <path d="M11 19C11 16.5 12.5 14 14 12.5" fill="none" stroke={MANA_L} strokeWidth={2.5} />
    </>
  ),
  rango: (
    <>
      <Line d="M5 13H27" color={GL} width={2} />
      <path d="M2 13L8 8.5V17.5Z" fill={G} />
      <path d="M30 13L24 8.5V17.5Z" fill={G} />
      <rect x="4" y="21" width="24" height="7" rx="1" fill={B} />
      <path d="M9 21V24.5M14 21V26M19 21V24.5M24 21V26" fill="none" strokeWidth={1.5} />
    </>
  ),
  curacion: heart(HEAL, '#8fd19c', <Line d="M16 11V20M11.5 15.5H20.5" color="#f4f1e8" width={2.5} />),
  weaponDmg: <>{SWORD_GLYPH}{badge(UP)}</>,
};
