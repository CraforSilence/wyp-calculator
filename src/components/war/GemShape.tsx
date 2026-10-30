import type { Realm } from '@/lib/war';

// Gema de reino en la estética de los íconos de WypForge (grilla 64×64): base en el tono del
// reino, mitad izquierda iluminada, contorno navy, facetas y engarce dorado. Sin reino es un
// lugar vacío del altar. Se usa en el mapa y en las tarjetas de cada reino.

export const REALM_TONES: Record<Realm, { base: string; light: string }> = {
  Alsius: { base: '#2a6b9c', light: '#4b92c4' },
  Ignis: { base: '#a23b36', light: '#cb5d50' },
  Syrtis: { base: '#2c7a58', light: '#4ca37b' },
};

const NAVY = '#071f2e';
const GOLD = '#cba76f';

const GEM = 'M19 12H45L55 25L32 56L9 25Z';
const GEM_LEFT = 'M19 12H32V56L9 25Z';
const FACETS = 'M9 25H55M19 12L25.5 25L32 12L38.5 25L45 12M25.5 25L32 56L38.5 25';

/** Gema centrada en (0, 0), de 64 de ancho a escala 1. */
export function GemShape({ origin }: { origin: Realm | null }) {
  if (!origin) {
    return (
      <g transform="translate(-32,-34)" strokeLinejoin="round" strokeLinecap="round">
        <path d={GEM} fill="#0f1c24" stroke={NAVY} strokeWidth={2.5} />
        <path d={GEM} fill="none" stroke={GOLD} strokeOpacity={0.55} strokeWidth={2} strokeDasharray="4 4" transform="translate(32,34) scale(0.72) translate(-32,-34)" />
      </g>
    );
  }
  const tone = REALM_TONES[origin];
  return (
    <g transform="translate(-32,-34)" stroke={NAVY} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round">
      {/* Engarce dorado detrás */}
      <path d="M14.5 7H49.5L62 25L32 64L2 25Z" fill={GOLD} />
      <path d={GEM} fill={tone.base} />
      <path d={GEM_LEFT} fill={tone.light} stroke="none" />
      <path d={FACETS} fill="none" strokeWidth={1.75} />
      <path d={GEM} fill="none" />
      <path d="M17 22L21 15.5" stroke="#fff" strokeOpacity={0.55} strokeWidth={2.5} />
    </g>
  );
}

/** Gema suelta como ícono (tarjetas). */
export function GemIcon({ origin, label, className = 'w-5 h-5' }: { origin: Realm | null; label: string; className?: string }) {
  return (
    <svg viewBox="-34 -36 68 68" className={className} role="img" aria-label={label}>
      <title>{label}</title>
      <GemShape origin={origin} />
    </svg>
  );
}
