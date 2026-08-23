'use client';

import { useState, useCallback } from 'react';
import { useCharacter } from '@/hooks/useCharacter';
import { useJewelry } from '@/hooks/useJewelry';
import { useArmor } from '@/hooks/useArmor';
import { useBuildWeapon } from '@/hooks/useBuildWeapon';
import { simulateHits } from '@/lib/engine/simulation';
import { DEFAULT_WEAPONS } from '@/data/default-weapons';
import { ARMOR_CLASSES, CLASE_SUBCLASES } from '@/lib/engine/constants';
import { calcWeaponDamage } from '@/lib/engine/damage';
import { calcTotalProtection } from '@/lib/engine/armor';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Collapsible } from '@/components/ui/Collapsible';
import { EnemyArmorEditor } from './EnemyArmorEditor';
import { SimResultados } from './SimResultados';
import type { ArmorSet, ArmorSlot, ArmorPiece } from '@/types/armor';
import type { Weapon } from '@/types/weapon';
import type { Clase } from '@/types/character';
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

function makeEmptyPiece(slot: ArmorSlot): ArmorPiece {
  return { slot, pba: 0, bcmt: 0, protectionFactors: {}, bonusProteccionPct: {}, bonuses: [] };
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
  const [offResult, setOffResult] = useState<SimulationResult | null>(null);

  const enemySubclase = CLASE_SUBCLASES[enemyClase][0];
  const enemyArmorClass = ARMOR_CLASSES[enemySubclase];

  const handleUpdateEnemySlot = useCallback((slot: ArmorSlot, updates: Partial<ArmorPiece>) => {
    setEnemyArmor((prev) => {
      const existing = prev.pieces[slot] || makeEmptyPiece(slot);
      return { ...prev, pieces: { ...prev.pieces, [slot]: { ...existing, ...updates, slot } } };
    });
  }, []);

  const handleUpdateEnemySet = useCallback((updates: Partial<Omit<ArmorSet, 'pieces'>>) => {
    setEnemyArmor((prev) => ({ ...prev, ...updates }));
  }, []);

  // --- Defensive state: enemy weapon ---
  const [enemyWeaponId, setEnemyWeaponId] = useState('');
  const [defResult, setDefResult] = useState<SimulationResult | null>(null);

  const enemyWeapon = DEFAULT_WEAPONS.find((w) => w.id === enemyWeaponId) || null;

  // --- Simulate offensive ---
  const handleSimOffensive = () => {
    if (!hasWeapon) return;
    const sim = simulateHits(myWeapon, character, jewelry, enemyArmor, 10);
    setOffResult(sim);
  };

  // --- Simulate defensive ---
  const handleSimDefensive = () => {
    if (!enemyWeapon) return;
    const sim = simulateHits(enemyWeapon, character, null, myArmor, 10);
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
            <span className="text-zinc-600">( {enemyArmorPieceCount} piezas )</span>
          </div>

          {!hasWeapon && (
            <p className="text-sm text-zinc-500">
              Configura un arma en &quot;Armas y Joyeria&quot; primero.
            </p>
          )}

          {hasWeapon && (
            <>
              {/* Tu arma - resumen */}
              <Card title="Tu Arma">
                {myWeaponCalc && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 text-center text-sm">
                    <div>
                      <div className="text-xs text-zinc-500">Dano</div>
                      <div className="font-semibold text-zinc-200">{myWeaponCalc.danoMin}-{myWeaponCalc.danoMax}</div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500">Promedio</div>
                      <div className="font-semibold text-zinc-200">{myWeaponCalc.danoPromedio}</div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500">DPS</div>
                      <div className="font-bold text-amber-400">{myWeaponCalc.dpsEfectivo}</div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500">Crit</div>
                      <div className="font-semibold text-zinc-200">{myWeaponCalc.critTotalPct}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500">Vel</div>
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
                  onChangeClase={setEnemyClase}
                  onUpdateSlot={handleUpdateEnemySlot}
                  onUpdateSet={handleUpdateEnemySet}
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
            <span className="text-zinc-600">( Enemigo )</span>
          </div>

          {myArmorPieceCount === 0 && (
            <p className="text-sm text-zinc-500">
              Configura piezas de armadura en &quot;Armadura&quot; primero.
            </p>
          )}

          {myArmorPieceCount > 0 && (
            <>
              {/* Tu armadura - resumen */}
              <Card title="Tu Armadura">
                <div className="text-sm text-zinc-400">
                  {myArmorPieceCount} piezas configuradas &middot; CA: {ARMOR_CLASSES[character.subclase]}
                  {myArmor.bonusArmaduraPct > 0 && <span> &middot; Armadura +{myArmor.bonusArmaduraPct}%</span>}
                  {myArmor.generalResistance.fisico > 0 && <span> &middot; Res.F {myArmor.generalResistance.fisico}%</span>}
                  {myArmor.generalResistance.magico > 0 && <span> &middot; Res.M {myArmor.generalResistance.magico}%</span>}
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
                        const calc = calcWeaponDamage(enemyWeapon, character, null);
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
