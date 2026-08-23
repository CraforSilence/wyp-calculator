'use client';

import type { Weapon, WeaponCalcResult } from '@/types/weapon';
import { Badge, rarezaToBadgeVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DAMAGE_TYPE_LABELS } from '@/lib/engine/constants';
import type { DamageTypeName } from '@/types/weapon';

interface WeaponCardProps {
  weapon: Weapon;
  calcResult: WeaponCalcResult;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate?: () => void;
  onReset?: () => void;
  isModified?: boolean;
}

export function WeaponCard({ weapon, calcResult, onEdit, onDelete, onDuplicate, onReset, isModified }: WeaponCardProps) {
  return (
    <div className={`bg-zinc-900 border rounded-lg p-4 hover:border-zinc-700 transition-colors ${
      !weapon.isDefault ? 'border-amber-800/50' : isModified ? 'border-yellow-800/50' : 'border-zinc-800'
    }`}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-zinc-100 truncate">{weapon.nombre}</h3>
            <Badge variant={rarezaToBadgeVariant(weapon.rareza)}>{weapon.rareza}</Badge>
            {!weapon.isDefault && <Badge variant="info">Temporal</Badge>}
            {isModified && <Badge variant="damage">Modificada</Badge>}
          </div>
          <div className="text-xs text-zinc-500 mt-0.5">
            {weapon.subcategoria} &middot; {weapon.velocidad}
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          {onDuplicate && (
            <Button size="sm" variant="ghost" onClick={onDuplicate} title="Duplicar como temporal">Dup</Button>
          )}
          <Button size="sm" variant="ghost" onClick={onEdit}>Editar</Button>
          {onReset && (
            <Button size="sm" variant="secondary" onClick={onReset} title="Restaurar original">Reset</Button>
          )}
          <Button size="sm" variant="danger" onClick={onDelete} title={weapon.isDefault ? 'Ocultar' : 'Eliminar'}>
            {weapon.isDefault ? 'Ocultar' : 'x'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 text-center">
        <div>
          <div className="text-xs text-zinc-500">Dano</div>
          <div className="text-sm font-semibold text-zinc-200">{calcResult.danoMin}-{calcResult.danoMax}</div>
        </div>
        <div>
          <div className="text-xs text-zinc-500">Promedio</div>
          <div className="text-sm font-semibold text-zinc-200">{calcResult.danoPromedio}</div>
        </div>
        <div>
          <div className="text-xs text-zinc-500">DPS</div>
          <div className="text-sm font-bold text-amber-400">{calcResult.dpsEfectivo}</div>
        </div>
        <div>
          <div className="text-xs text-zinc-500">Crit</div>
          <div className="text-sm font-semibold text-zinc-200">{calcResult.critTotalPct}%</div>
        </div>
        <div>
          <div className="text-xs text-zinc-500">Vel</div>
          <div className="text-sm font-semibold text-zinc-200">{calcResult.velEfectiva}s</div>
        </div>
      </div>

      {(calcResult.riposteDmg || calcResult.impactoVigoroso) && (
        <div className="mt-2 pt-2 border-t border-zinc-800 flex gap-4">
          {calcResult.riposteDmg && (
            <div className="text-xs">
              <span className="text-zinc-500">Riposte:</span>{' '}
              <span className="text-red-400 font-semibold">{calcResult.riposteDmg}</span>
            </div>
          )}
          {calcResult.impactoVigoroso && (
            <div className="text-xs">
              <span className="text-zinc-500">Impacto Vig:</span>{' '}
              <span className="text-orange-400 font-semibold">{calcResult.impactoVigoroso.min}-{calcResult.impactoVigoroso.max}</span>
            </div>
          )}
        </div>
      )}

      <div className="mt-2 pt-2 border-t border-zinc-800 flex flex-wrap gap-2">
        {Object.entries(calcResult.desglose).map(([tipo, [min, max]]) => (
          <span key={tipo} className="text-xs text-zinc-400">
            <span className="text-zinc-500">{DAMAGE_TYPE_LABELS[tipo as DamageTypeName] || tipo}:</span>{' '}
            {min}-{max}
          </span>
        ))}
      </div>
    </div>
  );
}
