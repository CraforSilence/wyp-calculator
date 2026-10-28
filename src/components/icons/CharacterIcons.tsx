import type { ReactNode } from 'react';
import type { Clase, Subclase } from '@/types/character';

// Íconos de clase y subclase en el estilo del logo: planos, contorno navy grueso, cuerpo
// pizarra con una cara más clara y detalles dorados. Colores sacados de public/logo/.
const O = '#071f2e';  // contorno
const B = '#2c4857';  // cuerpo
const H = '#4d6b7a';  // cara iluminada
const G = '#cba76f';  // dorado
const GL = '#e5c58b'; // dorado claro
const GD = '#a99167'; // dorado oscuro (mangos)

export function ClassIcon({ clase, className = 'w-8 h-8' }: { clase: Clase; className?: string }) {
  return <IconFrame className={className}>{CLASS_ICONS[clase]}</IconFrame>;
}

export function SubclassIcon({ subclase, className = 'w-8 h-8' }: { subclase: Subclase; className?: string }) {
  return <IconFrame className={className}>{ICONS[subclase]}</IconFrame>;
}

function IconFrame({ className, children }: { className: string; children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      stroke={O}
      strokeWidth={2.5}
      strokeLinejoin="round"
      strokeLinecap="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

// Línea con contorno: una pasada gruesa navy y encima una fina del color.
function Line({ d, color, width }: { d: string; color: string; width: number }) {
  return (
    <>
      <path d={d} fill="none" strokeWidth={width + 3} />
      <path d={d} fill="none" stroke={color} strokeWidth={width} />
    </>
  );
}

// Destello de 4 puntas centrado en (x, y).
function Sparkle({ x, y, r }: { x: number; y: number; r: number }) {
  const d = `M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z`;
  return <path d={d} fill={GL} strokeWidth={1.5} />;
}

// Pluma de flecha con la punta en (x, y), rotada `rot` grados.
function Fletch({ x, y, rot = 0 }: { x: number; y: number; rot?: number }) {
  const d = `M${x} ${y}L${x + 3.5} ${y + 4}V${y + 10}L${x} ${y + 7.5}L${x - 3.5} ${y + 10}V${y + 4}Z`;
  return <path d={d} transform={`rotate(${rot} ${x} ${y})`} fill={G} strokeWidth={2} />;
}

// Espada en diagonal (punta arriba a la derecha), para las cruzadas del Guerrero.
const SWORD = (
  <>
    <path d="M17.5 41.5L49.5 9.5L58 6L54.5 14.5L22.5 46.5Z" fill={B} />
    <path d="M17.5 41.5L49.5 9.5L58 6L20 44Z" fill={H} stroke="none" />
    <path d="M17.5 41.5L49.5 9.5L58 6L54.5 14.5L22.5 46.5Z" fill="none" />
    <Line d="M20 44L11 53" color={GD} width={3.5} />
    <Line d="M13 37L27 51" color={G} width={4} />
    <circle cx="9" cy="55" r="3.5" fill={G} />
  </>
);

const CLASS_ICONS: Record<Clase, ReactNode> = {
  // Espadas cruzadas
  'Guerrero': (
    <>
      <g transform="translate(64 0) scale(-1 1)">{SWORD}</g>
      {SWORD}
      <circle cx="32" cy="29" r="3" fill={GL} strokeWidth={1.5} />
    </>
  ),
  // Carcaj con flechas
  'Arquero': (
    <g transform="rotate(14 32 34)">
      <Line d="M27 24L23 12M32 24V9M37 24L41 12" color={GD} width={2} />
      <Fletch x={22.5} y={5} rot={-18} />
      <Fletch x={32} y={2} />
      <Fletch x={41.5} y={5} rot={18} />
      <path d="M22 24H42L40 57C40 59.5 38.5 61 36 61H28C25.5 61 24 59.5 24 57Z" fill={B} />
      <path d="M22 24H32V61H28C25.5 61 24 59.5 24 57Z" fill={H} stroke="none" />
      <path d="M22 24H42L40 57C40 59.5 38.5 61 36 61H28C25.5 61 24 59.5 24 57Z" fill="none" />
      <path d="M23.3 34H40.7M23.9 51H40.1" stroke={G} strokeWidth={2.5} />
      <path d="M32 37.5L35 42.5L32 47.5L29 42.5Z" fill={GL} strokeWidth={1.5} />
      <rect x="20" y="20" width="24" height="6" rx="2" fill={G} />
    </g>
  ),
  // Sombrero de mago
  'Mago': (
    <>
      <ellipse cx="32" cy="47" rx="27" ry="8" fill={B} />
      <path d="M5 47A27 8 0 0 0 32 55V47Z" fill={H} stroke="none" />
      <ellipse cx="32" cy="47" rx="27" ry="8" fill="none" />
      <path d="M46 5C37 5 32 12 30 20L19 45H46L38 20C37 14 40 9 46 5Z" fill={B} />
      <path d="M46 5C37 5 32 12 30 20L19 45H32L34 20C35 13 39 8 46 5Z" fill={H} stroke="none" />
      <path d="M46 5C37 5 32 12 30 20L19 45H46L38 20C37 14 40 9 46 5Z" fill="none" />
      <path d="M21.5 38H43.5L46 45H19Z" fill={G} />
      <rect x="29" y="37.5" width="7" height="7.5" rx="1" fill={GL} strokeWidth={1.75} />
      <rect x="31" y="39.5" width="3" height="3.5" fill={B} strokeWidth={1} />
      <Sparkle x={34} y={28} r={4.5} />
      <Sparkle x={12} y={20} r={5} />
      <Sparkle x={54} y={26} r={3.5} />
    </>
  ),
};

const ICONS: Record<Subclase, ReactNode> = {
  // Hacha de guerra de doble filo
  'Bárbaro': (
    <>
      <rect x="29" y="12" width="6" height="44" rx="1" fill={GD} />
      <path d="M29 42H35M29 46H35M29 50H35" strokeWidth={1.5} />
      <rect x="27" y="54" width="10" height="6" rx="1.5" fill={G} />
      <path d="M26 15C20 15 15 12 11 6C4 14 4 30 11 38C15 32 20 28 26 27Z" fill={B} />
      <path d="M11 6C4 14 4 30 11 38L14.5 33C9.5 26 9.5 18 14.5 11Z" fill={H} stroke="none" />
      <path d="M38 15C44 15 49 12 53 6C60 14 60 30 53 38C49 32 44 28 38 27Z" fill={B} />
      <path d="M53 6C60 14 60 30 53 38L49.5 33C54.5 26 54.5 18 49.5 11Z" fill={H} stroke="none" />
      <path d="M26 15C20 15 15 12 11 6C4 14 4 30 11 38C15 32 20 28 26 27Z M38 15C44 15 49 12 53 6C60 14 60 30 53 38C49 32 44 28 38 27Z" fill="none" />
      <rect x="25" y="12" width="14" height="18" rx="1.5" fill={B} />
      <path d="M25 17H39M25 25H39" stroke={G} strokeWidth={2} />
      <circle cx="32" cy="21" r="2" fill={GL} strokeWidth={1.5} />
      <path d="M28.5 12L32 3L35.5 12Z" fill={G} />
    </>
  ),
  // Escudo con cruz dorada y espada detrás
  'Caballero': (
    <>
      <path d="M32 2L35.5 8V14H28.5V8Z" fill={H} />
      <rect x="17" y="48" width="30" height="5" rx="1.5" fill={G} />
      <rect x="29.5" y="53" width="5" height="6" fill={GD} />
      <circle cx="32" cy="60" r="2.8" fill={G} />
      <path d="M32 9L52 14V28C52 40 43 47 32 51C21 47 12 40 12 28V14Z" fill={B} />
      <path d="M32 9L12 14V28C12 40 21 47 32 51Z" fill={H} stroke="none" />
      <path d="M32 9L52 14V28C52 40 43 47 32 51C21 47 12 40 12 28V14Z" fill="none" />
      <path d="M32 13.5L48 17.5V28C48 38 41 43.5 32 47C23 43.5 16 38 16 28V17.5Z" fill="none" stroke={G} strokeWidth={2} />
      <Line d="M32 19V40M24 27H40" color={G} width={4} />
      <circle cx="32" cy="27" r="2.5" fill={GL} strokeWidth={1.5} />
    </>
  ),
  // Arco corto recurvo tensado
  'Cazador': (
    <>
      <path d="M13 8L7 32L13 56" fill="none" stroke={GL} strokeWidth={1.5} />
      <Line d="M13 8C14 6 16 5 18 6C34 12 39 24 39 32C39 40 34 52 18 58C16 59 14 58 13 56" color={GD} width={4} />
      <path d="M22 9C32 15 35 24 35.5 30" fill="none" stroke={GL} strokeWidth={1.5} />
      <rect x="35.5" y="26" width="7" height="12" rx="1.5" fill={G} />
      <path d="M35.5 30H42.5M35.5 34H42.5" strokeWidth={1.5} />
      <Line d="M9 32H53" color={GD} width={2.5} />
      <path d="M52 26L62 32L52 38L54.5 32Z" fill={H} />
      <path d="M15 32L10 26H4L8 32Z" fill={G} />
      <path d="M15 32L10 38H4L8 32Z" fill={G} />
    </>
  ),
  // Mira con flecha clavada
  'Tirador': (
    <>
      <circle cx="32" cy="32" r="21" fill={B} />
      <path d="M32 11A21 21 0 0 0 11 32H32Z" fill={H} stroke="none" />
      <circle cx="32" cy="32" r="21" fill="none" />
      <circle cx="32" cy="32" r="14" fill="none" stroke={G} strokeWidth={2.5} />
      <circle cx="32" cy="32" r="7" fill={B} />
      <Line d="M32 4V15M32 49V60M4 32H15M49 32H60" color={GL} width={2.5} />
      <Line d="M11 53L50 14" color={GD} width={2.5} />
      <path d="M58 6L53.5 17.5L50 14L46.5 10.5Z" fill={H} />
      <path d="M16 48L12 44L5 51L9 55Z" fill={G} />
      <path d="M16 48L20 52L13 59L9 55Z" fill={G} />
      <circle cx="32" cy="32" r="3" fill={GL} strokeWidth={1.5} />
    </>
  ),
  // Báculo con orbe y destellos
  'Conjurador': (
    <>
      <rect x="29" y="22" width="6" height="34" rx="1" fill={GD} />
      <path d="M29 38H35M29 42H35M29 46H35" strokeWidth={1.5} />
      <path d="M28 55H36L34 62H30Z" fill={G} />
      <circle cx="32" cy="13" r="9" fill={B} />
      <path d="M32 4A9 9 0 0 0 23 13C23 16 25 19 27 20.5C26 15 28 9 32 4Z" fill={H} stroke="none" />
      <circle cx="32" cy="13" r="9" fill="none" />
      <circle cx="29" cy="10" r="2.5" fill={GL} stroke="none" />
      <path d="M21 9C19 19 25 26 32 26C39 26 45 19 43 9L38.5 13C38.5 18 36 21 32 21C28 21 25.5 18 25.5 13Z" fill={G} />
      <Sparkle x={52} y={10} r={6} />
      <Sparkle x={13} y={27} r={4.5} />
      <Sparkle x={50} y={30} r={3.5} />
    </>
  ),
  // Calavera con cuernos
  'Brujo': (
    <>
      <path d="M19 22C11 20 6 12 8 3C12 9 16 12 23 14Z" fill={GD} />
      <path d="M45 22C53 20 58 12 56 3C52 9 48 12 41 14Z" fill={GD} />
      <path d="M32 10C20 10 13 18 13 29C13 36 17 40 21 42V52H43V42C47 40 51 36 51 29C51 18 44 10 32 10Z" fill={B} />
      <path d="M32 10C20 10 13 18 13 29C13 36 17 40 21 42V52H32Z" fill={H} stroke="none" />
      <path d="M32 10C20 10 13 18 13 29C13 36 17 40 21 42V52H43V42C47 40 51 36 51 29C51 18 44 10 32 10Z" fill="none" />
      <path d="M19 30C19 25 25 24 28 28C29 32 26 35 22 35C20 35 19 33 19 30Z" fill={O} />
      <path d="M45 30C45 25 39 24 36 28C35 32 38 35 42 35C44 35 45 33 45 30Z" fill={O} />
      <circle cx="24" cy="30.5" r="2" fill={G} stroke="none" />
      <circle cx="40" cy="30.5" r="2" fill={G} stroke="none" />
      <path d="M32 36L29 42H35Z" fill={O} />
      <path d="M21 45H43M26.5 45V52M32 45V52M37.5 45V52" strokeWidth={1.75} />
      <path d="M32 14L35 18.5L32 23L29 18.5Z" fill={G} strokeWidth={1.5} />
      <path d="M43 14L39.5 19L42.5 22" fill="none" strokeWidth={1.75} />
    </>
  ),
};
