'use client';

import { useState, useCallback } from 'react';
import { useCharacter } from '@/hooks/useCharacter';
import { useJewelry } from '@/hooks/useJewelry';
import { useArmor } from '@/hooks/useArmor';
import { useBuildWeapon } from '@/hooks/useBuildWeapon';
import { simulateHits } from '@/lib/engine/simulation';
import { DEFAULT_WEAPONS } from '@/data/default-weapons';
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

const SIM_TABS = [
  { id: 'ofensiva', label: 'Tu Arma vs Enemigo' },
  { id: 'defensiva', label: 'Tu Armadura vs Enemigo' },
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
  for (const t of ALL_DAMAGE_TYPES) protectionFactors[t] = 'Normal';
  return { slot, pba: 0, bcmt: 0, protectionFactors, bonusProteccionPct: {}, bonuses: [], upgrades: [] };
}

export function BuildSimulacion() {
  const { character } = useCharacter();
  const { jewelry } = useJewelry();
  const { armorSet: myArmor } = useArmor();
  const { weapon: myWeapon, hasWeapon } = useBuildWeapon();

  const [simTab, setSimTab] = useState<SimTabId>('ofensiva');

  // --- Offensive state: enemy armor ---
  const [enemyArmor, setEnemyArmor] = useState<ArmorSet>(EMPTY_ARMOR);
  const [enemyClase, setEnemyClase] = useState<Clase>('Guerrero');
  const [enemySubclase, setEnemySubclase] = useState<Subclase>('Bárbaro');
  const [offResult, setOffResult] = useState<SimulationResult | null>(null);

  const handleChangeEnemyClase = useCallback((clase: Clase) => {
    setEnemyClase(clase);
    setEnemySubclase(CLASE_SUBCLASES[clase][0]);
  }, []);

  const handleUpdateEnemySlot = useCallback((slot: ArmorSlot, updates: Partial<ArmorPiece>) => {
    setEnemyArmor((prev) => {
      const existing = prev.pieces[slot] || makeEmptyPiece(slot);
      return { ...prev, pieces: { ...prev.pieces, [slot]: { ...existing, ...updates, slot } } };
    });
  }, []);

  const handleUpdateEnemySet = useCallback((updates: Partial<Omit<ArmorSet, 'pieces'>>) => {
    setEnemyArmor((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleLoadArmorPreset = useCallback((armorSet: ArmorSet, clase: Clase, subclase: Subclase) => {
    setEnemyArmor(armorSet);
    setEnemyClase(clase);
    setEnemySubclase(subclase);
  }, []);

  // --- Enemy jewelry (shared between tabs) ---
  const [enemyJewelry, setEnemyJewelry] = useState<JewelrySet>(EMPTY_JEWELRY);
  const enemyJewelryBonusCount = Object.values(enemyJewelry).reduce((s, p) => s + p.bonuses.length, 0);

  // --- Defensive state: enemy weapon + attacker profile ---
  const [enemyWeaponId, setEnemyWeaponId] = useState('');
  const [defEnemyClase, setDefEnemyClase] = useState<Clase>('Guerrero');
  const [defEnemySubclase, setDefEnemySubclase] = useState<Subclase>('Bárbaro');
  const [defEnemyMainStat, setDefEnemyMainStat] = useState(100);
  const [defResult, setDefResult] = useState<SimulationResult | null>(null);

  const enemyWeapon = DEFAULT_WEAPONS.find((w) => w.id === enemyWeaponId) || null;

  const handleChangeDefEnemyClase = useCallback((clase: Clase) => {
    setDefEnemyClase(clase);
    setDefEnemySubclase(CLASE_SUBCLASES[clase][0]);
  }, []);

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
    const sim = simulateHits(myWeapon, character, jewelry, enemyArmor, 10, enemySubclase, enemyJewelry);
    setOffResult(sim);
  };

  // --- Simulate defensive ---
  const handleSimDefensive = () => {
    if (!enemyWeapon) return;
    const sim = simulateHits(enemyWeapon, enemyAttackerProfile, enemyJewelry, myArmor, 10, character.subclase, jewelry);
    setDefResult(sim);
  };

  // --- Weapon calc for summary ---
  const myWeaponCalc = hasWeapon ? calcWeaponDamage(myWeapon, character, jewelry) : null;
  const myArmorPieceCount = Object.keys(myArmor.pieces).filter((s) => {
    const p = myArmor.pieces[s as ArmorSlot];
    return p && p.pba > 0;
  }).length;
  const enemyArmorPieceCount = Object.keys(enemyArmor.pieces).filter((s) => {
    const p = enemyArmor.pieces[s as ArmorSlot];
    return p && p.pba > 0;
  }).length;

  return (
    <div className="space-y-4">
      {/* Sub-tabs */}
      <div className="flex gap-1 border-b border-zinc-800">
        {SIM_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSimTab(tab.id)}
            className={`px-3 py-1.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              simTab === tab.id
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===== OFFENSIVE: Tu Arma vs Armadura Enemiga ===== */}
      {simTab === 'ofensiva' && (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap text-sm">
            <span className="text-amber-400 font-semibold">
              {myWeapon.nombre || 'Sin arma'}
            </span>
            <span className="text-zinc-600">( Tu )</span>
            <span className="text-zinc-500 mx-1">vs</span>
            <span className="text-red-400 font-semibold">
              Armadura enemiga
            </span>
            <span className="text-zinc-600">( {enemySubclase} &middot; CA: {ARMOR_CLASSES[enemySubclase]} &middot; {enemyArmorPieceCount} piezas )</span>
          </div>

          {!hasWeapon && (
            <p className="text-sm text-zinc-500">
              Configura un arma en &quot;Armas y Joyeria&quot; primero.
            </p>
          )}

          {hasWeapon && (
            <>
              {/* Tu arma - resumen */}
              <Card title={<span className="flex items-center gap-1">Tu Arma <HelpPopover text="Resumen de tu arma con tu build actual. Los valores incluyen bonuses de joyeria y atributos." /></span>}>
                {myWeaponCalc && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 text-center text-sm">
                    <div>
                      <div className="text-xs text-zinc-500" title="Rango de dano min-max por golpe">Dano</div>
                      <div className="font-semibold text-zinc-200">{myWeaponCalc.danoMin}-{myWeaponCalc.danoMax}</div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500" title="Dano promedio por golpe">Promedio</div>
                      <div className="font-semibold text-zinc-200">{myWeaponCalc.danoPromedio}</div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500" title="Dano por segundo. Tiene en cuenta velocidad y criticos.">DPS</div>
                      <div className="font-bold text-amber-400">{myWeaponCalc.dpsEfectivo}</div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500" title="Probabilidad de golpe critico">Crit</div>
                      <div className="font-semibold text-zinc-200">{myWeaponCalc.critTotalPct}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500" title="Tiempo entre ataques en segundos. Menor = mas rapido.">Vel</div>
                      <div className="font-semibold text-zinc-200">{myWeaponCalc.velEfectiva}s</div>
                    </div>
                  </div>
                )}
              </Card>

              {/* Armadura enemiga */}
              <Collapsible title={`Armadura Enemiga (${enemyArmorPieceCount} piezas)`} defaultOpen={enemyArmorPieceCount === 0}>
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

              {/* Joyeria enemiga */}
              <Collapsible title={`Joyeria Enemiga (${enemyJewelryBonusCount} bonuses)`} defaultOpen={false}>
                <EnemyJewelryEditor
                  jewelry={enemyJewelry}
                  onUpdate={setEnemyJewelry}
                />
              </Collapsible>

              {/* Simular */}
              <Button onClick={handleSimOffensive}>Simular 10 golpes</Button>

              {offResult && <SimResultados result={offResult} />}
            </>
          )}
        </div>
      )}

      {/* ===== DEFENSIVE: Tu Armadura vs Arma Enemiga ===== */}
      {simTab === 'defensiva' && (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap text-sm">
            <span className="text-blue-400 font-semibold">
              Tu Armadura
            </span>
            <span className="text-zinc-600">( {myArmorPieceCount} piezas )</span>
            <span className="text-zinc-500 mx-1">vs</span>
            <span className="text-red-400 font-semibold">
              {enemyWeapon?.nombre || 'Arma enemiga'}
            </span>
            <span className="text-zinc-600">( {defEnemySubclase} &middot; {SUBCLASE_MAIN_STAT[defEnemySubclase]} {defEnemyMainStat}{enemyJewelryBonusCount > 0 ? ` · ${enemyJewelryBonusCount} bonuses` : ''} )</span>
          </div>

          {myArmorPieceCount === 0 && (
            <p className="text-sm text-zinc-500">
              Configura piezas de armadura en &quot;Armadura&quot; primero.
            </p>
          )}

          {myArmorPieceCount > 0 && (
            <>
              {/* Tu armadura - resumen */}
              <Card title={<span className="flex items-center gap-1">Tu Armadura <HelpPopover text="Tu armadura configurada en el tab Armadura. CA = Clase de Armadura (multiplicador de defensa)." /></span>}>
                <div className="text-sm text-zinc-400">
                  {myArmorPieceCount} piezas configuradas &middot; CA: {ARMOR_CLASSES[character.subclase]}
                  {myArmor.bonusArmaduraPct > 0 && <span> &middot; Armadura +{myArmor.bonusArmaduraPct}%</span>}
                  {myArmor.generalResistance.fisico > 0 && <span> &middot; Res.F {myArmor.generalResistance.fisico}%</span>}
                  {myArmor.generalResistance.magico > 0 && <span> &middot; Res.M {myArmor.generalResistance.magico}%</span>}
                </div>
              </Card>

              {/* Perfil atacante enemigo */}
              <Card title={<span className="flex items-center gap-1">Perfil Atacante Enemigo <HelpPopover text="Define la clase, subclase y stat principal del enemigo que te ataca. Afecta el dano que genera su arma." /></span>}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Select
                    label="Clase"
                    value={defEnemyClase}
                    onChange={(e) => handleChangeDefEnemyClase(e.target.value as Clase)}
                    options={[
                      { value: 'Guerrero', label: 'Guerrero' },
                      { value: 'Arquero', label: 'Arquero' },
                      { value: 'Mago', label: 'Mago' },
                    ]}
                  />
                  <Select
                    label="Subclase"
                    value={defEnemySubclase}
                    onChange={(e) => setDefEnemySubclase(e.target.value as Subclase)}
                    options={CLASE_SUBCLASES[defEnemyClase].map((sc) => ({ value: sc, label: sc }))}
                  />
                  <Input
                    label={SUBCLASE_MAIN_STAT[defEnemySubclase]}
                    tooltip="Stat principal del enemigo. Afecta directamente el dano de su arma."
                    type="number"
                    min={20}
                    max={120}
                    value={defEnemyMainStat}
                    onChange={(e) => setDefEnemyMainStat(Number(e.target.value))}
                  />
                  <div className="flex flex-col gap-1 justify-end">
                    <span className="text-xs text-zinc-400 font-medium">CA Enemigo</span>
                    <span className="text-sm text-zinc-200 bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5">{ARMOR_CLASSES[defEnemySubclase]}x</span>
                  </div>
                </div>
              </Card>

              {/* Arma enemiga - selector */}
              <Card title="Arma Enemiga">
                <div>
                  <label className="text-xs text-zinc-400 font-medium block mb-1">Seleccionar arma enemiga</label>
                  <select
                    value={enemyWeaponId}
                    onChange={(e) => setEnemyWeaponId(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Elegir arma...</option>
                    {DEFAULT_WEAPONS.map((w) => (
                      <option key={w.id} value={w.id}>[{w.subcategoria}] {w.nombre}</option>
                    ))}
                  </select>
                  {enemyWeapon && (
                    <div className="mt-2 grid grid-cols-3 sm:grid-cols-5 gap-3 text-center text-sm">
                      {(() => {
                        const calc = calcWeaponDamage(enemyWeapon, enemyAttackerProfile, enemyJewelry);
                        return (
                          <>
                            <div>
                              <div className="text-xs text-zinc-500">Dano</div>
                              <div className="font-semibold text-zinc-200">{calc.danoMin}-{calc.danoMax}</div>
                            </div>
                            <div>
                              <div className="text-xs text-zinc-500">Promedio</div>
                              <div className="font-semibold text-zinc-200">{calc.danoPromedio}</div>
                            </div>
                            <div>
                              <div className="text-xs text-zinc-500">DPS</div>
                              <div className="font-bold text-red-400">{calc.dpsEfectivo}</div>
                            </div>
                            <div>
                              <div className="text-xs text-zinc-500">Crit</div>
                              <div className="font-semibold text-zinc-200">{calc.critTotalPct}%</div>
                            </div>
                            <div>
                              <div className="text-xs text-zinc-500">Vel</div>
                              <div className="font-semibold text-zinc-200">{calc.velEfectiva}s</div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </Card>

              {/* Joyeria enemiga */}
              <Collapsible title={`Joyeria Enemiga (${enemyJewelryBonusCount} bonuses)`} defaultOpen={false}>
                <EnemyJewelryEditor
                  jewelry={enemyJewelry}
                  onUpdate={setEnemyJewelry}
                />
              </Collapsible>

              {/* Simular */}
              <Button onClick={handleSimDefensive} disabled={!enemyWeapon}>
                Simular 10 golpes
              </Button>

              {defResult && <SimResultados result={defResult} />}
            </>
          )}
        </div>
      )}
    </div>
  );
}
