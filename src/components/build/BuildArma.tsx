'use client';

import { bonusSelectOptions } from '@/lib/bonusDisplay';
import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Collapsible } from '@/components/ui/Collapsible';
import { ALL_DAMAGE_TYPES, DAMAGE_TYPE_LABELS, MUESCA_TYPES, MUESCA_TYPE_LABELS, SUBCATEGORIAS_POR_CLASE, RAREZA_SLOTS, bonusOptionsForRareza } from '@/lib/engine/constants';
import { HelpPopover } from '@/components/ui/HelpPopover';
import { SlotEditor, muescaValueInput } from '@/components/weapons/SlotEditor';
import { useBuildWeapon, DEFAULT_WEAPON, DEFAULT_ARROWS } from '@/hooks/useBuildWeapon';
import { useCharacter } from '@/hooks/useCharacter';
import { useWeapons } from '@/hooks/useWeapons';
import { useToast } from '@/components/ui/Toast';
import type { Weapon, WeaponAttr, DamageTypeName, MuescaType, Velocidad, Rareza, Subcategoria, ArrowSet, WeaponMode } from '@/types/weapon';
import type { Clase } from '@/types/character';
import { useT } from '@/i18n/I18nProvider';
import { getWeaponAttributes, weaponAttrFromLabel, WEAPON_ATTR_LABELS } from '@/lib/weaponAttributes';
import { WeaponIcon, weaponIconSrc } from '@/components/icons/WeaponIcon';
import { IconSelect } from '@/components/ui/IconSelect';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { DamageIcon } from '@/components/icons/StatIcons';

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
  'Fuerza', 'Concentracion', 'Inteligencia', 'Constitucion', 'Destreza',
  'Chance de critico %', 'Dano critico %',
  'Vel ataque %', 'Vel invocacion %', 'Atributo de clase %',
  ...ALL_DAMAGE_TYPES.map((dt) => `Dano ${DAMAGE_TYPE_LABELS[dt]}`),
];

const ARROW_BONUS_TYPES = [
  'Destreza', 'Chance de critico %', 'Dano critico %',
  ...ALL_DAMAGE_TYPES.map((dt) => `Dano ${DAMAGE_TYPE_LABELS[dt]}`),
];

function weaponToDamageRows(w: Weapon): DamageRow[] {
  if (w.tiposDano && Object.keys(w.tiposDano).length > 0) {
    return Object.entries(w.tiposDano).map(([tipo, [min, max]]) => ({
      tipo: tipo as DamageTypeName, min, max,
    }));
  }
  return [{ tipo: 'punzante', min: 0, max: 0 }];
}

function weaponToBonusRows(w: Weapon): BonusRow[] {
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

function weaponToMuescaRows(w: Weapon): MuescaRow[] {
  if (w.muescas && Object.keys(w.muescas).length > 0) {
    return Object.entries(w.muescas)
      .filter(([, valor]) => valor)
      .map(([tipo, valor]) => ({ tipo: tipo as MuescaType, valor: valor as number }));
  }
  return [];
}

function arrowsToDamageRows(a: ArrowSet): DamageRow[] {
  if (a.tiposDano && Object.keys(a.tiposDano).length > 0) {
    return Object.entries(a.tiposDano).map(([tipo, [min, max]]) => ({
      tipo: tipo as DamageTypeName, min, max,
    }));
  }
  return [{ tipo: 'punzante', min: 0, max: 0 }];
}

function arrowsToBonusRows(a: ArrowSet): BonusRow[] {
  const rows: BonusRow[] = [];
  if (a.bonusStat > 0) rows.push({ tipo: 'Destreza', valor: a.bonusStat });
  if (a.critChanceExtra > 0) rows.push({ tipo: 'Chance de critico %', valor: a.critChanceExtra });
  if (a.critDmgExtra > 0) rows.push({ tipo: 'Dano critico %', valor: a.critDmgExtra });
  for (const [tipo, valor] of Object.entries(a.bonusDano)) {
    if (valor) rows.push({ tipo: `Dano ${DAMAGE_TYPE_LABELS[tipo as DamageTypeName]}`, valor });
  }
  return rows;
}

// --- Weapon Form (reusable for primary and secondary) ---

interface WeaponFormProps {
  weapon: Weapon;
  onWeaponChange: (w: Weapon) => void;
  showPreload?: boolean;
  showClaseSelector?: boolean;
}

function WeaponForm({ weapon, onWeaponChange, showPreload = true, showClaseSelector = true }: WeaponFormProps) {
  const t = useT();
  const [nombre, setNombre] = useState(weapon.nombre);
  const [clase, setClase] = useState<Clase>(weapon.clase);
  const [subcategoria, setSubcategoria] = useState<string>(weapon.subcategoria);
  const [velocidad, setVelocidad] = useState<Velocidad>(weapon.velocidad);
  const [rareza, setRareza] = useState<Rareza>(weapon.rareza);
  const [bonusAtributo, setBonusAtributo] = useState(weapon.bonusAtributo);
  const [damageRows, setDamageRows] = useState<DamageRow[]>(() => weaponToDamageRows(weapon));
  const [bonusRows, setBonusRows] = useState<BonusRow[]>(() => weaponToBonusRows(weapon));
  const [muescaRows, setMuescaRows] = useState<MuescaRow[]>(() => weaponToMuescaRows(weapon));

  const loadWeapon = useCallback((w: Weapon) => {
    setNombre(w.nombre);
    setClase(w.clase);
    setSubcategoria(w.subcategoria);
    setVelocidad(w.velocidad);
    setRareza(w.rareza);
    setBonusAtributo(w.bonusAtributo);
    setDamageRows(weaponToDamageRows(w));
    setBonusRows(weaponToBonusRows(w));
    setMuescaRows(weaponToMuescaRows(w));
  }, []);

  const { weapons: savedWeapons } = useWeapons();
  const customOptions = savedWeapons.filter((w) => !w.isDefault);
  const defaultOptions = savedWeapons.filter((w) => w.isDefault);
  // El arma cargada se reconoce por nombre (prioriza Mis armas): sobrevive a recargas y se
  // pierde sola al limpiar o renombrar.
  const loadedWeapon = nombre
    ? customOptions.find((w) => w.nombre === nombre) ?? defaultOptions.find((w) => w.nombre === nombre)
    : undefined;

  useEffect(() => {
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

    onWeaponChange({
      ...weapon,
      nombre, clase, subcategoria: subcategoria as Subcategoria, velocidad, rareza,
      bonusStat: 0, atributos, bonusAtributo, critChanceExtra, critDmgExtra, attackSpeedPct, castSpeedPct, atributoClasePct,
      tiposDano, bonusDano, muescas, notas: '',
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nombre, clase, subcategoria, velocidad, rareza, bonusAtributo, damageRows, bonusRows, muescaRows]);

  const subcatOptions = SUBCATEGORIAS_POR_CLASE[clase].map((s) => ({ value: s, label: s }));
  const slots = RAREZA_SLOTS[rareza];
  const updateDamage = (i: number, patch: Partial<DamageRow>) =>
    setDamageRows(damageRows.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  return (
    <Card title={
      <span className="flex items-center justify-between w-full gap-2">
        <span>{t("Datos del Arma")}</span>
        <Button size="sm" variant="ghost" onClick={() => loadWeapon({ ...DEFAULT_WEAPON, id: weapon.id, clase, subcategoria: subcategoria as Subcategoria })}>
          {t("Limpiar")}
        </Button>
      </span>
    }>
      <div className="@container space-y-5">
        {/* Datos básicos: ícono del tipo junto al nombre (y al precargador), el resto en una fila */}
        <div className="flex gap-3 items-end">
          <span className="hidden sm:inline-flex shrink-0 items-center justify-center w-14 h-14 rounded-lg border border-zinc-700 bg-zinc-800 p-1.5">
            <img src={weaponIconSrc(subcategoria)} alt={t(subcategoria)} className="w-full h-full object-contain" />
          </span>
          <div className={`flex-1 min-w-0 grid gap-3 ${showPreload ? 'sm:grid-cols-2' : ''}`}>
            {showPreload && (
              <div className="flex flex-col gap-1 min-w-0">
                <label className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
                  {t("Precargar arma existente")}
                  {loadedWeapon && <span className="text-emerald-400">{t("✓ cargada")}</span>}
                </label>
                <select
                  value={loadedWeapon?.id ?? ''}
                  onChange={(e) => {
                    const found = savedWeapons.find((w) => w.id === e.target.value);
                    if (found) loadWeapon(found);
                  }}
                  className={`w-full bg-zinc-800 border rounded px-2.5 py-1.5 text-sm text-zinc-100 focus:outline-none ${
                    loadedWeapon
                      ? 'border-emerald-500 ring-1 ring-emerald-500/40 focus:border-emerald-400'
                      : 'border-zinc-700 focus:border-amber-500'
                  }`}
                >
                  <option value="" disabled>{t("Elegir arma para cargar...")}</option>
                  {customOptions.length > 0 && (
                    <optgroup label={t("Mis armas")}>
                      {customOptions.map((w) => (
                        <option key={w.id} value={w.id}>[{w.clase[0]}] {w.nombre}</option>
                      ))}
                    </optgroup>
                  )}
                  {defaultOptions.length > 0 && (
                    <optgroup label={t("Armas base")}>
                      {defaultOptions.map((w) => (
                        <option key={w.id} value={w.id}>[{w.clase[0]}] {w.nombre}</option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>
            )}
            <Input label={t("Nombre")} value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </div>
        </div>
        <div className={`grid grid-cols-2 gap-3 ${showClaseSelector ? "@lg:grid-cols-3 @2xl:grid-cols-5" : "@lg:grid-cols-4"}`}>
          {showClaseSelector && (
            <Select label={t("Clase")} value={clase} onChange={(e) => { setClase(e.target.value as Clase); setSubcategoria(SUBCATEGORIAS_POR_CLASE[e.target.value as Clase][0]); }}
              options={[{ value: 'Guerrero', label: 'Guerrero' }, { value: 'Arquero', label: 'Arquero' }, { value: 'Mago', label: 'Mago' }]} />
          )}
          <IconSelect label={t('Subcategoría')} tooltip={t("Tipo de arma. Determina el multiplicador de atributo y animaciones.")} value={subcategoria} onChange={setSubcategoria} options={subcatOptions} renderIcon={(v) => <WeaponIcon subcategoria={v} />} />
          <Select label={t("Velocidad")} tooltip={t("Velocidad de ataque del arma. Afecta el DPS final.")} value={velocidad} onChange={(e) => setVelocidad(e.target.value as Velocidad)}
            options={[{ value: 'lenta', label: 'Lenta' }, { value: 'media', label: 'Media' }, { value: 'rapida', label: 'Rapida' }]} />
          <Select label={t("Rareza")} tooltip={t('Calidad del arma. Las armas de mayor rareza tienen mejores stats base y más slots de muescas.')} value={rareza} onChange={(e) => setRareza(e.target.value as Rareza)}
            options={[{ value: 'Épica', label: 'Épica' }, { value: 'Mágica', label: 'Mágica' }, { value: 'Legendaria', label: 'Legendaria' }, { value: 'Arcana', label: 'Arcana' }]} />
          <Input label={t('Stat Base (+daño)')} tooltip={t('Bonus de atributo base del arma (Fuerza, Inteligencia, etc). Se suma al atributo del personaje para calcular el daño extra.')} type="number" value={bonusAtributo} onChange={(e) => setBonusAtributo(Number(e.target.value))} />
        </div>

        <div className="grid gap-x-6 gap-y-5 @3xl:grid-cols-2">
          {/* Izquierda: daño base y muescas */}
          <div className="space-y-5">
            <section>
              <SectionHeader title={t("Daño Base")} help={t('Daño nominal del arma visible en el tooltip del juego. Poné el tipo de daño y los valores mínimo y máximo.')}>
                {damageRows.length < 6 && (
                  <button type="button" onClick={() => setDamageRows([...damageRows, { tipo: 'punzante', min: 0, max: 0 }])}
                    className="text-xs text-amber-400 hover:text-amber-300">{t("+ Tipo")}</button>
                )}
              </SectionHeader>
              <div className="space-y-2">
                {damageRows.map((row, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <div className="flex-1 min-w-0">
                      <IconSelect tooltip={t('Tipo de daño (Punzante, Cortante, Fuego, etc.)')} value={row.tipo} onChange={(v) => updateDamage(i, { tipo: v as DamageTypeName })}
                        options={ALL_DAMAGE_TYPES.map((dt) => ({ value: dt, label: DAMAGE_TYPE_LABELS[dt] }))}
                        renderIcon={(v) => <DamageIcon type={v as DamageTypeName} />} className="w-full" />
                    </div>
                    <Input tooltip={t('Daño mínimo del arma para este tipo')} type="number" placeholder={t('Mín')} value={row.min || ''} onChange={(e) => updateDamage(i, { min: Number(e.target.value) })} className="w-16 sm:w-20" />
                    <span className="text-zinc-600">–</span>
                    <Input tooltip={t('Daño máximo del arma para este tipo')} type="number" placeholder={t('Máx')} value={row.max || ''} onChange={(e) => updateDamage(i, { max: Number(e.target.value) })} className="w-16 sm:w-20" />
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
              <SectionHeader title={t("Muescas")} help={t('Gemas incrustadas en el arma. Las de daño agregan daño especial que solo reduce el Factor de Protección (FP), no la armadura completa. Las de Vel. Ataque / Vel. Invocación agregan % de velocidad. Solo las Arcanas tienen 2 muescas.')}>
                <span className="text-xs text-zinc-500">{slots.muescas} {slots.muescas === 1 ? t("muesca") : t("muescas")}</span>
              </SectionHeader>
              <SlotEditor
                rows={muescaRows}
                max={slots.muescas}
                options={bonusSelectOptions(MUESCA_TYPES, (t) => MUESCA_TYPE_LABELS[t as MuescaType])}
                onChange={(rows) => setMuescaRows(rows as MuescaRow[])}
                valueInput={muescaValueInput}
                selectTooltip={t('Tipo de la gema: daño o velocidad')}
                noun={{ one: 'muesca', many: 'muescas' }}
                limitLabel={t('Un arma {rareza}', { rareza: t(rareza) })}
                valueWidthClass="w-16 sm:w-20"
              />
            </section>
          </div>

          {/* Derecha: bonus (la cantidad de slots depende de la rareza) */}
          <section>
            <SectionHeader title={t("Bonus")} help={t('Modificadores adicionales del arma: atributos, crítico, velocidad de ataque y daño extra por tipo. Se ven en el tooltip del arma. La cantidad de slots depende de la rareza.')}>
              <span className="text-xs text-zinc-500">{slots.bonus} {slots.bonus === 1 ? t("slot") : t("slots")}</span>
            </SectionHeader>
            <SlotEditor
              rows={bonusRows}
              max={slots.bonus}
              options={bonusSelectOptions(bonusOptionsForRareza(rareza, BONUS_TYPES).map((o) => o.value))}
              onChange={setBonusRows}
              selectTooltip={t('Tipo de bonus (atributo, crítico, velocidad, daño extra, etc.)')}
              noun={{ one: 'bonus', many: 'bonus' }}
              limitLabel={t('Un arma {rareza}', { rareza: t(rareza) })}
              valueWidthClass="w-16 sm:w-20"
            />
          </section>
        </div>
      </div>
    </Card>
  );
}

// --- Arrow Form ---

interface ArrowFormProps {
  arrows: ArrowSet;
  onArrowsChange: (a: ArrowSet) => void;
}

function ArrowForm({ arrows, onArrowsChange }: ArrowFormProps) {
  const t = useT();
  const [nombre, setNombre] = useState(arrows.nombre);
  const [damageRows, setDamageRows] = useState<DamageRow[]>(() => arrowsToDamageRows(arrows));
  const [bonusRows, setBonusRows] = useState<BonusRow[]>(() => arrowsToBonusRows(arrows));

  useEffect(() => {
    const tiposDano: Partial<Record<DamageTypeName, [number, number]>> = {};
    for (const row of damageRows) {
      if (row.max > 0) tiposDano[row.tipo] = [row.min, row.max];
    }

    let bonusStat = 0, critChanceExtra = 0, critDmgExtra = 0;
    const bonusDano: Partial<Record<DamageTypeName, number>> = {};

    for (const row of bonusRows) {
      switch (row.tipo) {
        case 'Destreza': bonusStat = row.valor; break;
        case 'Chance de critico %': critChanceExtra = row.valor; break;
        case 'Dano critico %': critDmgExtra = row.valor; break;
        default: {
          const dmgType = ALL_DAMAGE_TYPES.find((dt) => `Dano ${DAMAGE_TYPE_LABELS[dt]}` === row.tipo);
          if (dmgType) bonusDano[dmgType] = row.valor;
        }
      }
    }

    onArrowsChange({
      nombre, tiposDano, bonusStat, critChanceExtra, critDmgExtra, bonusDano,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nombre, damageRows, bonusRows]);

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Input label={t("Nombre de Flecha")} tooltip={t("Nombre para identificar este set de flechas.")} value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </div>
        <Button size="sm" variant="ghost" onClick={() => {
          setNombre(DEFAULT_ARROWS.nombre);
          setDamageRows(arrowsToDamageRows(DEFAULT_ARROWS));
          setBonusRows(arrowsToBonusRows(DEFAULT_ARROWS));
        }}>
          {t("Limpiar")}
        </Button>
      </div>

      {/* Damage types */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-zinc-400">{t('Daño de Flecha')} <HelpPopover text={t('Daño base de las flechas. Se suma al daño del arco.')} /></span>
          {damageRows.length < 4 && (
            <Button size="sm" variant="ghost" onClick={() => setDamageRows([...damageRows, { tipo: 'punzante', min: 0, max: 0 }])}>{t("+ Tipo")}</Button>
          )}
        </div>
        <div className="space-y-2">
          {damageRows.map((row, i) => (
            <div key={i} className="flex gap-2 items-end">
              <Select value={row.tipo} onChange={(e) => { const next = [...damageRows]; next[i] = { ...next[i], tipo: e.target.value as DamageTypeName }; setDamageRows(next); }}
                options={ALL_DAMAGE_TYPES.map((dt) => ({ value: dt, label: DAMAGE_TYPE_LABELS[dt] }))} />
              <Input type="number" placeholder={t('Mín')} value={row.min || ''} onChange={(e) => { const next = [...damageRows]; next[i] = { ...next[i], min: Number(e.target.value) }; setDamageRows(next); }} className="w-20" />
              <Input type="number" placeholder={t('Máx')} value={row.max || ''} onChange={(e) => { const next = [...damageRows]; next[i] = { ...next[i], max: Number(e.target.value) }; setDamageRows(next); }} className="w-20" />
              {damageRows.length > 1 && (
                <Button size="sm" variant="danger-ghost" onClick={() => setDamageRows(damageRows.filter((_, j) => j !== i))}>x</Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bonuses */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-zinc-400">{t("Bonus de Flecha")} <HelpPopover text={t('Modificadores de las flechas: Destreza, crítico y daño extra por tipo.')} /></span>
          {bonusRows.length < 6 && (
            <Button size="sm" variant="ghost" onClick={() => setBonusRows([...bonusRows, { tipo: 'Destreza', valor: 0 }])}>{t("+ Bonus")}</Button>
          )}
        </div>
        <div className="space-y-2">
          {bonusRows.map((row, i) => (
            <div key={i} className="flex gap-2 items-end">
              <Select value={row.tipo} onChange={(e) => { const next = [...bonusRows]; next[i] = { ...next[i], tipo: e.target.value }; setBonusRows(next); }}
                options={ARROW_BONUS_TYPES.map((dt) => ({ value: dt, label: dt }))} />
              <Input type="number" placeholder={t("Valor")} value={row.valor || ''} onChange={(e) => { const next = [...bonusRows]; next[i] = { ...next[i], valor: Number(e.target.value) }; setBonusRows(next); }} className="w-24" />
              <Button size="sm" variant="danger-ghost" onClick={() => setBonusRows(bonusRows.filter((_, j) => j !== i))}>x</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Main BuildArma Component ---

export function BuildArma() {
  const t = useT();
  const {
    weapon, setWeapon,
    weaponMode, setWeaponMode,
    secondaryWeapon, setSecondaryWeapon,
    arrows, setArrows,
    hasWeapon, hasSecondaryWeapon,
    loaded,
  } = useBuildWeapon();
  const { character } = useCharacter();
  const { addWeapon, customCount } = useWeapons();
  const { toast } = useToast();

  const isBarbaro = character.subclase === 'Bárbaro';
  const isArquero = character.clase === 'Arquero';

  const MAX_CUSTOM = 50;
  const canSave = customCount < MAX_CUSTOM;

  const handleSaveWeapon = (w: Weapon) => {
    if (!canSave) {
      toast(t('Límite de {n} armas personalizadas alcanzado', { n: MAX_CUSTOM }), 'error');
      return;
    }
    if (!w.nombre.trim() || Object.keys(w.tiposDano).length === 0) {
      toast(t('El arma necesita nombre y al menos un tipo de daño'), 'error');
      return;
    }
    const { id, isDefault, createdAt, ...data } = w;
    addWeapon(data);
    toast(t('"{arma}" guardada en Mis armas', { arma: w.nombre }), 'success');
  };

  // Los formularios copian el arma a estado local al montarse: si se montan antes de leer
  // localStorage arrancan vacios y pisan el arma guardada. Esperar a que cargue.
  if (!loaded) return null;

  return (
    <div className="space-y-4">
      {/* Weapon mode toggle for Bárbaro */}
      {isBarbaro && (
        <div>
          <label className="text-xs text-zinc-400 font-medium mb-1 block">{t("Modo de Arma")}</label>
          <div className="flex gap-1 bg-zinc-800 rounded-lg p-1">
            <button
              onClick={() => setWeaponMode('2manos')}
              className={`flex-1 px-3 py-1.5 text-sm rounded-md transition-colors ${
                weaponMode === '2manos'
                  ? 'bg-amber-600 text-white font-medium'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {t("2 Manos")}
            </button>
            <button
              onClick={() => setWeaponMode('duales')}
              className={`flex-1 px-3 py-1.5 text-sm rounded-md transition-colors ${
                weaponMode === 'duales'
                  ? 'bg-amber-600 text-white font-medium'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {t("Duales")}
            </button>
          </div>
        </div>
      )}

      {/* Weapon forms */}
      {isBarbaro && weaponMode === 'duales' ? (
        <div className="space-y-3">
          <Collapsible title={t("Arma Principal")} icon="/icons/arma.svg" defaultOpen={true}>
            <WeaponForm
              weapon={weapon}
              onWeaponChange={(w) => setWeapon(w)}
            />
          </Collapsible>
          <Collapsible title={t("Arma Secundaria")} icon="/icons/arma.svg" defaultOpen={true}>
            <WeaponForm
              weapon={secondaryWeapon}
              onWeaponChange={(w) => setSecondaryWeapon(w)}
              showPreload={true}
              showClaseSelector={true}
            />
          </Collapsible>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => handleSaveWeapon(weapon)} disabled={!canSave || !hasWeapon}>
              {t("Guardar principal en Mis armas")}
            </Button>
            <Button size="sm" variant="secondary" onClick={() => handleSaveWeapon(secondaryWeapon)} disabled={!canSave || !hasSecondaryWeapon}>
              {t("Guardar secundaria en Mis armas")}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <WeaponForm
            weapon={weapon}
            onWeaponChange={(w) => setWeapon(w)}
          />
          <Button size="sm" variant="secondary" onClick={() => handleSaveWeapon(weapon)} disabled={!canSave || !hasWeapon}>
            {t("Guardar en Mis armas")}
          </Button>
        </>
      )}

      {/* Arrow section for Arquero */}
      {isArquero && (
        <Collapsible title={t("Flechas")} icon="/icons/flechas.svg" defaultOpen={false}>
          <ArrowForm
            arrows={arrows}
            onArrowsChange={(a) => setArrows(a)}
          />
        </Collapsible>
      )}
    </div>
  );
}
