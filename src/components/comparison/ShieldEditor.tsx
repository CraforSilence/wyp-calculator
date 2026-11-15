'use client';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ArmorBonusSlots } from '@/components/armor/ArmorBonusSlots';
import { QUALITY_STYLES } from '@/components/armor/ArmorPieceSummary';
import { DamageIcon } from '@/components/icons/StatIcons';
import { DAMAGE_TYPE_LABELS, PHYSICAL_DAMAGE_TYPES, MAGICAL_DAMAGE_TYPES, ARMOR_SLOT_ICONS } from '@/lib/engine/constants';
import type { ArmorPiece, ProtectionQuality } from '@/types/armor';
import { useT } from '@/i18n/I18nProvider';

/** Escudo para los sets de Caballero que no traen uno (ej. Dragón). */
export const DEFAULT_COMPARE_SHIELD: ArmorPiece = {
  slot: 'escudo',
  pba: 230,
  bcmt: 8,
  protectionFactors: { cortante: 'Mala', punzante: 'Buena', aplastante: 'Mala', fuego: 'Mala', hielo: 'Muy Buena', electrico: 'Normal' },
  bonusProteccionPct: {},
  bonuses: [
    { type: 'constitucion', value: 5 },
    { type: 'vida', value: 98 },
  ],
  upgrades: [],
  rareza: 'Legendaria',
};

const QUALITIES: ProtectionQuality[] = ['Muy Mala', 'Mala', 'Normal', 'Buena', 'Muy Buena'];
const DAMAGE_TYPES_PAIRED = PHYSICAL_DAMAGE_TYPES.flatMap((p, i) => [p, MAGICAL_DAMAGE_TYPES[i]]);

interface ShieldEditorProps {
  piece: ArmorPiece;
  onChange: (piece: ArmorPiece) => void;
  onReset: () => void;
}

export function ShieldEditor({ piece, onChange, onReset }: ShieldEditorProps) {
  const t = useT();
  const update = (updates: Partial<ArmorPiece>) => onChange({ ...piece, ...updates });

  return (
    <div className="grid gap-4 sm:grid-cols-[minmax(0,16rem)_minmax(0,1fr)]">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded border border-zinc-700 bg-zinc-800 p-0.5">
            <img src={ARMOR_SLOT_ICONS.escudo} alt="" className="w-full h-full object-contain" />
          </span>
          <span className="text-sm font-medium text-zinc-200">{t("Escudo")}</span>
          <Button size="sm" variant="ghost" className="ml-auto" onClick={onReset}>{t("Restaurar")}</Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Input label={t("PBA")} type="number" min={0} value={piece.pba} onChange={(e) => update({ pba: Number(e.target.value) })} />
          <Input label={t("BCMT")} type="number" min={0} value={piece.bcmt} onChange={(e) => update({ bcmt: Number(e.target.value) })} />
        </div>
        <div>
          <span className="text-[11px] text-zinc-500 mb-1 block">{t('Factor de protección')}</span>
          <div className="grid grid-cols-2 gap-1.5">
            {DAMAGE_TYPES_PAIRED.map((dt) => (
              <div key={dt} className="flex items-center gap-1.5">
                <DamageIcon type={dt} title={t(DAMAGE_TYPE_LABELS[dt])} className="w-[1.2em] h-[1.2em] shrink-0 text-sm" />
                <select
                  aria-label={`${t(DAMAGE_TYPE_LABELS[dt])}: ${t('Factor de protección')}`}
                  className={`flex-1 min-w-0 rounded border px-2 py-1.5 text-xs focus:outline-none focus:border-amber-500 transition-colors ${QUALITY_STYLES[piece.protectionFactors[dt] || 'Normal']}`}
                  value={piece.protectionFactors[dt] || 'Normal'}
                  onChange={(e) => update({ protectionFactors: { ...piece.protectionFactors, [dt]: e.target.value as ProtectionQuality } })}
                >
                  {QUALITIES.map((q) => <option key={q} value={q} className="bg-zinc-900 text-zinc-100">{t(q)}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div>
        <span className="text-[11px] text-zinc-500 mb-1 block">{t("Bonuses")}</span>
        <ArmorBonusSlots
          bonuses={piece.bonuses}
          slot="escudo"
          rareza={piece.rareza ?? 'Legendaria'}
          onChange={(bonuses) => update({ bonuses })}
        />
      </div>
    </div>
  );
}
