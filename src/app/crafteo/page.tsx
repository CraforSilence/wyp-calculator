'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge, rarezaToBadgeVariant } from '@/components/ui/Badge';
import { useT, type TFunction } from '@/i18n/I18nProvider';
import { CRAFT_FAMILIES, QUALITIES, RARITIES, craftDamage, type CraftFamily, type CraftMaterial } from '@/data/crafting';

export default function CrafteoPage() {
  const t = useT();
  const [familyId, setFamilyId] = useState<CraftFamily['id']>('guerrero');
  const family = CRAFT_FAMILIES.find((f) => f.id === familyId)!;

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={t('Crafteo')}
        description={t('Daño (+X) que sale en el tooltip de un arma crafteada, según material, calidad y rareza.')}
      />

      {/* Mismo selector que Comparar armas / armaduras */}
      <nav className="mb-3 inline-flex rounded-md border border-zinc-800 bg-zinc-900 p-0.5" aria-label={t('Qué tabla ver')}>
        {CRAFT_FAMILIES.map((f) => {
          const active = f.id === familyId;
          return (
            <button
              key={f.id}
              onClick={() => setFamilyId(f.id)}
              aria-pressed={active}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                active ? 'bg-amber-900/30 text-amber-400' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <img src={f.icon} alt="" className="w-3.5 h-3.5" />
              {t(f.label)}
            </button>
          );
        })}
      </nav>

      <div key={family.id} className="space-y-3">
        <FormulaCard family={family} t={t} />
        {family.materials.map((m) => (
          <MaterialTable key={m.name} family={family} material={m} t={t} />
        ))}
      </div>

      {family.estimatedQualities.length > 0 && (
        <p className="text-xs text-zinc-500 mt-3">
          <span className="text-zinc-400">*</span>{' '}
          {t('Estimado: todavía no vimos ningún arma de esa calidad o material en el juego, el valor sale solo de la fórmula.')}
        </p>
      )}
    </div>
  );
}

function FormulaCard({ family, t }: { family: CraftFamily; t: TFunction }) {
  const chip = 'inline-flex items-center gap-1 rounded border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300';
  const label = 'w-16 shrink-0 text-xs text-zinc-500';
  return (
    <Card>
      <div className="font-mono text-sm text-zinc-200">
        {t('Daño')} = {t('material')} + {t('calidad')} + {t('rareza')}
      </div>
      <div className="mt-3 space-y-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={label}>{t('Material')}</span>
          {family.materials.map((m) => (
            <span key={m.name} className={chip}>{t(m.name)} <b className="text-zinc-100">{m.base}</b></span>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={label}>{t('Calidad')}</span>
          {QUALITIES.map((q) => (
            <span key={q.name} className={chip}>{t(q.name)} <b className="text-zinc-100">+{q.bonus}</b></span>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={label}>{t('Rareza')}</span>
          {RARITIES.map((r) => (
            <Badge key={r.name} variant={rarezaToBadgeVariant(r.name)}>
              {t(r.name)} <b className="ml-1">+{r.bonus}</b>
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  );
}

function MaterialTable({ family, material, t }: { family: CraftFamily; material: CraftMaterial; t: TFunction }) {
  // Al pasar el mouse por una celda se marcan su fila y su columna
  const [hover, setHover] = useState<{ r: number; q: number } | null>(null);

  const title = (
    <span className="flex items-baseline justify-between gap-2">
      <span>{t(material.name)}</span>
      {(material.note || material.estimated) && (
        <span className="text-[11px] font-normal text-zinc-500">
          {material.estimated ? `* ${t('Sin datos todavía, sale de la fórmula.')}` : t(material.note!)}
        </span>
      )}
    </span>
  );

  return (
    <Card title={title}>
      <div className="overflow-x-auto -mx-2">
        {/* table-fixed + anchos iguales: las columnas quedan alineadas entre todas las tablas */}
        <table className="w-full min-w-[26rem] table-fixed text-sm tabular-nums" onMouseLeave={() => setHover(null)}>
          <colgroup>
            <col className="w-28" />
            {QUALITIES.map((q) => <col key={q.name} />)}
          </colgroup>
          <thead>
            <tr className="border-b border-zinc-800 text-xs text-zinc-500">
              <th className="py-2 px-2 text-left font-medium">{t('Rareza')}</th>
              {QUALITIES.map((q, qi) => (
                <th key={q.name} className={`py-2 px-2 text-right font-medium transition-colors ${hover?.q === qi ? 'text-zinc-200' : ''}`}>
                  {t(q.name)}
                  {family.estimatedQualities.includes(q.name) && '*'}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RARITIES.map((r, ri) => (
              <tr key={r.name} className="border-b border-zinc-800/50 last:border-0">
                <td className="py-2 px-2">
                  <Badge variant={rarezaToBadgeVariant(r.name)}>{r.name}</Badge>
                </td>
                {QUALITIES.map((q, qi) => {
                  const estimated = material.estimated || family.estimatedQualities.includes(q.name);
                  const isCell = hover?.r === ri && hover?.q === qi;
                  const inLine = hover !== null && (hover.r === ri || hover.q === qi);
                  return (
                    <td
                      key={q.name}
                      onMouseEnter={() => setHover({ r: ri, q: qi })}
                      className={`py-2 px-2 text-right transition-colors ${
                        isCell
                          ? 'bg-amber-900/30 text-amber-400 font-semibold'
                          : `${inLine ? 'bg-zinc-800/60' : ''} ${estimated ? 'text-zinc-500 italic' : 'text-zinc-200'}`
                      }`}
                    >
                      {craftDamage(family, material.base, q.bonus, r.bonus)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
