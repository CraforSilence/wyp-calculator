'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SubclassIcon } from '@/components/icons/CharacterIcons';
import { useT, type TFunction } from '@/i18n/I18nProvider';
import { BOX_GROUPS, EQUIPMENT_BOXES, formatBoxValue, type EquipmentBox } from '@/data/equipment-boxes';

export default function EquipamientoPage() {
  const t = useT();
  const [boxId, setBoxId] = useState(EQUIPMENT_BOXES[0].id);
  const box = EQUIPMENT_BOXES.find((b) => b.id === boxId)!;

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={t('Cajas de equipamiento')}
        description={t('Qué bonus se pueden elegir en cada caja, con su valor base y hasta cuánto se pueden subir.')}
      />

      {/* Una fila de pestañas por grupo (armas / armaduras), solo los grupos que ya tienen cajas */}
      <div className="mb-3 space-y-2.5">
        {BOX_GROUPS.map((g) => {
          const boxes = EQUIPMENT_BOXES.filter((b) => b.group === g.id);
          if (boxes.length === 0) return null;
          const groupLabel = g.sub ? `${t(g.label)} · ${t(g.sub)}` : t(g.label);
          return (
            <div key={g.id}>
              <div className="mb-1 text-[11px] uppercase tracking-wider text-zinc-500">{groupLabel}</div>
              <nav className="inline-flex flex-wrap rounded-md border border-zinc-800 bg-zinc-900 p-0.5" aria-label={groupLabel}>
                {boxes.map((b) => {
                  const active = b.id === boxId;
                  return (
                    <button
                      key={b.id}
                      onClick={() => setBoxId(b.id)}
                      aria-pressed={active}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors cursor-pointer ${
                        active ? 'bg-amber-900/30 text-amber-400' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <img src={b.icon} alt="" className="w-5 h-5" />
                      {t(b.label)}
                    </button>
                  );
                })}
              </nav>
            </div>
          );
        })}
      </div>

      <BoxTable key={box.id} box={box} t={t} />

      <p className="text-xs text-zinc-500 mt-3">
        <Badge variant="legendary" className="mr-1">L</Badge>
        {t('Solo se puede elegir en la Caja Legendaria.')}
      </p>
    </div>
  );
}

function BoxTable({ box, t }: { box: EquipmentBox; t: TFunction }) {
  const common = box.modifiers.filter((m) => !m.legendary);
  const legendary = box.modifiers.filter((m) => m.legendary);

  const title = (
    <span className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2.5 text-base">
        <img src={box.icon} alt="" className="w-7 h-7" />
        {t(box.label)}
      </span>
      {/* Quién puede usar la pieza, como los íconos de clase al lado del título en el juego */}
      <span className="flex items-center gap-1.5" aria-label={box.subclases.map((s) => t(s)).join(', ')}>
        {box.subclases.map((s) => (
          <span
            key={s}
            title={t(s)}
            className="inline-flex items-center justify-center w-11 h-11 rounded-md border border-zinc-700 bg-zinc-800 p-1"
          >
            <SubclassIcon subclase={s} className="w-full h-full" />
          </span>
        ))}
      </span>
    </span>
  );

  const row = (m: EquipmentBox['modifiers'][number], i: number) => (
    <tr key={`${m.name}-${i}`} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/40 transition-colors">
      <td className="py-3 px-3 text-zinc-200">
        <span className="inline-flex items-center gap-2">
          {m.legendary && <Badge variant="legendary">L</Badge>}
          {t(m.name)}
        </span>
      </td>
      <td className="py-3 px-3 text-right text-zinc-300">{formatBoxValue(m, m.base)}</td>
      <td className="py-3 px-3 text-right font-semibold text-amber-400">{formatBoxValue(m, m.max)}</td>
    </tr>
  );

  return (
    <Card title={title}>
      <div className="overflow-x-auto -mx-2">
        <table className="w-full min-w-[22rem] text-base tabular-nums">
          <thead>
            <tr className="border-b border-zinc-800 text-sm text-zinc-500">
              <th className="py-2.5 px-3 text-left font-medium">{t('Modificador')}</th>
              <th className="py-2.5 px-3 text-right font-medium w-28">{t('Base')}</th>
              <th className="py-2.5 px-3 text-right font-medium w-32">{t('Elevable a')}</th>
            </tr>
          </thead>
          <tbody>
            {common.map(row)}
            {legendary.length > 0 && (
              <tr>
                <td colSpan={3} className="pt-4 pb-1.5 px-3 text-xs uppercase tracking-wider text-zinc-500">
                  {t('Extra de la Caja Legendaria')}
                </td>
              </tr>
            )}
            {legendary.map(row)}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
