'use client';

import { useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useArmor } from '@/hooks/useArmor';
import { useBuildDamage } from '@/hooks/useBuildDamage';
import { simulateHits } from '@/lib/engine/simulation';
import { useWeapons } from '@/hooks/useWeapons';
import { ARMOR_CLASSES, CLASE_SUBCLASES, SUBCLASE_MAIN_STAT, CRIT_BASE, ALL_DAMAGE_TYPES } from '@/lib/engine/constants';
import { calcWeaponDamage } from '@/lib/engine/damage';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Collapsible } from '@/components/ui/Collapsible';
import { HelpPopover } from '@/components/ui/HelpPopover';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EnemyArmorEditor } from './EnemyArmorEditor';
import { EnemyJewelryEditor } from './EnemyJewelryEditor';
import { SimResultados } from './SimResultados';
import type { ArmorSet, ArmorSlot, ArmorPiece } from '@/types/armor';
import type { JewelrySet } from '@/types/jewelry';
import type { Weapon } from '@/types/weapon';
import type { Clase, Subclase, CharacterProfile } from '@/types/character';
import type { SimulationResult } from '@/types/simulation';
import { useT } from '@/i18n/I18nProvider';

const SIM_TABS = [
  {
    id: 'ofensiva',
    icon: '⚔️',
    label: 'Tu Arma vs Enemigo',
    question: '¿Cuánto daño le hacés?',
    uses: 'Tu arma y tu joyería contra la armadura de un enemigo.',
  },
  {
    id: 'defensiva',
    icon: '🛡️',
    label: 'Tu Armadura vs Enemigo',
    question: '¿Cuánto daño te hacen?',
    uses: 'El arma de un enemigo contra tu armadura y tu joyería.',
  },
] as const;

type SimTabId = (typeof SIM_TABS)[number]['id'];

const EMPTY_ARMOR: ArmorSet = {
  pieces: {},
  bonusArmaduraPct: 0,
  generalResistance: { fisico: 0, magico: 0 },
  typeResistance: {},
  barrierPoints: {},
  meleeDmgReductionPct: 0,
  rangedDmgReductionPct: 0,
};

const EMPTY_JEWELRY: JewelrySet = {
  anillo1: { slot: 'anillo1', bonuses: [] },
  anillo2: { slot: 'anillo2', bonuses: [] },
  amuleto: { slot: 'amuleto', bonuses: [] },
};

function makeEmptyPiece(slot: ArmorSlot): ArmorPiece {
  const protectionFactors: Record<string, string> = {};
  for (const dt of ALL_DAMAGE_TYPES) protectionFactors[dt] = 'Normal';
  return { slot, pba: 0, bcmt: 0, protectionFactors, bonusProteccionPct: {}, bonuses: [], upgrades: [] };
}

function ClearButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="text-xs text-red-400 hover:text-red-300 hover:bg-red-400/10 px-2 py-1 rounded transition-colors"
    >
      {label}
    </button>
  );
}

/** Encabezado numerado de cada parte de una simulacion. */
function SimStep({ n, title, hint, optional, action }: {
  n: number;
  title: string;
  hint?: string;
  optional?: boolean;
  action?: React.ReactNode;
}) {
  const t = useT();
  return (
    <div className="flex items-start gap-2.5 pt-2">
      <span className="shrink-0 mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 text-[12px] font-semibold text-zinc-300">
        {n}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold text-zinc-200">
          {title}
          {optional && <span className="ml-1.5 text-xs font-normal text-zinc-500">{t("(opcional)")}</span>}
        </h3>
        {hint && <p className="text-xs text-zinc-500 mt-0.5">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

interface BuildSimulacionProps {
  /** Lleva al paso del Build donde se carga lo que falta. */
  onGoTo?: (step: 'armas' | 'armadura') => void;
}

export function BuildSimulacion({ onGoTo }: BuildSimulacionProps = {}) {
  const t = useT();
  const { armorSet: myArmor } = useArmor();
  // Personaje (con los atributos de la armadura), joyería y daño del arma tal como los calcula el Build:
  // con flechas o en duales si corresponde
  const { character, jewelry, weapon: myWeapon, hasWeapon, mainCalc } = useBuildDamage();
  const { weapons: allWeapons } = useWeapons();
  const customWeapons = allWeapons.filter((w) => !w.isDefault);
  const defaultWeapons = allWeapons.filter((w) => w.isDefault);

  const [simTab, setSimTab] = useLocalStorage<SimTabId>('regnum-sim-tab', 'ofensiva');

  // --- Offensive state: enemy armor ---
  const [enemyArmor, setEnemyArmor] = useLocalStorage<ArmorSet>('regnum-sim-enemy-armor', EMPTY_ARMOR);
  const [enemyClase, setEnemyClase] = useLocalStorage<Clase>('regnum-sim-enemy-clase', 'Guerrero');
  const [enemySubclase, setEnemySubclase] = useLocalStorage<Subclase>('regnum-sim-enemy-subclase', 'Bárbaro');
  const [offResult, setOffResult] = useLocalStorage<SimulationResult | null>('regnum-sim-off-result', null);

  const handleChangeEnemyClase = useCallback((clase: Clase) => {
    setEnemyClase(clase);
    setEnemySubclase(CLASE_SUBCLASES[clase][0]);
  }, [setEnemyClase, setEnemySubclase]);

  const handleUpdateEnemySlot = useCallback((slot: ArmorSlot, updates: Partial<ArmorPiece>) => {
    setEnemyArmor((prev) => {
      const existing = prev.pieces[slot] || makeEmptyPiece(slot);
      return { ...prev, pieces: { ...prev.pieces, [slot]: { ...existing, ...updates, slot } } };
    });
  }, [setEnemyArmor]);

  const handleUpdateEnemySet = useCallback((updates: Partial<Omit<ArmorSet, 'pieces'>>) => {
    setEnemyArmor((prev) => ({ ...prev, ...updates }));
  }, [setEnemyArmor]);

  const handleLoadArmorPreset = useCallback((armorSet: ArmorSet, clase: Clase, subclase: Subclase) => {
    setEnemyArmor(armorSet);
    setEnemyClase(clase);
    setEnemySubclase(subclase);
  }, [setEnemyArmor, setEnemyClase, setEnemySubclase]);

  // --- Enemy jewelry (shared between tabs) ---
  const [enemyJewelry, setEnemyJewelry] = useLocalStorage<JewelrySet>('regnum-sim-enemy-jewelry', EMPTY_JEWELRY);
  const enemyJewelryBonusCount = Object.values(enemyJewelry).reduce((s, p) => s + p.bonuses.length, 0);

  // --- Defensive state: enemy weapon + attacker profile ---
  const [enemyWeaponId, setEnemyWeaponId] = useLocalStorage<string>('regnum-sim-enemy-weapon', '');
  const [defEnemyClase, setDefEnemyClase] = useLocalStorage<Clase>('regnum-sim-def-clase', 'Guerrero');
  const [defEnemySubclase, setDefEnemySubclase] = useLocalStorage<Subclase>('regnum-sim-def-subclase', 'Bárbaro');
  const [defEnemyMainStat, setDefEnemyMainStat] = useLocalStorage<number>('regnum-sim-def-mainstat', 100);
  const [defResult, setDefResult] = useLocalStorage<SimulationResult | null>('regnum-sim-def-result', null);

  const enemyWeapon = allWeapons.find((w) => w.id === enemyWeaponId) || null;

  const handleChangeDefEnemyClase = useCallback((clase: Clase) => {
    setDefEnemyClase(clase);
    setDefEnemySubclase(CLASE_SUBCLASES[clase][0]);
  }, [setDefEnemyClase, setDefEnemySubclase]);

  // --- Limpiar ---
  const clearEnemyArmor = () => {
    setEnemyArmor(EMPTY_ARMOR);
    setOffResult(null);
  };
  const clearEnemyJewelry = () => setEnemyJewelry(EMPTY_JEWELRY);
  const clearEnemyAttacker = () => {
    setEnemyWeaponId('');
    setDefEnemyClase('Guerrero');
    setDefEnemySubclase('Bárbaro');
    setDefEnemyMainStat(100);
    setDefResult(null);
  };

  // Build enemy character profile for defensive simulation
  const enemyAttackerProfile: CharacterProfile = {
    clase: defEnemyClase,
    subclase: defEnemySubclase,
    stats: {
      STR: SUBCLASE_MAIN_STAT[defEnemySubclase] === 'STR' ? defEnemyMainStat : 20,
      DXT: SUBCLASE_MAIN_STAT[defEnemySubclase] === 'DXT' ? defEnemyMainStat : 20,
      INT: SUBCLASE_MAIN_STAT[defEnemySubclase] === 'INT' ? defEnemyMainStat : 20,
    },
    critBase: CRIT_BASE[defEnemySubclase],
    critMult: 1.5,
  };

  // --- Simulate offensive ---
  const handleSimOffensive = () => {
    if (!hasWeapon) return;
    const sim = simulateHits(myWeapon, character, jewelry, enemyArmor, 10, enemySubclase, enemyJewelry, mainCalc);
    setOffResult(sim);
  };

  // --- Simulate defensive ---
  const handleSimDefensive = () => {
    if (!enemyWeapon) return;
    const sim = simulateHits(enemyWeapon, enemyAttackerProfile, enemyJewelry, myArmor, 10, character.subclase, jewelry);
    setDefResult(sim);
  };

  // --- Weapon calc for summary ---
  const myWeaponCalc = hasWeapon ? mainCalc : null;
  const myArmorPieceCount = Object.keys(myArmor.pieces).filter((s) => {
    const p = myArmor.pieces[s as ArmorSlot];
    return p && p.pba > 0;
  }).length;
  const enemyArmorPieceCount = Object.keys(enemyArmor.pieces).filter((s) => {
    const p = enemyArmor.pieces[s as ArmorSlot];
    return p && p.pba > 0;
  }).length;

  const activeMode = SIM_TABS.find((dt) => dt.id === simTab) ?? SIM_TABS[0];
  const enemyWeaponCalc = enemyWeapon ? calcWeaponDamage(enemyWeapon, enemyAttackerProfile, enemyJewelry) : null;
  const changeLink = (label: string, step: 'armas' | 'armadura') => onGoTo && (
    <button
      onClick={() => onGoTo(step)}
      className="shrink-0 text-xs text-amber-400 hover:text-amber-300 hover:underline"
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-4">
      {/* Selector de modo: cada uno responde una pregunta distinta */}
      <div>
        <p className="text-xs text-zinc-400 font-medium mb-2">{t("¿Qué querés probar?")}</p>
        <div className="grid sm:grid-cols-2 gap-2">
          {SIM_TABS.map((tab) => {
            const active = simTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSimTab(tab.id)}
                aria-pressed={active}
                className={`text-left rounded-lg border px-4 py-3 transition-colors ${
                  active
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-zinc-800 bg-zinc-900 hover:border-zinc-600'
                }`}
              >
                <div className={`text-sm font-semibold flex items-center gap-2 ${active ? 'text-amber-300' : 'text-zinc-200'}`}>
                  <span aria-hidden>{tab.icon}</span>
                  {t(tab.question)}
                </div>
                <div className="text-xs text-zinc-400 mt-1">
                  <span className="text-zinc-300">{t(tab.label)}:</span> {t(tab.uses)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Resumen de lo que se esta probando */}
      <div className="flex items-center gap-2 flex-wrap text-sm rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-2.5">
        <span className="text-zinc-500">{t("Probando:")}</span>
        {activeMode.id === 'ofensiva' ? (
          <>
            <span className="text-amber-400 font-semibold">{myWeapon.nombre || t('Tu arma (sin cargar)')}</span>
            <span className="text-zinc-600">({t('vos')} · {t(character.subclase)})</span>
            <span className="text-zinc-500 mx-1">{t("golpea a")}</span>
            <span className="text-red-400 font-semibold">{t('{subclase} enemigo', { subclase: t(enemySubclase) })}</span>
            <span className="text-zinc-600">
              ({enemyArmorPieceCount > 0 ? t('{n} piezas de armadura', { n: enemyArmorPieceCount }) : t("sin armadura")} · CA {ARMOR_CLASSES[enemySubclase]})
            </span>
          </>
        ) : (
          <>
            <span className="text-red-400 font-semibold">{enemyWeapon?.nombre || t('Arma enemiga (sin elegir)')}</span>
            <span className="text-zinc-600">({t(defEnemySubclase)} · {t(SUBCLASE_MAIN_STAT[defEnemySubclase])} {defEnemyMainStat})</span>
            <span className="text-zinc-500 mx-1">{t("te golpea a vos")}</span>
            <span className="text-blue-400 font-semibold">{t(character.subclase)}</span>
            <span className="text-zinc-600">({t('{n} piezas · CA {ca}', { n: myArmorPieceCount, ca: ARMOR_CLASSES[character.subclase] })})</span>
          </>
        )}
      </div>

      {/* ===== OFFENSIVE: Tu Arma vs Armadura Enemiga ===== */}
      {simTab === 'ofensiva' && (
        <div className="space-y-3">
          {!hasWeapon && (
            <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-300 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3">
              <span>{t("Para simular tu daño necesitás cargar un arma.")}</span>
              {onGoTo && (
                <Button size="sm" onClick={() => onGoTo('armas')}>{t("Cargar arma →")}</Button>
              )}
            </div>
          )}

          {hasWeapon && (
            <>
              <SimStep
                n={1}
                title={t("Tu arma")}
                hint={t("La que cargaste en el paso 2, con tu joyería y tus atributos ya aplicados.")}
                action={changeLink(t('Cambiar arma'), 'armas')}
              />
              <Card title={<span className="flex items-center gap-1">{myWeapon.nombre || t('Tu Arma')} <HelpPopover text={t('Resumen de tu arma con tu build actual. Los valores incluyen bonuses de joyería y atributos, todavía sin la armadura del enemigo.')} /></span>}>
                {myWeaponCalc && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 text-center text-sm">
                    <div>
                      <div className="text-xs text-zinc-500" title={t('Rango de daño mín-máx por golpe')}>{t('Daño')}</div>
                      <div className="font-semibold text-zinc-200">{myWeaponCalc.danoMin}-{myWeaponCalc.danoMax}</div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500" title={t('Daño promedio por golpe')}>{t("Promedio")}</div>
                      <div className="font-semibold text-zinc-200">{myWeaponCalc.danoPromedio}</div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500" title={t('Daño por segundo. Tiene en cuenta velocidad y críticos.')}>{t("DPS")}</div>
                      <div className="font-bold text-amber-400">{myWeaponCalc.dpsEfectivo}</div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500" title={t('Probabilidad de golpe crítico')}>{t("Crit")}</div>
                      <div className="font-semibold text-zinc-200">{myWeaponCalc.critTotalPct}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500" title={t('Tiempo entre ataques en segundos. Menor = más rápido.')}>{t("Vel")}</div>
                      <div className="font-semibold text-zinc-200">{myWeaponCalc.velEfectiva}s</div>
                    </div>
                  </div>
                )}
              </Card>

              <SimStep
                n={2}
                title={t("Armadura del enemigo")}
                hint={enemyArmorPieceCount > 0
                  ? t('Elegí la clase del enemigo y un set precargado, o editá las piezas a mano.')
                  : t('Elegí la clase del enemigo y un set precargado, o editá las piezas a mano. Si no cargás nada, le pegás a un objetivo sin armadura.')}
                action={<ClearButton onClick={clearEnemyArmor} label={t("Limpiar")} />}
              />
              <Collapsible title={t('Armadura Enemiga ({n} piezas)', { n: enemyArmorPieceCount })} defaultOpen={enemyArmorPieceCount === 0}>
                <EnemyArmorEditor
                  armorSet={enemyArmor}
                  enemyClase={enemyClase}
                  enemySubclase={enemySubclase}
                  onChangeClase={handleChangeEnemyClase}
                  onChangeSubclase={setEnemySubclase}
                  onUpdateSlot={handleUpdateEnemySlot}
                  onUpdateSet={handleUpdateEnemySet}
                  onLoadPreset={handleLoadArmorPreset}
                />
              </Collapsible>

              <SimStep
                n={3}
                title={t("Joyería del enemigo")}
                optional
                hint={t("Sus bonus de protección y resistencia reducen el daño que le hacés.")}
                action={enemyJewelryBonusCount > 0 ? <ClearButton onClick={clearEnemyJewelry} label={t("Limpiar")} /> : undefined}
              />
              <Collapsible title={t('Joyería Enemiga ({n} bonus)', { n: enemyJewelryBonusCount })} defaultOpen={false}>
                <EnemyJewelryEditor
                  jewelry={enemyJewelry}
                  onUpdate={setEnemyJewelry}
                />
              </Collapsible>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Button size="lg" onClick={handleSimOffensive}>{t("⚔️ Simular 10 golpes tuyos")}</Button>
                <span className="text-xs text-zinc-500">{t("Cada vez que simulás, los golpes y los críticos salen al azar.")}</span>
              </div>

              {offResult && (
                <div className="space-y-2 pt-2">
                  <h3 className="text-sm font-semibold text-amber-300">
                    {t('Resultado: daño que le hacés a un {subclase} con tu {arma}', { subclase: t(enemySubclase), arma: myWeapon.nombre || t('arma') })}
                  </h3>
                  <SimResultados result={offResult} weaponStats={myWeaponCalc} />
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ===== DEFENSIVE: Tu Armadura vs Arma Enemiga ===== */}
      {simTab === 'defensiva' && (
        <div className="space-y-3">
          {myArmorPieceCount === 0 && (
            <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-300 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3">
              <span>{t("Para probar un arma enemiga contra vos necesitás cargar tu armadura.")}</span>
              {onGoTo && (
                <Button size="sm" onClick={() => onGoTo('armadura')}>{t("Cargar armadura →")}</Button>
              )}
            </div>
          )}

          {myArmorPieceCount > 0 && (
            <>
              <SimStep
                n={1}
                title={t("Tu armadura")}
                hint={t("La que cargaste en el paso 3. Tu joyería también suma a tu defensa.")}
                action={changeLink(t('Cambiar armadura'), 'armadura')}
              />
              <Card title={<span className="flex items-center gap-1">{t("Tu Armadura")} <HelpPopover text={t("Tu armadura configurada en el paso Armadura. CA = Clase de Armadura (multiplicador de defensa).")} /></span>}>
                <div className="text-sm text-zinc-400">
                  {t('{n} piezas configuradas', { n: myArmorPieceCount })} &middot; {t('CA')}: {ARMOR_CLASSES[character.subclase]}
                  {myArmor.bonusArmaduraPct > 0 && <span> &middot; Armadura +{myArmor.bonusArmaduraPct}%</span>}
                  {myArmor.generalResistance.fisico > 0 && <span> &middot; Res.F {myArmor.generalResistance.fisico}%</span>}
                  {myArmor.generalResistance.magico > 0 && <span> &middot; Res.M {myArmor.generalResistance.magico}%</span>}
                </div>
              </Card>

              <SimStep
                n={2}
                title={t("Quién te ataca")}
                hint={t("La clase y el atributo principal del enemigo cambian el daño de su arma.")}
                action={<ClearButton onClick={clearEnemyAttacker} label={t("Limpiar")} />}
              />
              <Card title={<span className="flex items-center gap-1">{t("Perfil Atacante Enemigo")} <HelpPopover text={t('Define la clase, subclase y stat principal del enemigo que te ataca. Afecta el daño que genera su arma.')} /></span>}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Select
                    label={t("Clase")}
                    value={defEnemyClase}
                    onChange={(e) => handleChangeDefEnemyClase(e.target.value as Clase)}
                    options={[
                      { value: 'Guerrero', label: 'Guerrero' },
                      { value: 'Arquero', label: 'Arquero' },
                      { value: 'Mago', label: 'Mago' },
                    ]}
                  />
                  <Select
                    label={t("Subclase")}
                    value={defEnemySubclase}
                    onChange={(e) => setDefEnemySubclase(e.target.value as Subclase)}
                    options={CLASE_SUBCLASES[defEnemyClase].map((sc) => ({ value: sc, label: sc }))}
                  />
                  <Input
                    label={SUBCLASE_MAIN_STAT[defEnemySubclase]}
                    tooltip={t('Stat principal del enemigo. Afecta directamente el daño de su arma.')}
                    type="number"
                    min={20}
                    max={120}
                    value={defEnemyMainStat}
                    onChange={(e) => setDefEnemyMainStat(Number(e.target.value))}
                  />
                  <div className="flex flex-col gap-1 justify-end">
                    <span className="text-xs text-zinc-400 font-medium">{t("CA Enemigo")}</span>
                    <span className="text-sm text-zinc-200 bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5">{ARMOR_CLASSES[defEnemySubclase]}x</span>
                  </div>
                </div>
              </Card>

              <SimStep
                n={3}
                title={t("Con qué arma te ataca")}
                hint={t("Elegí una de tus armas guardadas o un arma base.")}
              />
              <Card title={t("Arma Enemiga")}>
                <div>
                  <label className="text-xs text-zinc-400 font-medium block mb-1">{t("Seleccionar arma enemiga")}</label>
                  <select
                    value={enemyWeaponId}
                    onChange={(e) => setEnemyWeaponId(e.target.value)}
                    className={`w-full bg-zinc-800 border rounded px-2.5 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500 ${
                      enemyWeapon ? 'border-zinc-700' : 'border-amber-500/60'
                    }`}
                  >
                    <option value="">{t("Elegir arma...")}</option>
                    {customWeapons.length > 0 && (
                      <optgroup label={t("Mis armas")}>
                        {customWeapons.map((w) => (
                          <option key={w.id} value={w.id}>[{t(w.subcategoria)}] {w.nombre}</option>
                        ))}
                      </optgroup>
                    )}
                    {defaultWeapons.length > 0 && (
                      <optgroup label={t("Armas base")}>
                        {defaultWeapons.map((w) => (
                          <option key={w.id} value={w.id}>[{t(w.subcategoria)}] {w.nombre}</option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                  {enemyWeaponCalc && (
                    <div className="mt-2 grid grid-cols-3 sm:grid-cols-5 gap-3 text-center text-sm">
                      <div>
                        <div className="text-xs text-zinc-500">{t('Daño')}</div>
                        <div className="font-semibold text-zinc-200">{enemyWeaponCalc.danoMin}-{enemyWeaponCalc.danoMax}</div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500">{t("Promedio")}</div>
                        <div className="font-semibold text-zinc-200">{enemyWeaponCalc.danoPromedio}</div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500">{t("DPS")}</div>
                        <div className="font-bold text-red-400">{enemyWeaponCalc.dpsEfectivo}</div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500">{t("Crit")}</div>
                        <div className="font-semibold text-zinc-200">{enemyWeaponCalc.critTotalPct}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500">{t("Vel")}</div>
                        <div className="font-semibold text-zinc-200">{enemyWeaponCalc.velEfectiva}s</div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              <SimStep
                n={4}
                title={t("Joyería del enemigo")}
                optional
                hint={t("Sus bonus de daño, crítico y atributos aumentan el daño que te hace.")}
                action={enemyJewelryBonusCount > 0 ? <ClearButton onClick={clearEnemyJewelry} label={t("Limpiar")} /> : undefined}
              />
              <Collapsible title={t('Joyería Enemiga ({n} bonus)', { n: enemyJewelryBonusCount })} defaultOpen={false}>
                <EnemyJewelryEditor
                  jewelry={enemyJewelry}
                  onUpdate={setEnemyJewelry}
                />
              </Collapsible>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Button size="lg" onClick={handleSimDefensive} disabled={!enemyWeapon}>
                  {t("🛡️ Simular 10 golpes del enemigo")}
                </Button>
                <span className="text-xs text-zinc-500">
                  {enemyWeapon
                    ? t('Cada vez que simulás, los golpes y los críticos salen al azar.')
                    : t('Primero elegí con qué arma te ataca (punto 3).')}
                </span>
              </div>

              {defResult && (
                <div className="space-y-2 pt-2">
                  <h3 className="text-sm font-semibold text-red-300">
                    {enemyWeapon ? t('Resultado: daño que recibís de un {subclase} con {arma}', { subclase: t(defEnemySubclase), arma: enemyWeapon.nombre }) : t('Resultado: daño que recibís de un {subclase}', { subclase: t(defEnemySubclase) })}
                  </h3>
                  <SimResultados result={defResult} weaponStats={enemyWeaponCalc} />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
