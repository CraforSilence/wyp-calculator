'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { ALL_DAMAGE_TYPES, DAMAGE_TYPE_LABELS, SUBCATEGORIAS_POR_CLASE } from '@/lib/engine/constants';
import { useBuildWeapon } from '@/hooks/useBuildWeapon';
import { DEFAULT_WEAPONS } from '@/data/default-weapons';
import type { Weapon, DamageTypeName, Velocidad, Rareza, Subcategoria } from '@/types/weapon';
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
  'Fuerza', 'Chance de critico %', 'Dano critico %',
  'Vel ataque %', 'Atributo de clase %',
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

export function BuildArma() {
  const { weapon, setWeapon } = useBuildWeapon();

  const [nombre, setNombre] = useState(weapon.nombre);
  const [clase, setClase] = useState<Clase>(weapon.clase);
  const [subcategoria, setSubcategoria] = useState<string>(weapon.subcategoria);
  const [velocidad, setVelocidad] = useState<Velocidad>(weapon.velocidad);
  const [rareza, setRareza] = useState<Rareza>(weapon.rareza);
  const [bonusAtributo, setBonusAtributo] = useState(weapon.bonusAtributo);
  const [notas, setNotas] = useState(weapon.notas);

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
    setNotas(w.notas);
    setDamageRows(weaponToDamageRows(w));
    setBonusRows(weaponToBonusRows(w));
    setMuescaRows(weaponToMuescaRows(w));
  }, []);

  // Group weapons by clase for the preload select
  const preloadOptions = DEFAULT_WEAPONS.map((w) => ({
    value: w.id,
    label: `[${w.clase[0]}] ${w.nombre}`,
  }));

  // Auto-save to localStorage whenever form state changes
  useEffect(() => {
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
          const dmgType = ALL_DAMAGE_TYPES.find((t) => `Dano ${DAMAGE_TYPE_LABELS[t]}` === row.tipo);
          if (dmgType) bonusDano[dmgType] = row.valor;
        }
      }
    }

    const muescas: Partial<Record<DamageTypeName, number>> = {};
    for (const row of muescaRows) {
      muescas[row.tipo] = (muescas[row.tipo] || 0) + row.valor;
    }

    setWeapon((prev) => ({
      ...prev,
      nombre, clase, subcategoria: subcategoria as Subcategoria, velocidad, rareza,
      bonusStat, bonusAtributo, critChanceExtra, critDmgExtra, attackSpeedPct, atributoClasePct,
      tiposDano, bonusDano, muescas, notas,
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nombre, clase, subcategoria, velocidad, rareza, bonusAtributo, notas, damageRows, bonusRows, muescaRows]);

  const subcatOptions = SUBCATEGORIAS_POR_CLASE[clase].map((s) => ({ value: s, label: s }));

  return (
    <div className="space-y-4">
      {/* Preload weapon */}
      <div>
        <label className="text-xs text-zinc-400 font-medium block mb-1">Precargar arma existente</label>
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

      {/* Basic info */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="col-span-2 sm:col-span-3">
          <Input label="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </div>
        <Select label="Clase" value={clase} onChange={(e) => { setClase(e.target.value as Clase); setSubcategoria(SUBCATEGORIAS_POR_CLASE[e.target.value as Clase][0]); }}
          options={[{ value: 'Guerrero', label: 'Guerrero' }, { value: 'Arquero', label: 'Arquero' }, { value: 'Mago', label: 'Mago' }]} />
        <Select label="Subcategoria" value={subcategoria} onChange={(e) => setSubcategoria(e.target.value)} options={subcatOptions} />
        <Select label="Velocidad" value={velocidad} onChange={(e) => setVelocidad(e.target.value as Velocidad)}
          options={[{ value: 'lenta', label: 'Lenta' }, { value: 'media', label: 'Media' }, { value: 'rapida', label: 'Rapida' }]} />
        <Select label="Rareza" value={rareza} onChange={(e) => setRareza(e.target.value as Rareza)}
          options={[{ value: 'Épica', label: 'Épica' }, { value: 'Mágica', label: 'Mágica' }, { value: 'Legendaria', label: 'Legendaria' }, { value: 'Arcana', label: 'Arcana' }]} />
        <Input label="Stat Base (+dano)" type="number" value={bonusAtributo} onChange={(e) => setBonusAtributo(Number(e.target.value))} />
      </div>

      {/* Damage types */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-zinc-400">Dano Base</span>
          {damageRows.length < 6 && (
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
          <span className="text-xs font-medium text-zinc-400">Bonus</span>
          {bonusRows.length < 8 && (
            <Button size="sm" variant="ghost" onClick={() => setBonusRows([...bonusRows, { tipo: 'Fuerza', valor: 0 }])}>+ Bonus</Button>
          )}
        </div>
        <div className="space-y-2">
          {bonusRows.map((row, i) => (
            <div key={i} className="flex gap-2 items-end">
              <Select value={row.tipo} onChange={(e) => { const next = [...bonusRows]; next[i] = { ...next[i], tipo: e.target.value }; setBonusRows(next); }}
                options={BONUS_TYPES.map((t) => ({ value: t, label: t }))} />
              <Input type="number" placeholder="Valor" value={row.valor || ''} onChange={(e) => { const next = [...bonusRows]; next[i] = { ...next[i], valor: Number(e.target.value) }; setBonusRows(next); }} className="w-24" />
              <Button size="sm" variant="danger" onClick={() => setBonusRows(bonusRows.filter((_, j) => j !== i))}>x</Button>
            </div>
          ))}
        </div>
      </div>

      {/* Muescas */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-zinc-400">Muescas</span>
          {muescaRows.length < 3 && (
            <Button size="sm" variant="ghost" onClick={() => setMuescaRows([...muescaRows, { tipo: 'fuego', valor: 0 }])}>+ Muesca</Button>
          )}
        </div>
        <div className="space-y-2">
          {muescaRows.map((row, i) => (
            <div key={i} className="flex gap-2 items-end">
              <Select value={row.tipo} onChange={(e) => { const next = [...muescaRows]; next[i] = { ...next[i], tipo: e.target.value as DamageTypeName }; setMuescaRows(next); }}
                options={ALL_DAMAGE_TYPES.map((t) => ({ value: t, label: DAMAGE_TYPE_LABELS[t] }))} />
              <Input type="number" min={1} max={30} placeholder="Valor" value={row.valor || ''} onChange={(e) => { const next = [...muescaRows]; next[i] = { ...next[i], valor: Number(e.target.value) }; setMuescaRows(next); }} className="w-24" />
              <Button size="sm" variant="danger" onClick={() => setMuescaRows(muescaRows.filter((_, j) => j !== i))}>x</Button>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-zinc-400 font-medium">Notas</label>
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-none h-16"
        />
      </div>
    </div>
  );
}
