'use client';

import { bonusSelectOptions } from '@/lib/bonusDisplay';
import { useJewelry, aggregateJewelryBonuses } from '@/hooks/useJewelry';
import { useJewelryItems } from '@/hooks/useJewelryItems';
import { Card } from '@/components/ui/Card';
import { SlotEditor } from '@/components/weapons/SlotEditor';
import {
  JEWELRY_BONUS_TYPES, JEWELRY_BONUS_LABELS, JEWELRY_BONUS_CATEGORIES, JEWELRY_ICONS, JEWELRY_MAX_BONUSES,
} from '@/lib/engine/constants';
import type { JewelrySlot, JewelryBonusType } from '@/types/jewelry';
import { useT } from '@/i18n/I18nProvider';

const SLOT_LABELS: Record<JewelrySlot, string> = {
  anillo1: 'Anillo 1',
  anillo2: 'Anillo 2',
  amuleto: 'Amuleto',
};

const BONUS_OPTIONS = bonusSelectOptions(JEWELRY_BONUS_TYPES, (t) => JEWELRY_BONUS_LABELS[t as JewelryBonusType]);

export function BuildJoyeria() {
  const t = useT();
  const { jewelry, updatePiece, clearPiece, clearAll } = useJewelry();
  const { items: savedItems } = useJewelryItems();
  const totals = aggregateJewelryBonuses(jewelry);
  const hasAnyBonus = Object.values(jewelry).some((p) => p.bonuses.length > 0);

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-3">
        <p className="text-xs text-zinc-500">{t('Cada pieza tiene hasta {n} bonus. Los slots vacíos no suman.', { n: JEWELRY_MAX_BONUSES })}</p>
        {hasAnyBonus && (
          <button
            onClick={clearAll}
            className="text-xs text-red-400 hover:text-red-300 hover:bg-red-400/10 px-2 py-1 rounded transition-colors"
            title={t("Borrar los bonus de las 3 piezas")}
          >
            {t('Limpiar joyería')}
          </button>
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {(['anillo1', 'anillo2', 'amuleto'] as JewelrySlot[]).map((slot) => {
          const piece = jewelry[slot];
          const filled = piece.bonuses.length;
          const presets = savedItems.filter((it) => it.slot === (slot === 'amuleto' ? 'amuleto' : 'anillo'));

          return (
            <Card key={slot} className={filled ? '' : 'border-dashed'} title={
              <span className="flex items-center justify-between w-full gap-2">
                <span className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-zinc-700 bg-zinc-800 p-1"><img src={JEWELRY_ICONS[slot]} alt={t(SLOT_LABELS[slot])} className="w-full h-full object-contain" /></span>
                  <span className="flex flex-col">
                    {t(SLOT_LABELS[slot])}
                    <span className={`text-[12px] font-normal ${filled ? 'text-amber-400' : 'text-zinc-500'}`}>
                      {filled ? `${filled}/${JEWELRY_MAX_BONUSES} bonus` : t("Sin bonus")}
                    </span>
                  </span>
                </span>
                {filled > 0 && (
                  <button
                    onClick={() => clearPiece(slot)}
                    className="text-xs font-normal text-red-400 hover:text-red-300 hover:bg-red-400/10 px-2 py-1 rounded transition-colors"
                    title={t("Borrar los bonus de esta pieza")}
                  >
                    {t("Limpiar")}
                  </button>
                )}
              </span>
            }>
              <div className="flex flex-col gap-3">
                {presets.length > 0 && (
                  <select
                    value=""
                    onChange={(e) => {
                      const found = presets.find((it) => it.id === e.target.value);
                      if (found) updatePiece(slot, found.bonuses);
                    }}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-amber-500"
                    title={t("Copia los bonus de una joya guardada en /joyeria")}
                  >
                    <option value="" disabled>{t("Precargar desde Mis joyas...")}</option>
                    {presets.map((it) => (
                      <option key={it.id} value={it.id}>{it.nombre}</option>
                    ))}
                  </select>
                )}
                <SlotEditor
                  rows={piece.bonuses.map((b) => ({ tipo: b.type, valor: b.value }))}
                  max={JEWELRY_MAX_BONUSES}
                  options={BONUS_OPTIONS}
                  selectTooltip={t('Tipo de bonus: atributo, resistencia, crítico, daño extra, etc. Se suman al total del personaje.')}
                  valueInput={() => ({ placeholder: t('Valor'), max: 999, tooltip: t('Valor del bonus tal como aparece en el tooltip del ítem.') })}
                  // Los slots vacios no se guardan: el editor los vuelve a completar al mostrar.
                  onChange={(rows) => updatePiece(slot, rows.filter((r) => r.tipo).map((r) => ({ type: r.tipo as JewelryBonusType, value: r.valor })))}
                  noun={{ one: 'bonus', many: 'bonus' }}
                  limitLabel={t(SLOT_LABELS[slot])}
                  valueWidthClass="w-[4.5rem]"
                  collapseEmpty
                />
              </div>
            </Card>
          );
        })}
      </div>

      {Object.values(totals).some((v) => v) && (
        <Card title={t("Resumen")} className="mt-4">
          <div className="flex flex-col gap-3">
            {Object.entries(JEWELRY_BONUS_CATEGORIES).map(([catName, catTypes]) => {
              const catEntries = catTypes.filter((dt) => totals[dt]);
              if (catEntries.length === 0) return null;
              return (
                <div key={catName}>
                  <p className="text-xs text-zinc-500 mb-1">{catName}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    {catEntries.map((dt) => (
                      <div key={dt}>
                        <span className="text-zinc-400">{t(JEWELRY_BONUS_LABELS[dt])}:</span>{' '}
                        <span className="text-amber-400 font-semibold">+{totals[dt]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
