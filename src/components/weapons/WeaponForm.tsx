'use client';

import { bonusSelectOptions } from '@/lib/bonusDisplay';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { ALL_DAMAGE_TYPES, DAMAGE_TYPE_LABELS, MUESCA_TYPES, MUESCA_TYPE_LABELS, SUBCATEGORIAS_POR_CLASE, RAREZA_SLOTS, bonusOptionsForRareza } from '@/lib/engine/constants';
import { SlotEditor, muescaValueInput } from './SlotEditor';
import type { Weapon, WeaponAttr, DamageTypeName, MuescaType, Velocidad, Rareza, Subcategoria } from '@/types/weapon';
import type { Clase } from '@/types/character';
import { useT } from '@/i18n/I18nProvider';
import { getWeaponAttributes, weaponAttrFromLabel, WEAPON_ATTR_LABELS } from '@/lib/weaponAttributes';
import { WeaponIcon } from '@/components/icons/WeaponIcon';
import { IconSelect } from '@/components/ui/IconSelect';
import { DamageIcon } from '@/components/icons/StatIcons';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { WithSidePanel } from '@/components/build/BuildSteps';
import { DamagePanel, EmptyDamagePanel } from '@/components/build/WeaponDamagePanel';
import { useCharacter } from '@/hooks/useCharacter';
import { useWeapons } from '@/hooks/useWeapons';
import { calcWeaponDamage } from '@/lib/engine/damage';

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
  'Fuerza', 'Destreza', 'Inteligencia', 'Constitucion', 'Concentracion',
  'Chance de critico %', 'Dano critico %',
  'Vel ataque %', 'Vel invocacion %', 'Atributo de clase %',
  ...ALL_DAMAGE_TYPES.map((dt) => `Dano ${DAMAGE_TYPE_LABELS[dt]}`),
];

interface WeaponFormProps {
  onSave: (weapon: Omit<Weapon, 'id' | 'createdAt'>) => void;
  editingWeapon?: Weapon | null;
  onCancel?: () => void;
}

function damageRowsOf(w?: Weapon | null): DamageRow[] {
  if (w?.tiposDano && Object.keys(w.tiposDano).length > 0) {
    return Object.entries(w.tiposDano).map(([tipo, [min, max]]) => ({ tipo: tipo as DamageTypeName, min, max }));
  }
  return [{ tipo: 'punzante', min: 0, max: 0 }];
}

function bonusRowsOf(w?: Weapon | null): BonusRow[] {
  if (!w) return [];
  const rows: BonusRow[] = [];
  for (const [attr, valor] of Object.entries(getWeaponAttributes(w))) {
    if (valor) rows.push({ tipo: WEAPON_ATTR_LABELS[attr as WeaponAttr], valor });
  }
  if (w.critChanceExtra > 0) rows.push({ tipo: 'Chance de critico %', valor: w.critChanceExtra });
  if (w.critDmgExtra > 0) rows.push({ tipo: 'Dano critico %', valor: w.critDmgExtra });
  if (w.attackSpeedPct > 0) rows.push({ tipo: 'Vel ataque %', valor: w.attackSpeedPct });
  if ((w.castSpeedPct ?? 0) > 0) rows.push({ tipo: 'Vel invocacion %', valor: w.castSpeedPct! });
  if (w.atributoClasePct > 0) rows.push({ tipo: 'Atributo de clase %', valor: w.atributoClasePct });
  for (const [tipo, valor] of Object.entries(w.bonusDano)) {
    if (valor) rows.push({ tipo: `Dano ${DAMAGE_TYPE_LABELS[tipo as DamageTypeName]}`, valor });
  }
  return rows;
}

function muescaRowsOf(w?: Weapon | null): MuescaRow[] {
  if (!w?.muescas) return [];
  return Object.entries(w.muescas)
    .filter(([, valor]) => valor)
    .map(([tipo, valor]) => ({ tipo: tipo as MuescaType, valor: valor as number }));
}

export function WeaponForm({ onSave, editingWeapon, onCancel }: WeaponFormProps) {
  const t = useT();
  const { character } = useCharacter();
  const { weapons: savedWeapons } = useWeapons();
  const [nombre, setNombre] = useState(editingWeapon?.nombre || '');
  const [clase, setClase] = useState<Clase>(editingWeapon?.clase || 'Guerrero');
  const [subcategoria, setSubcategoria] = useState<string>(editingWeapon?.subcategoria || 'Lanza');
  const [velocidad, setVelocidad] = useState<Velocidad>(editingWeapon?.velocidad || 'media');
  const [rareza, setRareza] = useState<Rareza>(editingWeapon?.rareza || 'Épica');
  const [bonusAtributo, setBonusAtributo] = useState(editingWeapon?.bonusAtributo || 0);
  const [notas, setNotas] = useState(editingWeapon?.notas || '');
  const [damageRows, setDamageRows] = useState<DamageRow[]>(() => damageRowsOf(editingWeapon));
  const [bonusRows, setBonusRows] = useState<BonusRow[]>(() => bonusRowsOf(editingWeapon));
  const [muescaRows, setMuescaRows] = useState<MuescaRow[]>(() => muescaRowsOf(editingWeapon));
  // Arma de la que se partió al crear una nueva con "Precargar" (no se guarda: es solo una base).
  const [baseId, setBaseId] = useState('');

  const loadWeapon = (w: Weapon) => {
    setBaseId(w.id);
    setNombre(w.nombre);
    setClase(w.clase);
    setSubcategoria(w.subcategoria);
    setVelocidad(w.velocidad);
    setRareza(w.rareza);
    setBonusAtributo(w.bonusAtributo);
    setNotas(w.notas || '');
    setDamageRows(damageRowsOf(w));
    setBonusRows(bonusRowsOf(w));
    setMuescaRows(muescaRowsOf(w));
  };

  const toWeaponData = (): Omit<Weapon, 'id' | 'createdAt'> => {
    const tiposDano: Partial<Record<DamageTypeName, [number, number]>> = {};
    for (const row of damageRows) {
      if (row.max > 0) tiposDano[row.tipo] = [row.min, row.max];
    }

    let critChanceExtra = 0, critDmgExtra = 0, attackSpeedPct = 0, castSpeedPct = 0, atributoClasePct = 0;
    const bonusDano: Partial<Record<DamageTypeName, number>> = {};
    const atributos: Partial<Record<WeaponAttr, number>> = {};

    for (const row of bonusRows) {
      const attr = weaponAttrFromLabel(row.tipo);
      if (attr) {
        atributos[attr] = (atributos[attr] || 0) + row.valor;
        continue;
      }
      switch (row.tipo) {
        case 'Chance de critico %': critChanceExtra = row.valor; break;
        case 'Dano critico %': critDmgExtra = row.valor; break;
        case 'Vel ataque %': attackSpeedPct = row.valor; break;
        case 'Vel invocacion %': castSpeedPct = row.valor; break;
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

    return {
      nombre: nombre.trim(),
      clase,
      subcategoria: subcategoria as Subcategoria,
      velocidad,
      rareza,
      bonusStat: 0,
      atributos,
      bonusAtributo,
      critChanceExtra,
      critDmgExtra,
      attackSpeedPct,
      castSpeedPct,
      atributoClasePct,
      tiposDano,
      bonusDano,
      muescas,
      notas,
      isDefault: editingWeapon?.isDefault,
    };
  };

  const handleSubmit = () => {
    if (!nombre.trim()) return;
    onSave(toWeaponData());
  };

  // Vista previa: el daño del arma tal como está en el formulario, con el personaje actual.
  const draft = toWeaponData();
  const preview = Object.keys(draft.tiposDano).length > 0
    ? calcWeaponDamage({ ...draft, id: editingWeapon?.id ?? 'draft', createdAt: '' }, character, null)
    : null;
  const customOptions = savedWeapons.filter((w) => !w.isDefault);
  const defaultOptions = savedWeapons.filter((w) => w.isDefault);

  const subcatOptions = SUBCATEGORIAS_POR_CLASE[clase].map((s) => ({ value: s, label: s }));
  const slots = RAREZA_SLOTS[rareza];
  const updateDamage = (i: number, patch: Partial<DamageRow>) =>
    setDamageRows(damageRows.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  return (
    <WithSidePanel panel={preview
      ? <DamagePanel calc={preview} subclase={character.subclase} title={draft.nombre || t('Nueva Arma')} />
      : <EmptyDamagePanel text={t('Cargá el daño base y acá vas a ver el daño del arma con tu personaje.')} />}>
    <Card title={editingWeapon ? t("Editar Arma") : t("Nueva Arma")}>
      <div className="@container space-y-5">
        {/* Datos básicos: ícono del tipo junto al nombre (y al precargador), el resto en una fila */}
        <div className="flex gap-3 items-end">
          <span className="hidden sm:inline-flex shrink-0 items-center justify-center w-14 h-14 rounded-lg border border-zinc-700 bg-zinc-800 p-1.5">
            <WeaponIcon subcategoria={subcategoria} className="w-full h-full object-contain" />
          </span>
          <div className={`flex-1 min-w-0 grid gap-3 ${editingWeapon ? '' : 'sm:grid-cols-2'}`}>
            {!editingWeapon && (
              <div className="flex flex-col gap-1 min-w-0">
                <label className="text-xs text-zinc-400 font-medium">{t("Partir de un arma existente")}</label>
                <select
                  value={baseId}
                  onChange={(e) => {
                    const found = savedWeapons.find((w) => w.id === e.target.value);
                    if (found) loadWeapon(found);
                  }}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="" disabled>{t("Elegir arma para cargar...")}</option>
                  {customOptions.length > 0 && (
                    <optgroup label={t("Mis armas")}>
                      {customOptions.map((w) => <option key={w.id} value={w.id}>[{w.clase[0]}] {w.nombre}</option>)}
                    </optgroup>
                  )}
                  {defaultOptions.length > 0 && (
                    <optgroup label={t("Armas base")}>
                      {defaultOptions.map((w) => <option key={w.id} value={w.id}>[{w.clase[0]}] {w.nombre}</option>)}
                    </optgroup>
                  )}
                </select>
              </div>
            )}
            <Input label={t("Nombre")} value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 @lg:grid-cols-3 @2xl:grid-cols-5 gap-3">
          <Select label={t("Clase")} value={clase} onChange={(e) => { setClase(e.target.value as Clase); setSubcategoria(SUBCATEGORIAS_POR_CLASE[e.target.value as Clase][0]); }}
            options={[{ value: 'Guerrero', label: 'Guerrero' }, { value: 'Arquero', label: 'Arquero' }, { value: 'Mago', label: 'Mago' }]} />
          <IconSelect label={t('Subcategoría')} value={subcategoria} onChange={setSubcategoria} options={subcatOptions} renderIcon={(v) => <WeaponIcon subcategoria={v} />} />
          <Select label={t("Velocidad")} value={velocidad} onChange={(e) => setVelocidad(e.target.value as Velocidad)}
            options={[{ value: 'lenta', label: 'Lenta' }, { value: 'media', label: 'Media' }, { value: 'rapida', label: 'Rapida' }]} />
          <Select label={t("Rareza")} value={rareza} onChange={(e) => setRareza(e.target.value as Rareza)}
            options={[{ value: 'Épica', label: 'Épica' }, { value: 'Mágica', label: 'Mágica' }, { value: 'Legendaria', label: 'Legendaria' }, { value: 'Arcana', label: 'Arcana' }]} />
          <Input label={t('Stat Base (+daño)')} type="number" value={bonusAtributo} onChange={(e) => setBonusAtributo(Number(e.target.value))} />
        </div>

        <div className="grid gap-x-6 gap-y-5 @3xl:grid-cols-2">
          {/* Izquierda: daño base y muescas */}
          <div className="space-y-5">
            <section>
              <SectionHeader title={t('Daño Base')}>
                {damageRows.length < 6 && (
                  <button type="button" onClick={() => setDamageRows([...damageRows, { tipo: 'punzante', min: 0, max: 0 }])}
                    className="text-xs text-amber-400 hover:text-amber-300">{t("+ Tipo")}</button>
                )}
              </SectionHeader>
              <div className="space-y-2">
                {damageRows.map((row, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <div className="flex-1 min-w-0">
                      <IconSelect value={row.tipo} onChange={(v) => updateDamage(i, { tipo: v as DamageTypeName })}
                        options={ALL_DAMAGE_TYPES.map((dt) => ({ value: dt, label: DAMAGE_TYPE_LABELS[dt] }))}
                        renderIcon={(v) => <DamageIcon type={v as DamageTypeName} />} className="w-full" />
                    </div>
                    <Input type="number" placeholder={t('Mín')} value={row.min || ''} onChange={(e) => updateDamage(i, { min: Number(e.target.value) })} className="w-16 sm:w-20" />
                    <span className="text-zinc-600">–</span>
                    <Input type="number" placeholder={t('Máx')} value={row.max || ''} onChange={(e) => updateDamage(i, { max: Number(e.target.value) })} className="w-16 sm:w-20" />
                    <span className="w-7 shrink-0">
                      {damageRows.length > 1 && (
                        <Button size="sm" variant="danger-ghost" onClick={() => setDamageRows(damageRows.filter((_, j) => j !== i))} title={t("Quitar")}>x</Button>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Muescas: 1, salvo las Arcanas que tienen 2 */}
            <section>
              <SectionHeader title={t("Muescas")}>
                <span className="text-xs text-zinc-500">{slots.muescas} {slots.muescas === 1 ? t("muesca") : t("muescas")}</span>
              </SectionHeader>
              <SlotEditor
                rows={muescaRows}
                max={slots.muescas}
                options={bonusSelectOptions(MUESCA_TYPES, (t) => MUESCA_TYPE_LABELS[t as MuescaType])}
                onChange={(rows) => setMuescaRows(rows as MuescaRow[])}
                valueInput={muescaValueInput}
                noun={{ one: 'muesca', many: 'muescas' }}
                limitLabel={t('Un arma {rareza}', { rareza: t(rareza) })}
                valueWidthClass="w-16 sm:w-20"
              />
            </section>
          </div>

          {/* Derecha: bonus (la cantidad de slots depende de la rareza) */}
          <section>
            <SectionHeader title={t("Bonus")}>
              <span className="text-xs text-zinc-500">{slots.bonus} {slots.bonus === 1 ? t("slot") : t("slots")}</span>
            </SectionHeader>
            <SlotEditor
              rows={bonusRows}
              max={slots.bonus}
              options={bonusSelectOptions(bonusOptionsForRareza(rareza, BONUS_TYPES).map((o) => o.value))}
              onChange={setBonusRows}
              noun={{ one: 'bonus', many: 'bonus' }}
              limitLabel={t('Un arma {rareza}', { rareza: t(rareza) })}
              valueWidthClass="w-16 sm:w-20"
            />
          </section>
        </div>

        {/* Notas y acciones en la misma franja */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-end pt-4 border-t border-zinc-800">
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-xs text-zinc-400 font-medium">{t("Notas")}</label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={1}
              className="bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-y min-h-[2.125rem]"
            />
          </div>
          <div className="flex gap-2 justify-end shrink-0">
            {onCancel && <Button variant="secondary" onClick={onCancel}>{t("Cancelar")}</Button>}
            <Button onClick={handleSubmit} disabled={!nombre.trim()}>
              {editingWeapon ? t("Guardar") : t("Agregar Arma")}
            </Button>
          </div>
        </div>
      </div>
    </Card>
    </WithSidePanel>
  );
}
