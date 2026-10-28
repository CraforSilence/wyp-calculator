'use client';

import { ARMOR_BONUS_LABELS, DAMAGE_TYPE_LABELS, ALL_DAMAGE_TYPES } from '@/lib/engine/constants';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { BonusIcon, DamageIcon } from '@/components/icons/StatIcons';
import { getTotalBonuses, setProtection, type ArmorSetTableProps } from './ArmorSetTable';
import { useT } from '@/i18n/I18nProvider';

/** Los mismos sets que ArmorSetTable, en tarjetas como las de Armas. */
export function ArmorSetCards({
  sets, armorClass, subclase, onEdit, onDelete, onDuplicate, onShare,
  onReset, isModified, selectedIds, onToggleSelect,
}: ArmorSetTableProps) {
  const t = useT();
  if (sets.length === 0) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {sets.map((set) => {
        const modified = isModified?.(set.id) ?? false;
        const isSelected = selectedIds?.includes(set.id) ?? false;
        const { prot, totalProt } = setProtection(set, armorClass);
        const pieceCount = Object.keys(set.pieces).length;
        const bonuses = getTotalBonuses(set, subclase);
        const needsSubclase = bonuses.length === 0 && !!set.bonusConjuntoPorSubclase && Object.keys(set.bonusConjuntoPorSubclase).length > 0;

        return (
          <div
            key={set.id}
            className={`bg-zinc-900 border rounded-lg p-4 transition-colors ${
              isSelected ? 'border-amber-500/70 ring-1 ring-amber-500/30'
                : !set.isDefault ? 'border-amber-800/50 hover:border-amber-700/60'
                : modified ? 'border-yellow-800/50 hover:border-yellow-700/60'
                : 'border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-start gap-3 min-w-0">
                <span className="inline-flex shrink-0 items-center justify-center w-14 h-14 rounded-lg border border-zinc-700 bg-zinc-800 p-1.5">
                  <img src="/icons/pechera.svg" alt="" className="w-full h-full object-contain" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-zinc-100 truncate" title={set.nombre}>{set.nombre}</h3>
                    {!set.isDefault && <Badge variant="info">{t("Propio")}</Badge>}
                    {modified && <Badge variant="damage">{t("Modificado")}</Badge>}
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5">
                    {t(set.clase)}{set.subclase && <> &middot; {t(set.subclase)}</>} &middot; {t('{n} piezas', { n: pieceCount })}
                  </div>
                  {set.notas && <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{set.notas}</p>}
                </div>
              </div>
              <div className="flex gap-1 shrink-0 items-center">
                {onShare && (
                  <Button size="sm" variant="ghost" onClick={() => onShare(set)} title={t("Compartir")}>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => onDuplicate(set)} title={t("Duplicar")}>{t("Dup")}</Button>
                <Button size="sm" variant="ghost" onClick={() => onEdit(set)}>{t("Editar")}</Button>
                {onReset && modified && (
                  <Button size="sm" variant="secondary" onClick={() => onReset(set)} title={t("Restaurar original")}>{t("Reset")}</Button>
                )}
                <Button size="sm" variant="danger-ghost" onClick={() => onDelete(set)} title={set.isDefault ? t("Ocultar") : t("Eliminar")}>
                  {set.isDefault ? t('Ocultar') : 'x'}
                </Button>
              </div>
            </div>

            {/* Protección por tipo + total */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 text-center">
              {ALL_DAMAGE_TYPES.map((dt) => (
                <div key={dt} title={t(DAMAGE_TYPE_LABELS[dt])}>
                  <div className="text-xs text-zinc-500 flex items-center justify-center gap-0.5">
                    <DamageIcon type={dt} /> <span className="truncate">{t(DAMAGE_TYPE_LABELS[dt]).slice(0, 4)}</span>
                  </div>
                  <div className="text-sm font-semibold text-zinc-200 tabular-nums">{Math.round(prot.perType[dt] || 0)}</div>
                </div>
              ))}
              <div>
                <div className="text-xs text-zinc-500">{t("Total")}</div>
                <div className="text-sm font-bold text-amber-400 tabular-nums">{Math.round(totalProt)}</div>
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-zinc-800 flex flex-wrap items-center gap-x-3 gap-y-1">
              {bonuses.map((b) => (
                <span key={b.type} className="text-xs text-zinc-400">
                  <BonusIcon bonus={b.type} /> {t(ARMOR_BONUS_LABELS[b.type])}: <span className="font-medium text-amber-400">+{b.value}</span>
                </span>
              ))}
              {needsSubclase && <span className="text-xs text-zinc-500 italic">{t('Seleccioná la subclase')}</span>}
              {bonuses.length === 0 && !needsSubclase && <span className="text-xs text-zinc-600">{t('Sin bonus')}</span>}
              {onToggleSelect && (
                <label className="ml-auto flex items-center gap-1.5 text-xs text-zinc-400 cursor-pointer hover:text-zinc-200">
                  <input type="checkbox" checked={isSelected} onChange={() => onToggleSelect(set.id)} className="accent-amber-500 cursor-pointer" />
                  {t("Comparar")}
                </label>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
