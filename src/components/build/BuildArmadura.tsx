'use client';

import { useMemo, useState } from 'react';
import { useCharacter } from '@/hooks/useCharacter';
import { useArmor } from '@/hooks/useArmor';
import { calcTotalProtection, filterArmorForSubclase, allArmorBonuses } from '@/lib/engine/armor';
import { useActiveArmorPreset } from '@/hooks/useActiveArmorPreset';
import {
  ARMOR_CLASSES, ALL_DAMAGE_TYPES, DAMAGE_TYPE_LABELS, ARMOR_SLOT_LABELS,
  PHYSICAL_DAMAGE_TYPES, MAGICAL_DAMAGE_TYPES, armorSlotsFor, CLASE_SUBCLASES,
  ARMOR_BONUS_TYPES, ARMOR_BONUS_LABELS, ARMOR_SLOT_ICONS,
  ARMOR_SLOT_LABEL_OVERRIDES, pieceRareza, ITEM_DISTRIBUTION,
  maxArmorUpgrades,
} from '@/lib/engine/constants';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { HelpPopover } from '@/components/ui/HelpPopover';
import { Badge, rarezaToBadgeVariant } from '@/components/ui/Badge';
import { ArmorPieceSummary, QUALITY_STYLES } from '@/components/armor/ArmorPieceSummary';
import { ArmorModifiersSection } from '@/components/armor/ArmorModifiersSection';
import { DEFAULT_ARMOR_SETS } from '@/data/default-armor';
import { ArmorBonusSlots, ArmorRarezaSelect, armorBonusLimitLabel } from '@/components/armor/ArmorBonusSlots';
import { useArmorSets } from '@/hooks/useArmorSets';
import type { ArmorSlot, ArmorBonusType, ArmorBonus, ArmorUpgrade, ProtectionQuality } from '@/types/armor';
import type { DamageTypeName } from '@/types/weapon';
import type { Clase } from '@/types/character';
import { useT } from '@/i18n/I18nProvider';
import { DamageIcon } from '@/components/icons/StatIcons';

const QUALITY_OPTIONS: { value: string; label: string }[] = [
  { value: 'Muy Mala', label: 'Muy Mala' },
  { value: 'Mala', label: 'Mala' },
  { value: 'Normal', label: 'Normal' },
  { value: 'Buena', label: 'Buena' },
  { value: 'Muy Buena', label: 'Muy Buena' },
];

// Orden intercalado: físicos a la izquierda, mágicos a la derecha en grid-cols-2
const DAMAGE_TYPES_PAIRED = PHYSICAL_DAMAGE_TYPES.flatMap((p, i) => [p, MAGICAL_DAMAGE_TYPES[i]]);

function getClase(subclase: string): Clase {
  for (const [clase, subs] of Object.entries(CLASE_SUBCLASES)) {
    if ((subs as string[]).includes(subclase)) return clase as Clase;
  }
  return 'Guerrero';
}

/** Suma de los bonus de las piezas y del conjunto, por tipo. */
function aggregateAllBonuses(armorSet: ReturnType<typeof useArmor>['armorSet']): Partial<Record<ArmorBonusType, number>> {
  const totals: Partial<Record<ArmorBonusType, number>> = {};
  for (const bonus of allArmorBonuses(armorSet)) {
    totals[bonus.type] = (totals[bonus.type] || 0) + bonus.value;
  }
  return totals;
}

export function BuildArmadura() {
  const t = useT();
  const { character } = useCharacter();
  const { armorSet: storedArmorSet, updateSlot, updateSet, loadPieces, clearSlot, clearAll } = useArmor();
  const { sets: savedSets } = useArmorSets();
  const { activePreset, setActivePresetId } = useActiveArmorPreset();

  // Piezas con el formulario abierto; el resto se muestra como resumen
  const [editing, setEditing] = useState<Set<ArmorSlot>>(new Set());
  const setSlotEditing = (slot: ArmorSlot, open: boolean) => setEditing((prev) => {
    const next = new Set(prev);
    if (open) next.add(slot); else next.delete(slot);
    return next;
  });

  const clase = getClase(character.subclase);
  const slots = armorSlotsFor(clase, character.subclase);
  // Ignora piezas que la subclase no usa (ej. escudo guardado de cuando era Caballero)
  const armorSet = useMemo(() => filterArmorForSubclase(storedArmorSet, character.subclase), [storedArmorSet, character.subclase]);
  const armorClass = ARMOR_CLASSES[character.subclase];

  const protection = useMemo(() => {
    return calcTotalProtection(armorSet, armorClass);
  }, [armorSet, armorClass]);

  const pieceCount = Object.keys(armorSet.pieces).filter((s) => {
    const p = armorSet.pieces[s as ArmorSlot];
    return p && p.pba > 0;
  }).length;

  const bonusTotals = useMemo(() => aggregateAllBonuses(armorSet), [armorSet]);
  const hasBonusTotals = Object.values(bonusTotals).some((v) => v && v > 0);

  const totalResistances = useMemo(() => {
    const res: Partial<Record<DamageTypeName, number>> = {};
    for (const dt of ALL_DAMAGE_TYPES) {
      let total = (armorSet.typeResistance[dt] ?? 0);
      for (const piece of Object.values(armorSet.pieces)) {
        if (!piece?.upgrades) continue;
        for (const upgrade of piece.upgrades) {
          if (upgrade.type === dt) total += upgrade.value;
        }
      }
      if (total > 0) res[dt] = total;
    }
    return res;
  }, [armorSet]);
  const hasResistances = Object.values(totalResistances).some((v) => v && v > 0)
    || armorSet.generalResistance.fisico > 0
    || armorSet.generalResistance.magico > 0;

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-4">
        <p className="text-xs text-zinc-500">
          {t(clase)} — {t('{n} piezas configuradas', { n: pieceCount })} | {t('Clase de Armadura:')} {armorClass}
        </p>
        <button
          onClick={() => { clearAll(); setActivePresetId(''); }}
          className="text-xs text-red-400 hover:text-red-300 hover:bg-red-400/10 px-2 py-1 rounded transition-colors"
          title={t("Borrar todas las piezas y modificadores")}
        >
          {t("Limpiar armadura")}
        </button>
      </div>

      {/* Referencia de siglas */}
      <Card className="mb-4">
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
          <div><span className="text-amber-400 font-semibold">{t("PBA")}</span> <span className="text-zinc-500">{t('— Puntos Base de Armadura. Valor base mostrado en el tooltip del ítem.')}</span></div>
          <div><span className="text-amber-400 font-semibold">{t("BCMT")}</span> <span className="text-zinc-500">{t("— Bonus Calidad-Material-Tipo. Valor \"(+X)\" junto al PBA.")}</span></div>
        </div>
      </Card>

      {/* Precargar set */}
      {(() => {
        const defaultOptions = DEFAULT_ARMOR_SETS.filter((s) => s.clase === clase && (!s.subclase || s.subclase === character.subclase));
        const customOptions = savedSets.filter((s) => !s.isDefault && s.clase === clase && (!s.subclase || s.subclase === character.subclase));
        if (defaultOptions.length === 0 && customOptions.length === 0) return null;
        return (
          <Card className="mb-4">
            <label className="text-xs text-zinc-400 font-medium mb-1 block">{t("Precargar set de armadura")}</label>
            <select
              value={activePreset?.id || ''}
              onChange={(e) => {
                const found = savedSets.find((s) => s.id === e.target.value)
                  || DEFAULT_ARMOR_SETS.find((s) => s.id === e.target.value);
                if (found) {
                  // Cada pieza se lleva la rareza del set, salvo que tenga una propia
                  const presetPieces = filterArmorForSubclase(found, character.subclase).pieces;
                  const withRareza = Object.fromEntries(
                    Object.entries(presetPieces).map(([k, p]) => [k, p && { ...p, rareza: p.rareza ?? found.rareza }]),
                  ) as typeof presetPieces;
                  loadPieces(withRareza);
                  setActivePresetId(found.id);
                  setEditing(new Set());
                }
              }}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
            >
              <option value="" disabled>{t("Elegir set para cargar...")}</option>
              {customOptions.length > 0 && (
                <optgroup label={t("Mis sets")}>
                  {customOptions.map((s) => (
                    <option key={s.id} value={s.id}>{s.nombre}</option>
                  ))}
                </optgroup>
              )}
              {defaultOptions.length > 0 && (
                <optgroup label={t("Sets base")}>
                  {defaultOptions.map((s) => (
                    <option key={s.id} value={s.id}>{s.nombre}</option>
                  ))}
                </optgroup>
              )}
            </select>
            {activePreset?.rareza === 'Artesano' && (
              <p className="text-[12px] text-zinc-500 mt-1.5">
                <Badge variant="info" className="mr-1.5">{t("Artesano")}</Badge>
                {t('Los bonus de cada pieza vienen fijos con el set; solo podés ajustar PBA, calidades y mejoras.')}
              </p>
            )}
          </Card>
        );
      })()}

      {/* Calidad para todas las piezas a la vez */}
      {pieceCount > 0 && (
        <Card className="mb-4">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 mb-2">
            <span className="text-xs font-medium text-zinc-300">{t("Calidad para todas las piezas")}</span>
            <span className="text-[12px] text-zinc-500">{t("Cambia ese tipo en todas las piezas cargadas a la vez.")}</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {ALL_DAMAGE_TYPES.map((dt) => {
              const loaded = slots.map((s) => armorSet.pieces[s]).filter((p): p is NonNullable<typeof p> => !!p && p.pba > 0);
              const qualities = new Set(loaded.map((p) => p.protectionFactors[dt] || 'Normal'));
              const shared = qualities.size === 1 ? [...qualities][0] : '';
              return (
                <label key={dt} className="flex flex-col gap-0.5">
                  <span className="text-[12px] text-zinc-500"><DamageIcon type={dt} /> {t(DAMAGE_TYPE_LABELS[dt])}</span>
                  <select
                    value={shared}
                    onChange={(e) => {
                      const val = e.target.value as ProtectionQuality;
                      for (const p of loaded) updateSlot(p.slot, { protectionFactors: { ...p.protectionFactors, [dt]: val } });
                    }}
                    className={`w-full rounded border px-1.5 py-1 text-xs focus:outline-none focus:border-amber-500 ${shared ? QUALITY_STYLES[shared] : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}
                  >
                    {!shared && <option value="" disabled>{t("Mixta")}</option>}
                    {QUALITY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-zinc-900 text-zinc-100">{opt.label}</option>
                    ))}
                  </select>
                </label>
              );
            })}
          </div>
        </Card>
      )}

      {/* Armor slot cards */}
      <div className="grid gap-4 sm:grid-cols-2 mb-4">
        {slots.map((slot) => {
          const piece = armorSet.pieces[slot];
          const isEmpty = !piece || piece.pba === 0;
          const bonuses: ArmorBonus[] = piece?.bonuses || [];
          const upgrades: ArmorUpgrade[] = piece?.upgrades || [];
          const rareza = pieceRareza(piece, activePreset?.rareza);
          const maxUpgrades = maxArmorUpgrades(activePreset?.familia, clase, slot);
          const extraUpgrades = upgrades.length - maxUpgrades;
          const isEditing = editing.has(slot);
          const slotLabel = ARMOR_SLOT_LABEL_OVERRIDES[clase]?.[slot] ?? ARMOR_SLOT_LABELS[slot];

          return (
            <Card
              key={slot}
              title={
                <span className="flex items-center justify-between w-full gap-2">
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="inline-flex shrink-0 items-center justify-center w-10 h-10 rounded-lg border border-zinc-700 bg-zinc-800 p-1"><img src={ARMOR_SLOT_ICONS[slot]} alt={slotLabel} className="w-full h-full object-contain" /></span>
                    <span className="flex flex-col items-start gap-0.5 min-w-0">
                      <span>
                        {slotLabel}
                        <span className="ml-1.5 text-[12px] font-normal text-zinc-500" title={t("Parte del cuerpo que cubre: su peso en la protección total")}>
                          {Math.round((ITEM_DISTRIBUTION[slot] ?? 0) * 100)}%
                        </span>
                      </span>
                      {!isEmpty && <Badge variant={rarezaToBadgeVariant(rareza)} className="!text-[11px] !px-1.5 !py-0">{rareza}</Badge>}
                    </span>
                  </span>
                  <span className="flex items-center gap-1 shrink-0">
                    {!isEmpty && (
                      <button
                        onClick={() => setSlotEditing(slot, !isEditing)}
                        className={`text-xs font-normal px-2 py-1 rounded transition-colors ${isEditing ? 'bg-amber-600 text-white hover:bg-amber-500' : 'text-amber-400 hover:text-amber-300 hover:bg-amber-400/10'}`}
                        title={isEditing ? t("Cerrar el formulario") : t("Editar esta pieza")}
                      >
                        {isEditing ? t("Listo") : t("Editar")}
                      </button>
                    )}
                    {piece && (
                      <button
                        onClick={() => { clearSlot(slot); setSlotEditing(slot, false); }}
                        className="text-xs font-normal text-red-400 hover:text-red-300 hover:bg-red-400/10 px-2 py-1 rounded transition-colors"
                        title={t("Borrar esta pieza")}
                      >
                        {t("Limpiar")}
                      </button>
                    )}
                  </span>
                </span>
              }
              className={isEditing ? 'border-amber-600/60' : isEmpty ? 'border-dashed' : ''}
            >
              {!isEditing && piece && !isEmpty ? (
                <ArmorPieceSummary piece={piece} />
              ) : !isEditing ? (
                <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
                  <span className="text-xs text-zinc-500">{t("Pieza vacía")}</span>
                  <button
                    onClick={() => setSlotEditing(slot, true)}
                    className="text-xs text-amber-400 hover:text-amber-300 border border-amber-600/50 hover:bg-amber-400/10 px-3 py-1.5 rounded transition-colors"
                  >
                    {t("+ Cargar a mano")}
                  </button>
                </div>
              ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label={t("PBA")}
                    tooltip={t("Puntos Base de Armadura")}
                    type="number"
                    min={0}
                    value={piece?.pba || 0}
                    onChange={(e) => updateSlot(slot, { pba: Number(e.target.value) })}
                  />
                  <Input
                    label={t("BCMT")}
                    tooltip={t("Bonus Calidad-Material-Tipo")}
                    type="number"
                    min={0}
                    value={piece?.bcmt || 0}
                    onChange={(e) => updateSlot(slot, { bcmt: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <span className="text-xs font-medium text-zinc-500 block mb-1">{t('Calidad de Protección')}</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {DAMAGE_TYPES_PAIRED.map((dt) => (
                      <div key={dt} className="flex items-center gap-1.5">
                        <DamageIcon type={dt} title={t(DAMAGE_TYPE_LABELS[dt])} className="w-[1.2em] h-[1.2em] shrink-0 text-sm" />
                        <select
                          className={`flex-1 min-w-0 rounded border px-2 py-1.5 text-xs focus:outline-none focus:border-amber-500 transition-colors ${QUALITY_STYLES[piece?.protectionFactors[dt] || 'Normal']}`}
                          value={piece?.protectionFactors[dt] || 'Normal'}
                          title={t(DAMAGE_TYPE_LABELS[dt])}
                          onChange={(e) => {
                            const val = e.target.value as ProtectionQuality | '';
                            const factors = { ...(piece?.protectionFactors || {}) };
                            if (val) factors[dt] = val as ProtectionQuality;
                            else delete factors[dt];
                            updateSlot(slot, { protectionFactors: factors });
                          }}
                        >
                          {QUALITY_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-zinc-900 text-zinc-100">{opt.label}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bonus de pieza: los slots dependen de la rareza */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-medium text-zinc-500">
                      Bonus <span className="font-normal text-zinc-600">· {armorBonusLimitLabel(rareza, t)}</span>
                    </span>
                    <ArmorRarezaSelect value={rareza} onChange={(r) => updateSlot(slot, { rareza: r })} />
                  </div>
                  <ArmorBonusSlots
                    bonuses={bonuses}
                    slot={slot}
                    rareza={rareza}
                    onChange={(next) => updateSlot(slot, { bonuses: next })}
                    lockArtesano
                  />
                </div>

                {/* Mejoras de armadura */}
                {!isEmpty && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-zinc-500">
                        {t("Mejoras")}{' '}
                        <span className={extraUpgrades > 0 ? 'text-red-400' : 'text-zinc-600'}>{upgrades.length}/{maxUpgrades}</span>{' '}
                        <HelpPopover text={t('Mejoras de armadura: cada una agrega Resistir +1% o +2% a un tipo de daño. Cuántas lleva depende del set: Magnanitas 4 (magos 7), Champion 3 (magos 5), Dragon 2 (magos 4). El escudo y el brazalete no llevan.')} />
                      </span>
                      {upgrades.length < maxUpgrades && (
                        <button
                          onClick={() => {
                            const newUpgrades = [...upgrades, { type: 'punzante' as DamageTypeName, value: 1 }];
                            updateSlot(slot, { upgrades: newUpgrades });
                          }}
                          className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
                        >
                          {t("+ Mejora")}
                        </button>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {upgrades.map((upgrade, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <div className="flex-1 min-w-0">
                            <Select
                              value={upgrade.type}
                              onChange={(e) => {
                                const newUpgrades = [...upgrades];
                                newUpgrades[idx] = { ...newUpgrades[idx], type: e.target.value as DamageTypeName };
                                updateSlot(slot, { upgrades: newUpgrades });
                              }}
                              options={ALL_DAMAGE_TYPES.map((dt) => ({ value: dt, label: DAMAGE_TYPE_LABELS[dt] }))}
                            />
                          </div>
                          <div className="w-16 shrink-0">
                            <Select
                              value={String(upgrade.value)}
                              onChange={(e) => {
                                const newUpgrades = [...upgrades];
                                newUpgrades[idx] = { ...newUpgrades[idx], value: Number(e.target.value) };
                                updateSlot(slot, { upgrades: newUpgrades });
                              }}
                              options={[
                                { value: '1', label: '+1%' },
                                { value: '2', label: '+2%' },
                              ]}
                            />
                          </div>
                          <button
                            onClick={() => {
                              const newUpgrades = upgrades.filter((_, j) => j !== idx);
                              updateSlot(slot, { upgrades: newUpgrades });
                            }}
                            className="shrink-0 w-7 h-7 flex items-center justify-center text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors"
                            title={t("Eliminar mejora")}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                    {maxUpgrades === 0 && upgrades.length === 0 && (
                      <p className="text-xs text-zinc-600">{t('Esta pieza no lleva mejoras.')}</p>
                    )}
                    {extraUpgrades > 0 && (
                      <p className="mt-1 text-xs text-red-400">
                        {maxUpgrades === 0
                          ? t('Esta pieza no lleva mejoras: sacalas.')
                          : t('Esta pieza lleva hasta {max} mejoras: sacá {n}.', { max: maxUpgrades, n: extraUpgrades })}
                      </p>
                    )}
                  </div>
                )}
                {isEmpty && (
                  <button
                    onClick={() => setSlotEditing(slot, false)}
                    className="w-full text-xs text-zinc-400 hover:text-zinc-200 py-1"
                  >
                    {t("Cancelar")}
                  </button>
                )}
              </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Resistencias Totales */}
      {hasResistances && (
        <Card title={t("Resistencias Totales (post-armadura)")} className="mb-4">
          {(armorSet.generalResistance.fisico > 0 || armorSet.generalResistance.magico > 0) && (
            <div className="flex gap-6 mb-3 text-sm">
              {armorSet.generalResistance.fisico > 0 && (
                <div><span className="text-zinc-400">{t('Física general:')}</span> <span className="text-orange-400 font-semibold">{armorSet.generalResistance.fisico}%</span></div>
              )}
              {armorSet.generalResistance.magico > 0 && (
                <div><span className="text-zinc-400">{t('Mágica general:')}</span> <span className="text-blue-400 font-semibold">{armorSet.generalResistance.magico}%</span></div>
              )}
            </div>
          )}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {ALL_DAMAGE_TYPES.map((dt) => {
              const val = totalResistances[dt] || 0;
              const isPhysical = PHYSICAL_DAMAGE_TYPES.includes(dt);
              const baseRes = armorSet.typeResistance[dt] ?? 0;
              const upgradeRes = val - baseRes;
              return (
                <div key={dt} className="text-center">
                  <div className="text-xs text-zinc-500 mb-1"><DamageIcon type={dt} /> {t(DAMAGE_TYPE_LABELS[dt])}</div>
                  <div className={`text-lg font-bold ${val > 0 ? (isPhysical ? 'text-orange-400' : 'text-blue-400') : 'text-zinc-600'}`}>
                    {val}%
                  </div>
                  {upgradeRes > 0 && (
                    <div className="text-xs text-zinc-500">
                      {baseRes > 0 && <span>{baseRes}% base</span>}
                      {baseRes > 0 && ' + '}<span className="text-amber-400">+{upgradeRes}% mejoras</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Bonus totals summary (pieces + set) */}
      {hasBonusTotals && (
        <Card
          title={
            <span className="flex items-center gap-2">
              {t("Bonus Totales de Armadura")}
              {activePreset && <span className="text-xs text-zinc-500 font-normal">({t('piezas + conjunto')}: {activePreset.nombre})</span>}
            </span>
          }
          className="mb-4"
        >
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
            {ARMOR_BONUS_TYPES.filter((dt) => bonusTotals[dt]).map((dt) => (
              <div key={dt}>
                <span className="text-zinc-400">{t(ARMOR_BONUS_LABELS[dt])}:</span>{' '}
                <span className="text-amber-400 font-semibold">+{bonusTotals[dt]}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Modificadores */}
      <ArmorModifiersSection title={t("Modificadores (habilidades activas)")} armorSet={armorSet}>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs mb-4 mt-3">
          <div><span className="text-amber-400 font-semibold">{t("Armadura %")}</span> <span className="text-zinc-500">{t("— Bonus porcentual global de habilidades/buffs a toda la armadura.")}</span></div>
          <div><span className="text-amber-400 font-semibold">{t("FP")}</span> <span className="text-zinc-500">{t('— Factor de Protección. Calidad de la pieza contra cada tipo de daño.')}</span></div>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Input
              label={t("Armadura %")}
              tooltip={t("Bonus porcentual global de habilidades/buffs")}
              type="number"
              min={0}
              max={100}
              value={armorSet.bonusArmaduraPct}
              onChange={(e) => updateSet({ bonusArmaduraPct: Number(e.target.value) })}
            />
            <Input
              label={t('Resistencia Física %')}
              tooltip={t('Reducción porcentual general a TODO el daño físico, después de la armadura.')}
              type="number"
              min={0}
              max={100}
              value={armorSet.generalResistance.fisico}
              onChange={(e) => updateSet({ generalResistance: { ...armorSet.generalResistance, fisico: Number(e.target.value) } })}
            />
            <Input
              label={t('Resistencia Mágica %')}
              tooltip={t('Reducción porcentual general a TODO el daño mágico, después de la armadura.')}
              type="number"
              min={0}
              max={100}
              value={armorSet.generalResistance.magico}
              onChange={(e) => updateSet({ generalResistance: { ...armorSet.generalResistance, magico: Number(e.target.value) } })}
            />
          </div>

          <div>
            <span className="text-xs font-medium text-zinc-400 block mb-2">{t("Resistencia por Tipo %")} <HelpPopover text={t('Reducción porcentual específica por tipo de daño. Se aplica después de la protección de armadura.')} /></span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {ALL_DAMAGE_TYPES.map((dt) => (
                <Input
                  key={dt}
                  label={t(DAMAGE_TYPE_LABELS[dt])}
                  type="number"
                  min={0}
                  max={100}
                  value={armorSet.typeResistance[dt] || 0}
                  onChange={(e) => updateSet({ typeResistance: { ...armorSet.typeResistance, [dt]: Number(e.target.value) } })}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('Reducción Melee %')}
              tooltip={t('Reduce el daño final de ataques cuerpo a cuerpo (espadas, mazas, hachas, etc.).')}
              type="number"
              min={0}
              max={100}
              value={armorSet.meleeDmgReductionPct}
              onChange={(e) => updateSet({ meleeDmgReductionPct: Number(e.target.value) })}
            />
            <Input
              label={t('Reducción Rango %')}
              tooltip={t('Reduce el daño final de ataques a distancia (arcos, báculos, etc.).')}
              type="number"
              min={0}
              max={100}
              value={armorSet.rangedDmgReductionPct}
              onChange={(e) => updateSet({ rangedDmgReductionPct: Number(e.target.value) })}
            />
          </div>

          <div>
            <span className="text-xs font-medium text-zinc-400 block mb-2">{t('Barrera Mágica por Tipo')} <HelpPopover text={t('Puntos de barrera mágica que absorben daño de ese tipo antes de que llegue a tu vida. Se consumen con cada golpe.')} /></span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {ALL_DAMAGE_TYPES.map((dt) => (
                <Input
                  key={dt}
                  label={t(DAMAGE_TYPE_LABELS[dt])}
                  type="number"
                  min={0}
                  value={armorSet.barrierPoints[dt] || 0}
                  onChange={(e) => updateSet({ barrierPoints: { ...armorSet.barrierPoints, [dt]: Number(e.target.value) } })}
                />
              ))}
            </div>
          </div>
        </div>
      </ArmorModifiersSection>
    </div>
  );
}
