'use client';

import { useState } from 'react';
import { Collapsible } from '@/components/ui/Collapsible';
import { BuildPersonaje } from '@/components/build/BuildPersonaje';
import { BuildArma } from '@/components/build/BuildArma';
import { BuildJoyeria } from '@/components/build/BuildJoyeria';
import { BuildArmadura } from '@/components/build/BuildArmadura';
import { BuildDanos } from '@/components/build/BuildDanos';
import { BuildProtecciones } from '@/components/build/BuildProtecciones';
import { BuildSimulacion } from '@/components/build/BuildSimulacion';
import { PageHeader } from '@/components/layout/PageHeader';
import { useBuildWeapon } from '@/hooks/useBuildWeapon';
import { useArmor } from '@/hooks/useArmor';

const TABS = [
  { id: 'build', label: 'Build' },
  { id: 'armas', label: 'Armas y Joyeria' },
  { id: 'armadura', label: 'Armadura' },
  { id: 'simulacion', label: 'Simulacion' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function BuildPage() {
  const [activeTab, setActiveTab] = useState<TabId>('build');
  const { hasWeapon } = useBuildWeapon();
  const { armorSet } = useArmor();

  const hasArmorData = Object.values(armorSet.pieces).some((p) => p && p.pba > 0);

  const tabHasData: Record<TabId, boolean> = {
    build: false,
    armas: hasWeapon,
    armadura: hasArmorData,
    simulacion: false,
  };

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="Build"
        description="Configura tu personaje completo: clase, arma, joyeria y armadura."
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-zinc-800">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {tab.label}
            {tabHasData[tab.id] && (
              <span className="absolute top-1.5 right-1 w-1.5 h-1.5 rounded-full bg-amber-500" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'build' && (
        <BuildPersonaje />
      )}

      {activeTab === 'armas' && (
        <div className="space-y-4">
          <Collapsible title="Arma" defaultOpen>
            <BuildArma />
          </Collapsible>

          <Collapsible title="Joyeria" defaultOpen>
            <BuildJoyeria />
          </Collapsible>

          <Collapsible title="Danos de Arma" defaultOpen>
            <BuildDanos />
          </Collapsible>
        </div>
      )}

      {activeTab === 'armadura' && (
        <div className="space-y-4">
          <Collapsible title="Armadura" defaultOpen>
            <BuildArmadura />
          </Collapsible>

          <Collapsible title="Protecciones" defaultOpen>
            <BuildProtecciones />
          </Collapsible>
        </div>
      )}

      {activeTab === 'simulacion' && (
        <BuildSimulacion />
      )}
    </div>
  );
}
