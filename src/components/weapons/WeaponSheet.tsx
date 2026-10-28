'use client';

import { DAMAGE_TYPE_LABELS, MUESCA_TYPE_LABELS, PHYSICAL_DAMAGE_TYPES, RAREZA_SLOTS, isMuescaSpeedType } from '@/lib/engine/constants';
import type { DamageTypeName, MuescaType, Weapon, WeaponAttr } from '@/types/weapon';
import { getWeaponAttributes, WEAPON_ATTR_LABELS } from '@/lib/weaponAttributes';
import { useT } from '@/i18n/I18nProvider';
import { BonusIcon, DamageIcon } from '@/components/icons/StatIcons';

function Row({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-2 py-0.5">
      <span className="text-xs text-zinc-500">{label}</span>
      <span className="text-sm text-right text-zinc-200">{children}</span>
    </div>
  );
}

const fmtPct = (n: number) => `${n > 0 ? '+' : ''}${n}%`;

/** Bonus del arma tal como se cargan en sus slots (mismos nombres que el formulario del Build). */
function weaponBonusList(weapon: Weapon): { key: string; label: string; value: string; dmgType?: string }[] {
  const list: { key: string; label: string; value: string; dmgType?: string }[] = [];
  for (const [attr, valor] of Object.entries(getWeaponAttributes(weapon)) as [WeaponAttr, number][]) {
    const label = WEAPON_ATTR_LABELS[attr];
    if (valor) list.push({ key: label, label, value: `+${valor}` });
  }
  if (weapon.critChanceExtra) list.push({ key: 'Chance de critico %', label: 'Chance de crítico', value: fmtPct(weapon.critChanceExtra) });
  if (weapon.critDmgExtra) list.push({ key: 'Dano critico %', label: 'Daño crítico', value: fmtPct(weapon.critDmgExtra) });
  if (weapon.attackSpeedPct) list.push({ key: 'Vel ataque %', label: 'Vel. ataque', value: fmtPct(weapon.attackSpeedPct) });
  if (weapon.castSpeedPct) list.push({ key: 'Vel invocacion %', label: 'Vel. invocación', value: fmtPct(weapon.castSpeedPct) });
  if (weapon.atributoClasePct) list.push({ key: 'Atributo de clase %', label: 'Atributo de clase', value: fmtPct(weapon.atributoClasePct) });
  for (const [tipo, valor] of Object.entries(weapon.bonusDano) as [DamageTypeName, number][]) {
    if (valor) list.push({ key: tipo, label: `Daño ${DAMAGE_TYPE_LABELS[tipo]}`, dmgType: DAMAGE_TYPE_LABELS[tipo], value: `+${valor}` });
  }
  return list;
}

/** Contador de slots usados: "1/2" y, si sobran, cuantos quedan libres. */
function SlotCount({ used, max }: { used: number; max: number }) {
  const t = useT();
  return (
    <span className="normal-case tracking-normal text-zinc-500">
      {used}/{max}{used < max && <span className="text-zinc-600"> · {max - used} {max - used === 1 ? t("libre") : t("libres")}</span>}
    </span>
  );
}

/**
 * Lo que trae el arma, como se ve al cargarla en el Build: dano base, stat base, bonus y
 * muescas. Sirve para ver de donde salen los numeros antes del detalle calculado.
 */
export function WeaponSheet({ weapon }: { weapon: Weapon }) {
  const t = useT();
  const slots = RAREZA_SLOTS[weapon.rareza];
  const bonuses = weaponBonusList(weapon);
  const muescas = (Object.entries(weapon.muescas) as [MuescaType, number][]).filter(([, v]) => v);
  const baseTypes = Object.entries(weapon.tiposDano) as [DamageTypeName, [number, number]][];

  return (
    <div className="rounded-md border border-zinc-700/70 bg-zinc-950/70 px-3 py-2.5 shadow-inner">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[11px] uppercase tracking-wider text-amber-500/80 font-semibold">{t("Ficha del arma")}</span>
        <span className="text-[11px] text-zinc-600" title={t("Lo que trae el arma, sin tu personaje ni la joyería")}>{t("como se carga")}</span>
      </div>

      <div className="mt-1.5">
        <div className="text-[11px] uppercase tracking-wider text-zinc-600">{t("Daño base")}</div>
        {baseTypes.length === 0 ? (
          <span className="text-xs text-zinc-600">{t("Sin daño cargado")}</span>
        ) : baseTypes.map(([tipo, [min, max]]) => (
          <Row key={tipo} label={
            <span className="inline-flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${PHYSICAL_DAMAGE_TYPES.includes(tipo) ? 'bg-orange-500' : 'bg-blue-500'}`} />
              <DamageIcon type={tipo} /> {t(DAMAGE_TYPE_LABELS[tipo])}
            </span>
          }>
            <span className="tabular-nums">{min === max ? min : `${min} – ${max}`}</span>
          </Row>
        ))}
        {weapon.bonusAtributo !== 0 && (
          <Row label={<span title={t("El 'Stat Base (+daño)' del tooltip del arma")}>{t("Stat base (+daño)")}</span>}>
            <span className="text-amber-400 font-semibold">+{weapon.bonusAtributo}</span>
          </Row>
        )}
      </div>

      <div className="mt-1.5 pt-1.5 border-t border-zinc-800/80">
        <div className="text-[11px] uppercase tracking-wider text-zinc-600 flex justify-between gap-2">
          Bonus <SlotCount used={bonuses.length} max={slots.bonus} />
        </div>
        {bonuses.length === 0 ? (
          <span className="text-xs text-zinc-600">{t("Sin bonus")}</span>
        ) : bonuses.map((b) => (
          <Row key={b.key} label={<span><BonusIcon bonus={b.key} /> {b.dmgType ? `${t('Daño')} ${t(b.dmgType)}` : t(b.label)}</span>}>
            <span className="text-amber-400 font-semibold">{b.value}</span>
          </Row>
        ))}
      </div>

      <div className="mt-1.5 pt-1.5 border-t border-zinc-800/80">
        <div className="text-[11px] uppercase tracking-wider text-zinc-600 flex justify-between gap-2">
          Muescas <SlotCount used={muescas.length} max={slots.muescas} />
        </div>
        {muescas.length === 0 ? (
          <span className="text-xs text-zinc-600">{t("Sin muescas")}</span>
        ) : muescas.map(([tipo, valor]) => (
          <Row key={tipo} label={<span><BonusIcon bonus={tipo} /> {t(MUESCA_TYPE_LABELS[tipo] || tipo)}</span>}>
            {isMuescaSpeedType(tipo)
              ? <span className="text-amber-400 font-semibold">+{valor}%</span>
              : <span className="text-purple-400 font-semibold" title={t("Nivel de la gema")}>nv {valor}</span>}
          </Row>
        ))}
      </div>

      {weapon.notas && (
        <p className="mt-1.5 pt-1.5 border-t border-zinc-800/80 text-[12px] italic text-zinc-500">{weapon.notas}</p>
      )}
    </div>
  );
}
