import type { Subcategoria } from '@/types/weapon';

// Íconos por tipo de arma. Los SVG salen de scripts/build-icons.mjs (public/icons/armas/).
const SLUG: Record<Subcategoria, string> = {
  'Lanza': 'lanza',
  'Maza': 'maza',
  'Espada': 'espada',
  'Hacha': 'hacha',
  'Martillo': 'martillo',
  'Florin': 'florin',
  'Garrote': 'garrote',
  'Arco Corto': 'arco-corto',
  'Arco Largo': 'arco-largo',
  'Baculo': 'baculo',
};

/** Ruta del ícono de una subcategoría; el genérico de arma si no se conoce. */
export function weaponIconSrc(subcategoria: string): string {
  const slug = SLUG[subcategoria as Subcategoria];
  return slug ? `/icons/armas/${slug}.svg` : '/icons/arma.svg';
}

export function WeaponIcon({ subcategoria, className = 'inline-block w-[1.2em] h-[1.2em] align-[-0.25em] shrink-0' }: {
  subcategoria: string;
  className?: string;
}) {
  return <img src={weaponIconSrc(subcategoria)} alt="" className={className} />;
}
