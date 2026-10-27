'use client';

import { useState } from 'react';
import { useSessionStorage } from '@/hooks/useSessionStorage';
import { Collapsible } from '@/components/ui/Collapsible';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { ImportModal } from '@/components/ui/ImportModal';
import { BuildPersonaje } from '@/components/build/BuildPersonaje';
import { BuildArma } from '@/components/build/BuildArma';
import { BuildJoyeria } from '@/components/build/BuildJoyeria';
import { BuildArmadura } from '@/components/build/BuildArmadura';
import { BuildDanos } from '@/components/build/BuildDanos';
import { BuildProtecciones } from '@/components/build/BuildProtecciones';
import { BuildSimulacion } from '@/components/build/BuildSimulacion';
import { StepIntro, StepNav, WithSidePanel } from '@/components/build/BuildSteps';
import { WeaponDamagePanel } from '@/components/build/WeaponDamagePanel';
import { ArmorStatusPanel } from '@/components/build/ArmorStatusPanel';
import { PageHeader } from '@/components/layout/PageHeader';
import { useCharacter } from '@/hooks/useCharacter';
import { useBuildWeapon } from '@/hooks/useBuildWeapon';
import { useArmor } from '@/hooks/useArmor';
import { useJewelry } from '@/hooks/useJewelry';
import { useActiveArmorPreset } from '@/hooks/useActiveArmorPreset';
import { stripWeapon } from '@/lib/share';
import { useShare } from '@/components/ui/ShareProvider';
import { useShareImport } from '@/hooks/useShareImport';
import type { ShareResult, BuildPayload } from '@/lib/share';
import type { Weapon } from '@/types/weapon';

// El id 'build' se conserva para no romper la pestaña guardada en sessionStorage.
const TABS = [
  { id: 'build', label: 'Personaje' },
  { id: 'armas', label: 'Arma y Joyería' },
  { id: 'armadura', label: 'Armadura' },
  { id: 'simulacion', label: 'Simulación' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function BuildPage() {
  const [activeTab, setActiveTab] = useSessionStorage<TabId>('regnum-build-tab', 'build');
  const [showImport, setShowImport] = useState(false);
  const { toast } = useToast();
  const { share } = useShare();
  const { importShare } = useShareImport();
  const { character, updateCharacter } = useCharacter();
  const {
    weapon, setWeapon, hasWeapon,
    weaponMode, setWeaponMode,
    secondaryWeapon, setSecondaryWeapon,
    arrows, setArrows,
  } = useBuildWeapon();
  const { armorSet, loadPieces, updateSet } = useArmor();
  const { jewelry, updatePiece } = useJewelry();
  // Mantiene los bonus del set precargado en la armadura aunque no se abra el paso 3
  useActiveArmorPreset();

  const hasArmorData = Object.values(armorSet.pieces).some((p) => p && p.pba > 0);
  const hasJewelry = Object.values(jewelry).some((p) => p.bonuses.length > 0);

  const tabIndex = TABS.findIndex((t) => t.id === activeTab);
  const prevTab = tabIndex > 0 ? TABS[tabIndex - 1] : undefined;
  const nextTab = tabIndex < TABS.length - 1 ? TABS[tabIndex + 1] : undefined;
  const goTo = (id: TabId) => {
    setActiveTab(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExportBuild = () => {
    const payload: BuildPayload = {
      character,
      weapon: stripWeapon(weapon),
      weaponMode,
      armor: armorSet,
      jewelry,
    };
    if (secondaryWeapon.nombre) {
      payload.secondaryWeapon = stripWeapon(secondaryWeapon);
    }
    if (arrows.nombre) {
      payload.arrows = arrows;
    }

    share('build', payload);
  };

  const handleImportBuild = (result: ShareResult) => {
    toast(importShare(result).message, 'success');
  };

  const tabDone: Record<TabId, boolean> = {
    build: false,
    armas: hasWeapon,
    armadura: hasArmorData,
    simulacion: false,
  };

  // Avisos al pie del paso; ningun paso bloquea el avance. La armadura es opcional, asi que no avisa.
  const nextHint: Partial<Record<TabId, string>> = {
    armas: hasWeapon ? undefined : 'Sin arma no vas a poder simular tu daño. Podés seguir igual y volver después.',
  };

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Build"
        description="Armá tu personaje paso a paso: clase y atributos, arma y joyería, armadura y, al final, la simulación contra un enemigo."
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setShowImport(true)}>Importar build</Button>
            <Button size="sm" onClick={handleExportBuild}>Compartir build</Button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-zinc-800">
        {TABS.map((tab, i) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span
              aria-hidden
              className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[12px] font-semibold ${
                tabDone[tab.id]
                  ? 'bg-emerald-600 text-white'
                  : activeTab === tab.id
                    ? 'bg-amber-600 text-white'
                    : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {tabDone[tab.id] ? '✓' : i + 1}
            </span>
            {/* En celular solo se ve el nombre del paso activo */}
            <span className={activeTab === tab.id ? '' : 'hidden sm:inline'}>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'build' && (
        <>
          <StepIntro step={1} title="Elegí tu personaje">
            <p>Seleccioná la clase y la subclase, y cargá tus atributos. De esto dependen el multiplicador de daño y las armas que podés usar.</p>
          </StepIntro>
          <BuildPersonaje />
        </>
      )}

      {activeTab === 'armas' && (
        <>
        <StepIntro
          step={2}
          title="Cargá tu arma y tu joyería"
          checklist={[
            { label: 'Arma', done: hasWeapon, required: true, note: 'necesaria para simular tu daño' },
            { label: 'Joyería', done: hasJewelry, note: 'opcional, suma sus bonus a tu daño' },
          ]}
        >
          <p>
            <strong className="text-zinc-100">Arma:</strong> elegí una en <em>Precargar arma existente</em> o completá los datos a mano, como figuran en el tooltip del juego.
          </p>
          <p>
            <strong className="text-zinc-100">Joyería:</strong> sumá los bonus de tus anillos y tu amuleto. Al final ves el daño del arma con todo aplicado.
          </p>
        </StepIntro>
        <WithSidePanel panel={<WeaponDamagePanel />}>
          <Collapsible title="Arma" defaultOpen>
            <BuildArma />
          </Collapsible>

          <Collapsible title="Joyeria" defaultOpen>
            <BuildJoyeria />
          </Collapsible>

          <Collapsible title="Danos de Arma" defaultOpen>
            <BuildDanos />
          </Collapsible>
        </WithSidePanel>
        </>
      )}

      {activeTab === 'armadura' && (
        <>
        <StepIntro
          step={3}
          title="Cargá tu armadura (opcional)"
          checklist={[{ label: 'Armadura', done: hasArmorData, note: 'opcional, solo para probar un arma enemiga contra tu armadura' }]}
        >
          <p>Elegí un set precargado o completá cada pieza con su PBA y sus factores de protección. Debajo ves tus protecciones totales contra cada tipo de daño.</p>
          <p className="text-zinc-400">Si solo querés ver cuánto daño hacés, podés saltear este paso.</p>
        </StepIntro>
        <WithSidePanel panel={<ArmorStatusPanel />}>
          <Collapsible title="Armadura" defaultOpen>
            <BuildArmadura />
          </Collapsible>

          <Collapsible title="Protecciones" defaultOpen>
            <BuildProtecciones />
          </Collapsible>
        </WithSidePanel>
        </>
      )}

      {activeTab === 'simulacion' && (
        <>
        <StepIntro
          step={4}
          title="Simulá el combate"
          checklist={[
            { label: 'Tu Arma vs Enemigo', done: hasWeapon, required: true, note: 'necesita tu arma (paso 2)' },
            { label: 'Tu Armadura vs Enemigo', done: hasArmorData, note: 'necesita tu armadura (paso 3)' },
          ]}
        >
          <p>Elegí qué querés probar y completá los puntos en orden. Cada simulación usa solo lo que necesita.</p>
        </StepIntro>
        <BuildSimulacion onGoTo={goTo} />
        </>
      )}

      <StepNav
        prev={prevTab && { label: prevTab.label, onClick: () => goTo(prevTab.id) }}
        next={nextTab && { label: nextTab.label, onClick: () => goTo(nextTab.id) }}
        hint={nextHint[activeTab]}
      />

      <ImportModal
        open={showImport}
        onClose={() => setShowImport(false)}
        expectedType="build"
        onImport={handleImportBuild}
      />
    </div>
  );
}
