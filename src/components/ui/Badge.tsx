type BadgeVariant = 'default' | 'legendary' | 'epic' | 'magic' | 'arcane' | 'damage' | 'info';

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-zinc-700 text-zinc-300',
  legendary: 'bg-amber-900/50 text-amber-400 border border-amber-700/50',
  epic: 'bg-purple-900/50 text-purple-400 border border-purple-700/50',
  magic: 'bg-blue-900/50 text-blue-400 border border-blue-700/50',
  arcane: 'bg-emerald-900/50 text-emerald-400 border border-emerald-700/50',
  damage: 'bg-red-900/50 text-red-400 border border-red-700/50',
  info: 'bg-cyan-900/50 text-cyan-400 border border-cyan-700/50',
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}

export function rarezaToBadgeVariant(rareza: string): BadgeVariant {
  switch (rareza) {
    case 'Legendaria': return 'legendary';
    case 'Épica': return 'epic';
    case 'Mágica': return 'magic';
    case 'Arcana': return 'arcane';
    default: return 'default';
  }
}
