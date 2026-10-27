'use client';

import { bonusSelectOptions } from '@/lib/bonusDisplay';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { ALL_DAMAGE_TYPES, DAMAGE_TYPE_LABELS, MUESCA_TYPES, MUESCA_TYPE_LABELS, SUBCATEGORIAS_POR_CLASE, RAREZA_SLOTS, bonusOptionsForRareza } from '@/lib/engine/constants';
import { SlotEditor, muescaValueInput } from './SlotEditor';
import type { Weapon, DamageTypeName, MuescaType, Velocidad, Rareza, Subcategoria } from '@/types/weapon';
import type { Clase } from '@/types/character';
import { useT } from '@/i18n/I18nProvider';

interface DamageRow {
  tipo: DamageTypeName;
  min: number;
  max: number;
}

interface BonusRow {
  tipo: string;
  valor: number;
}

/** `tipo: ''` = slot de muesca vacio. */
interface MuescaRow {
  tipo: MuescaType | '';
  valor: number;
}

const BONUS_TYPES = [
  'Fuerza', 'Chance de critico %', 'Dano critico %',
  'Vel ataque %', 'Atributo de clase %',
  ...ALL_DAMAGE_TYPES.map((dt) => `Dano ${DAMAGE_TYPE_LABELS[dt]}`),
];

interface WeaponFormProps {
  onSave: (weapon: Omit<Weapon, 'id' | 'createdAt'>) => void;
  editingWeapon?: Weapon | null;
  onCancel?: () => void;
}

export function WeaponForm({ onSave, editingWeapon, onCancel }: WeaponFormProps) {
  const t = useT();
  const [nombre, setNombre] = useState(editingWeapon?.nombre || '');
  const [clase, setClase] = useState<Clase>(editingWeapon?.clase || 'Guerrero');
  const [subcategoria, setSubcategoria] = useState<string>(editingWeapon?.subcategoria || 'Lanza');
  const [velocidad, setVelocidad] = useState<Velocidad>(editingWeapon?.velocidad || 'media');
  const [rareza, setRareza] = useState<Rareza>(editingWeapon?.rareza || 'Épica');
  const [bonusAtributo, setBonusAtributo] = useState(editingWeapon?.bonusAtributo || 0);
  const [notas, setNotas] = useState(editingWeapon?.notas || '');

  const [damageRows, setDamageRows] = useState<DamageRow[]>(() => {
    if (editingWeapon?.tiposDano) {
      return Object.entries(editingWeapon.tiposDano).map(([tipo, [min, max]]) => ({
        tipo: tipo as DamageTypeName, min, max,
      }));
    }
    return [{ tipo: 'punzante', min: 0, max: 0 }];
  });

  const [bonusRows, setBonusRows] = useState<BonusRow[]>(() => {
    if (!editingWeapon) return [];
    const rows: BonusRow[] = [];
    if (editingWeapon.bonusStat > 0) rows.push({ tipo: 'Fuerza', valor: editingWeapon.bonusStat });
    if (editingWeapon.critChanceExtra > 0) rows.push({ tipo: 'Chance de critico %', valor: editingWeapon.critChanceExtra });
    if (editingWeapon.critDmgExtra > 0) rows.push({ tipo: 'Dano critico %', valor: editingWeapon.critDmgExtra });
    if (editingWeapon.attackSpeedPct > 0) rows.push({ tipo: 'Vel ataque %', valor: editingWeapon.attackSpeedPct });
    if (editingWeapon.atributoClasePct > 0) rows.push({ tipo: 'Atributo de clase %', valor: editingWeapon.atributoClasePct });
    for (const [tipo, valor] of Object.entries(editingWeapon.bonusDano)) {
      if (valor) rows.push({ tipo: `Dano ${DAMAGE_TYPE_LABELS[tipo as DamageTypeName]}`, valor });
    }
    return rows;
  });

  const [muescaRows, setMuescaRows] = useState<MuescaRow[]>(() => {
    if (editingWeapon?.muescas) {
      return Object.entries(editingWeapon.muescas)
        .filter(([, valor]) => valor)
        .map(([tipo, valor]) => ({ tipo: tipo as MuescaType, valor: valor as number }));
    }
    return [];
  });

  const handleSubmit = () => {
    if (!nombre.trim()) return;

    const tiposDano: Partial<Record<DamageTypeName, [number, number]>> = {};
    for (const row of damageRows) {
      if (row.max > 0) tiposDano[row.tipo] = [row.min, row.max];
    }

    let bonusStat = 0, critChanceExtra = 0, critDmgExtra = 0, attackSpeedPct = 0, atributoClasePct = 0;
    const bonusDano: Partial<Record<DamageTypeName, number>> = {};

    for (const row of bonusRows) {
      switch (row.tipo) {
        case 'Fuerza': bonusStat = row.valor; break;
        case 'Chance de critico %': critChanceExtra = row.valor; break;
        case 'Dano critico %': critDmgExtra = row.valor; break;
        case 'Vel ataque %': attackSpeedPct = row.valor; break;
        case 'Atributo de clase %': atributoClasePct = row.valor; break;
        default: {
          const dmgType = ALL_DAMAGE_TYPES.find((dt) => `Dano ${DAMAGE_TYPE_LABELS[dt]}` === row.tipo);
          if (dmgType) bonusDano[dmgType] = row.valor;
        }
      }
    }

    const muescas: Partial<Record<MuescaType, number>> = {};
    for (const row of muescaRows) {
      if (!row.tipo || !row.valor) continue;
      muescas[row.tipo] = (muescas[row.tipo] || 0) + row.valor;
    }

    onSave({
      nombre: nombre.trim(),
      clase,
      subcategoria: subcategoria as Subcategoria,
      velocidad,
      rareza,
      bonusStat,
      bonusAtributo,
      critChanceExtra,
      critDmgExtra,
      attackSpeedPct,
      atributoClasePct,
      tiposDano,
      bonusDano,
      muescas,
      notas,
      isDefault: editingWeapon?.isDefault,
    });
  };

  const subcatOptions = SUBCATEGORIAS_POR_CLASE[clase].map((s) => ({ value: s, label: s }));

  return (
    <Card title={editingWeapon ? t("Editar Arma") : t("Nueva Arma")}>
      <div className="space-y-4">
        {/* Basic info */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="col-span-2 sm:col-span-3">
            <Input label={t("Nombre")} value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </div>
          <Select label={t("Clase")} value={clase} onChange={(e) => { setClase(e.target.value as Clase); setSubcategoria(SUBCATEGORIAS_POR_CLASE[e.target.value as Clase][0]); }}
            options={[{ value: 'Guerrero', label: 'Guerrero' }, { value: 'Arquero', label: 'Arquero' }, { value: 'Mago', label: 'Mago' }]} />
          <Select label={t('Subcategoría')} value={subcategoria} onChange={(e) => setSubcategoria(e.target.value)} options={subcatOptions} />
          <Select label={t("Velocidad")} value={velocidad} onChange={(e) => setVelocidad(e.target.value as Velocidad)}
            options={[{ value: 'lenta', label: 'Lenta' }, { value: 'media', label: 'Media' }, { value: 'rapida', label: 'Rapida' }]} />
          <Select label={t("Rareza")} value={rareza} onChange={(e) => setRareza(e.target.value as Rareza)}
            options={[{ value: 'Épica', label: 'Épica' }, { value: 'Mágica', label: 'Mágica' }, { value: 'Legendaria', label: 'Legendaria' }, { value: 'Arcana', label: 'Arcana' }]} />
          <Input label={t('Stat Base (+daño)')} type="number" value={bonusAtributo} onChange={(e) => setBonusAtributo(Number(e.target.value))} />
        </div>

        {/* Damage types */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">{t('Daño Base')}</span>
            {damageRows.length < 6 && (
              <Button size="sm" variant="ghost" onClick={() => setDamageRows([...damageRows, { tipo: 'punzante', min: 0, max: 0 }])}>{t("+ Tipo")}</Button>
            )}
          </div>
          <div className="space-y-2">
            {damageRows.map((row, i) => (
              <div key={i} className="flex gap-2 items-end">
                <Select value={row.tipo} onChange={(e) => { const next = [...damageRows]; next[i].tipo = e.target.value as DamageTypeName; setDamageRows(next); }}
                  options={ALL_DAMAGE_TYPES.map((dt) => ({ value: dt, label: DAMAGE_TYPE_LABELS[dt] }))} />
                <Input type="number" placeholder={t('Mín')} value={row.min || ''} onChange={(e) => { const next = [...damageRows]; next[i].min = Number(e.target.value); setDamageRows(next); }} className="w-20" />
                <Input type="number" placeholder={t('Máx')} value={row.max || ''} onChange={(e) => { const next = [...damageRows]; next[i].max = Number(e.target.value); setDamageRows(next); }} className="w-20" />
                {damageRows.length > 1 && (
                  <Button size="sm" variant="danger-ghost" onClick={() => setDamageRows(damageRows.filter((_, j) => j !== i))}>x</Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bonuses: la cantidad de slots depende de la rareza */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">{t("Bonus")}</span>
            <span className="text-xs text-zinc-500">{rareza}: {RAREZA_SLOTS[rareza].bonus} {RAREZA_SLOTS[rareza].bonus === 1 ? t("slot") : t("slots")}</span>
          </div>
          <SlotEditor
            rows={bonusRows}
            max={RAREZA_SLOTS[rareza].bonus}
            options={bonusSelectOptions(bonusOptionsForRareza(rareza, BONUS_TYPES).map((o) => o.value))}
            onChange={setBonusRows}
            noun={{ one: 'bonus', many: 'bonus' }}
            limitLabel={t('Un arma {rareza}', { rareza: t(rareza) })}
          />
        </div>

        {/* Muescas: 1, salvo las Arcanas que tienen 2 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">{t("Muescas")}</span>
            <span className="text-xs text-zinc-500">{rareza}: {RAREZA_SLOTS[rareza].muescas} {RAREZA_SLOTS[rareza].muescas === 1 ? t("muesca") : t("muescas")}</span>
          </div>
          <SlotEditor
            rows={muescaRows}
            max={RAREZA_SLOTS[rareza].muescas}
            options={bonusSelectOptions(MUESCA_TYPES, (t) => MUESCA_TYPE_LABELS[t as MuescaType])}
            onChange={(rows) => setMuescaRows(rows as MuescaRow[])}
            valueInput={muescaValueInput}
            noun={{ one: 'muesca', many: 'muescas' }}
            limitLabel={t('Un arma {rareza}', { rareza: t(rareza) })}
          />
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-400 font-medium">{t("Notas")}</label>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-none h-16"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          {onCancel && <Button variant="secondary" onClick={onCancel}>{t("Cancelar")}</Button>}
          <Button onClick={handleSubmit} disabled={!nombre.trim()}>
            {editingWeapon ? t("Guardar") : t("Agregar Arma")}
          </Button>
        </div>
      </div>
    </Card>
  );
}
