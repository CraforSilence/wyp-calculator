'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Collapsible } from '@/components/ui/Collapsible';
import { ALL_DAMAGE_TYPES, DAMAGE_TYPE_LABELS, SUBCATEGORIAS_POR_CLASE } from '@/lib/engine/constants';
import { HelpPopover } from '@/components/ui/HelpPopover';
import { useBuildWeapon } from '@/hooks/useBuildWeapon';
import { useCharacter } from '@/hooks/useCharacter';
import { DEFAULT_WEAPONS } from '@/data/default-weapons';
import type { Weapon, DamageTypeName, Velocidad, Rareza, Subcategoria, ArrowSet, WeaponMode } from '@/types/weapon';
import type { Clase } from '@/types/character';

interface DamageRow {
  tipo: DamageTypeName;
  min: number;
  max: number;
}

interface BonusRow {
  tipo: string;
  valor: number;
}

interface MuescaRow {
  tipo: DamageTypeName;
  valor: number;
}

const BONUS_TYPES = [
  'Fuerza', 'Concentracion', 'Inteligencia', 'Constitucion', 'Destreza',
  'Chance de critico %', 'Dano critico %',
  'Vel ataque %', 'Atributo de clase %',
  ...ALL_DAMAGE_TYPES.map((t) => `Dano ${DAMAGE_TYPE_LABELS[t]}`),
];

const ARROW_BONUS_TYPES = [
  'Destreza', 'Chance de critico %', 'Dano critico %',
  ...ALL_DAMAGE_TYPES.map((t) => `Dano ${DAMAGE_TYPE_LABELS[t]}`),
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
  if (w.bonusStat > 0) rows.push({ tipo: 'Fuerza', valor: w.bonusStat });
  if (w.critChanceExtra > 0) rows.push({ tipo: 'Chance de critico %', valor: w.critChanceExtra });
  if (w.critDmgExtra > 0) rows.push({ tipo: 'Dano critico %', valor: w.critDmgExtra });
  if (w.attackSpeedPct > 0) rows.push({ tipo: 'Vel ataque %', valor: w.attackSpeedPct });
  if (w.atributoClasePct > 0) rows.push({ tipo: 'Atributo de clase %', valor: w.atributoClasePct });
  for (const [tipo, valor] of Object.entries(w.bonusDano)) {
    if (valor) rows.push({ tipo: `Dano ${DAMAGE_TYPE_LABELS[tipo as DamageTypeName]}`, valor });
  }
  return rows;
}

function weaponToMuescaRows(w: Weapon): MuescaRow[] {
  if (w.muescas && Object.keys(w.muescas).length > 0) {
    return Object.entries(w.muescas).map(([tipo, valor]) => ({
      tipo: tipo as DamageTypeName, valor: valor as number,
    }));
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

  const preloadOptions = DEFAULT_WEAPONS.map((w) => ({
    value: w.id,
    label: `[${w.clase[0]}] ${w.nombre}`,
  }));

  useEffect(() => {
    const tiposDano: Partial<Record<DamageTypeName, [number, number]>> = {};
    for (const row of damageRows) {
      if (row.max > 0) tiposDano[row.tipo] = [row.min, row.max];
    }

    let bonusStat = 0, critChanceExtra = 0, critDmgExtra = 0, attackSpeedPct = 0, atributoClasePct = 0;
    const bonusDano: Partial<Record<DamageTypeName, number>> = {};

    for (const row of bonusRows) {
      switch (row.tipo) {
        case 'Fuerza':
        case 'Concentracion':
        case 'Inteligencia':
        case 'Constitucion':
        case 'Destreza':
          bonusStat += row.valor; break;
        case 'Chance de critico %': critChanceExtra = row.valor; break;
        case 'Dano critico %': critDmgExtra = row.valor; break;
        case 'Vel ataque %': attackSpeedPct = row.valor; break;
        case 'Atributo de clase %': atributoClasePct = row.valor; break;
        default: {
          const dmgType = ALL_DAMAGE_TYPES.find((t) => `Dano ${DAMAGE_TYPE_LABELS[t]}` === row.tipo);
          if (dmgType) bonusDano[dmgType] = row.valor;
        }
      }
    }

    const muescas: Partial<Record<DamageTypeName, number>> = {};
    for (const row of muescaRows) {
      muescas[row.tipo] = (muescas[row.tipo] || 0) + row.valor;
    }

    onWeaponChange({
      ...weapon,
      nombre, clase, subcategoria: subcategoria as Subcategoria, velocidad, rareza,
      bonusStat, bonusAtributo, critChanceExtra, critDmgExtra, attackSpeedPct, atributoClasePct,
      tiposDano, bonusDano, muescas, notas: '',
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nombre, clase, subcategoria, velocidad, rareza, bonusAtributo, damageRows, bonusRows, muescaRows]);

  const subcatOptions = SUBCATEGORIAS_POR_CLASE[clase].map((s) => ({ value: s, label: s }));

  return (
    <div className="space-y-4">
      {/* Card: Datos del Arma */}
      <Card title={
        <span className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded border border-zinc-700 bg-zinc-800 p-1">
            <img src="/icons/arma.png" alt="Arma" className="w-full h-full object-contain" />
          </span>
          Datos del Arma
        </span>
      }>
        <div className="space-y-3">
          {showPreload && (
            <div>
              <label className="text-xs text-zinc-400 font-medium mb-1 block">Precargar arma existente</label>
              <select
                value=""
                onChange={(e) => {
                  const found = DEFAULT_WEAPONS.find((w) => w.id === e.target.value);
                  if (found) loadWeapon(found);
                }}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
              >
                <option value="" disabled>Elegir arma para cargar...</option>
                {preloadOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="col-span-2 sm:col-span-3">
              <Input label="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>
            {showClaseSelector && (
              <Select label="Clase" value={clase} onChange={(e) => { setClase(e.target.value as Clase); setSubcategoria(SUBCATEGORIAS_POR_CLASE[e.target.value as Clase][0]); }}
                options={[{ value: 'Guerrero', label: 'Guerrero' }, { value: 'Arquero', label: 'Arquero' }, { value: 'Mago', label: 'Mago' }]} />
            )}
            <Select label="Subcategoria" tooltip="Tipo de arma. Determina el multiplicador de atributo y animaciones." value={subcategoria} onChange={(e) => setSubcategoria(e.target.value)} options={subcatOptions} />
            <Select label="Velocidad" tooltip="Velocidad de ataque del arma. Afecta el DPS final." value={velocidad} onChange={(e) => setVelocidad(e.target.value as Velocidad)}
              options={[{ value: 'lenta', label: 'Lenta' }, { value: 'media', label: 'Media' }, { value: 'rapida', label: 'Rapida' }]} />
            <Select label="Rareza" tooltip="Calidad del arma. Las armas de mayor rareza tienen mejores stats base y mas slots de muescas." value={rareza} onChange={(e) => setRareza(e.target.value as Rareza)}
              options={[{ value: 'Épica', label: 'Épica' }, { value: 'Mágica', label: 'Mágica' }, { value: 'Legendaria', label: 'Legendaria' }, { value: 'Arcana', label: 'Arcana' }]} />
            <Input label="Stat Base (+dano)" tooltip="Bonus de atributo base del arma (Fuerza, Inteligencia, etc). Se suma al atributo del personaje para calcular el dano extra." type="number" value={bonusAtributo} onChange={(e) => setBonusAtributo(Number(e.target.value))} />
          </div>
        </div>
      </Card>

      {/* Card: Daño Base */}
      <Card title={
        <span className="flex items-center justify-between w-full">
          <span className="flex items-center gap-1">Daño Base <HelpPopover text="Dano nominal del arma visible en el tooltip del juego. Pone el tipo de dano y los valores minimo y maximo." /></span>
          {damageRows.length < 6 && (
            <Button size="sm" variant="ghost" onClick={() => setDamageRows([...damageRows, { tipo: 'punzante', min: 0, max: 0 }])}>+ Tipo</Button>
          )}
        </span>
      }>
        <div className="space-y-2">
          {damageRows.map((row, i) => (
            <div key={i} className="flex gap-2 items-end">
              <Select tooltip="Tipo de dano (Punzante, Cortante, Fuego, etc.)" value={row.tipo} onChange={(e) => { const next = [...damageRows]; next[i] = { ...next[i], tipo: e.target.value as DamageTypeName }; setDamageRows(next); }}
                options={ALL_DAMAGE_TYPES.map((t) => ({ value: t, label: DAMAGE_TYPE_LABELS[t] }))} />
              <Input tooltip="Dano minimo del arma para este tipo" type="number" placeholder="Min" value={row.min || ''} onChange={(e) => { const next = [...damageRows]; next[i] = { ...next[i], min: Number(e.target.value) }; setDamageRows(next); }} className="w-20" />
              <Input tooltip="Dano maximo del arma para este tipo" type="number" placeholder="Max" value={row.max || ''} onChange={(e) => { const next = [...damageRows]; next[i] = { ...next[i], max: Number(e.target.value) }; setDamageRows(next); }} className="w-20" />
              {damageRows.length > 1 && (
                <Button size="sm" variant="danger" onClick={() => setDamageRows(damageRows.filter((_, j) => j !== i))}>x</Button>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Bonus y Muescas lado a lado */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Card: Bonus */}
        <Card title={
          <span className="flex items-center justify-between w-full">
            <span className="flex items-center gap-1">Bonus <HelpPopover text="Modificadores adicionales del arma: atributos, critico, velocidad de ataque y dano extra por tipo. Se ven en el tooltip del arma." /></span>
            {bonusRows.length < 8 && (
              <Button size="sm" variant="ghost" onClick={() => setBonusRows([...bonusRows, { tipo: 'Fuerza', valor: 0 }])}>+ Bonus</Button>
            )}
          </span>
        }>
          <div className="space-y-2">
            {bonusRows.map((row, i) => (
              <div key={i} className="flex gap-2 items-end">
                <Select tooltip="Tipo de bonus (atributo, critico, velocidad, dano extra, etc.)" value={row.tipo} onChange={(e) => { const next = [...bonusRows]; next[i] = { ...next[i], tipo: e.target.value }; setBonusRows(next); }}
                  options={BONUS_TYPES.map((t) => ({ value: t, label: t }))} />
                <Input tooltip="Valor numerico del bonus" type="number" placeholder="Valor" value={row.valor || ''} onChange={(e) => { const next = [...bonusRows]; next[i] = { ...next[i], valor: Number(e.target.value) }; setBonusRows(next); }} className="w-24" />
                <Button size="sm" variant="danger" onClick={() => setBonusRows(bonusRows.filter((_, j) => j !== i))}>x</Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Card: Muescas */}
        <Card title={
          <span className="flex items-center justify-between w-full">
            <span className="flex items-center gap-1">Muescas <HelpPopover text="Gemas incrustadas en el arma. Agregan dano especial que solo es reducido por el Factor de Proteccion (FP), no por la armadura completa." /></span>
            {muescaRows.length < 3 && (
              <Button size="sm" variant="ghost" onClick={() => setMuescaRows([...muescaRows, { tipo: 'fuego', valor: 0 }])}>+ Muesca</Button>
            )}
          </span>
        }>
          <div className="space-y-2">
            {muescaRows.map((row, i) => (
              <div key={i} className="flex gap-2 items-end">
                <Select tooltip="Tipo de dano de la gema" value={row.tipo} onChange={(e) => { const next = [...muescaRows]; next[i] = { ...next[i], tipo: e.target.value as DamageTypeName }; setMuescaRows(next); }}
                  options={ALL_DAMAGE_TYPES.map((t) => ({ value: t, label: DAMAGE_TYPE_LABELS[t] }))} />
                <Input tooltip="Nivel de la gema (1-30)" type="number" min={1} max={30} placeholder="Valor" value={row.valor || ''} onChange={(e) => { const next = [...muescaRows]; next[i] = { ...next[i], valor: Number(e.target.value) }; setMuescaRows(next); }} className="w-24" />
                <Button size="sm" variant="danger" onClick={() => setMuescaRows(muescaRows.filter((_, j) => j !== i))}>x</Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// --- Arrow Form ---

interface ArrowFormProps {
  arrows: ArrowSet;
  onArrowsChange: (a: ArrowSet) => void;
}

function ArrowForm({ arrows, onArrowsChange }: ArrowFormProps) {
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
          const dmgType = ALL_DAMAGE_TYPES.find((t) => `Dano ${DAMAGE_TYPE_LABELS[t]}` === row.tipo);
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
      <Input label="Nombre de Flecha" tooltip="Nombre para identificar este set de flechas." value={nombre} onChange={(e) => setNombre(e.target.value)} />

      {/* Damage types */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-zinc-400">Dano de Flecha <HelpPopover text="Dano base de las flechas. Se suma al dano del arco." /></span>
          {damageRows.length < 4 && (
            <Button size="sm" variant="ghost" onClick={() => setDamageRows([...damageRows, { tipo: 'punzante', min: 0, max: 0 }])}>+ Tipo</Button>
          )}
        </div>
        <div className="space-y-2">
          {damageRows.map((row, i) => (
            <div key={i} className="flex gap-2 items-end">
              <Select value={row.tipo} onChange={(e) => { const next = [...damageRows]; next[i] = { ...next[i], tipo: e.target.value as DamageTypeName }; setDamageRows(next); }}
                options={ALL_DAMAGE_TYPES.map((t) => ({ value: t, label: DAMAGE_TYPE_LABELS[t] }))} />
              <Input type="number" placeholder="Min" value={row.min || ''} onChange={(e) => { const next = [...damageRows]; next[i] = { ...next[i], min: Number(e.target.value) }; setDamageRows(next); }} className="w-20" />
              <Input type="number" placeholder="Max" value={row.max || ''} onChange={(e) => { const next = [...damageRows]; next[i] = { ...next[i], max: Number(e.target.value) }; setDamageRows(next); }} className="w-20" />
              {damageRows.length > 1 && (
                <Button size="sm" variant="danger" onClick={() => setDamageRows(damageRows.filter((_, j) => j !== i))}>x</Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bonuses */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-zinc-400">Bonus de Flecha <HelpPopover text="Modificadores de las flechas: Destreza, critico y dano extra por tipo." /></span>
          {bonusRows.length < 6 && (
            <Button size="sm" variant="ghost" onClick={() => setBonusRows([...bonusRows, { tipo: 'Destreza', valor: 0 }])}>+ Bonus</Button>
          )}
        </div>
        <div className="space-y-2">
          {bonusRows.map((row, i) => (
            <div key={i} className="flex gap-2 items-end">
              <Select value={row.tipo} onChange={(e) => { const next = [...bonusRows]; next[i] = { ...next[i], tipo: e.target.value }; setBonusRows(next); }}
                options={ARROW_BONUS_TYPES.map((t) => ({ value: t, label: t }))} />
              <Input type="number" placeholder="Valor" value={row.valor || ''} onChange={(e) => { const next = [...bonusRows]; next[i] = { ...next[i], valor: Number(e.target.value) }; setBonusRows(next); }} className="w-24" />
              <Button size="sm" variant="danger" onClick={() => setBonusRows(bonusRows.filter((_, j) => j !== i))}>x</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Main BuildArma Component ---

export function BuildArma() {
  const {
    weapon, setWeapon,
    weaponMode, setWeaponMode,
    secondaryWeapon, setSecondaryWeapon,
    arrows, setArrows,
  } = useBuildWeapon();
  const { character } = useCharacter();

  const isBarbaro = character.subclase === 'Bárbaro';
  const isArquero = character.clase === 'Arquero';

  return (
    <div className="space-y-4">
      {/* Weapon mode toggle for Bárbaro */}
      {isBarbaro && (
        <div>
          <label className="text-xs text-zinc-400 font-medium mb-1 block">Modo de Arma</label>
          <div className="flex gap-1 bg-zinc-800 rounded-lg p-1">
            <button
              onClick={() => setWeaponMode('2manos')}
              className={`flex-1 px-3 py-1.5 text-sm rounded-md transition-colors ${
                weaponMode === '2manos'
                  ? 'bg-amber-600 text-white font-medium'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              2 Manos
            </button>
            <button
              onClick={() => setWeaponMode('duales')}
              className={`flex-1 px-3 py-1.5 text-sm rounded-md transition-colors ${
                weaponMode === 'duales'
                  ? 'bg-amber-600 text-white font-medium'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Duales
            </button>
          </div>
        </div>
      )}

      {/* Weapon forms */}
      {isBarbaro && weaponMode === 'duales' ? (
        <div className="space-y-3">
          <Collapsible title="Arma Principal" icon="/icons/arma.png" defaultOpen={true}>
            <WeaponForm
              weapon={weapon}
              onWeaponChange={(w) => setWeapon(w)}
            />
          </Collapsible>
          <Collapsible title="Arma Secundaria" icon="/icons/arma.png" defaultOpen={true}>
            <WeaponForm
              weapon={secondaryWeapon}
              onWeaponChange={(w) => setSecondaryWeapon(w)}
              showPreload={true}
              showClaseSelector={true}
            />
          </Collapsible>
        </div>
      ) : (
        <WeaponForm
          weapon={weapon}
          onWeaponChange={(w) => setWeapon(w)}
        />
      )}

      {/* Arrow section for Arquero */}
      {isArquero && (
        <Collapsible title="Flechas" icon="/icons/flechas.png" defaultOpen={false}>
          <ArrowForm
            arrows={arrows}
            onArrowsChange={(a) => setArrows(a)}
          />
        </Collapsible>
      )}
    </div>
  );
}
