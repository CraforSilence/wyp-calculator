'use client';

import { useState } from 'react';
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
import { PageHeader } from '@/components/layout/PageHeader';
import { useCharacter } from '@/hooks/useCharacter';
import { useBuildWeapon } from '@/hooks/useBuildWeapon';
import { useArmor } from '@/hooks/useArmor';
import { useJewelry } from '@/hooks/useJewelry';
import { encodeShareCode, stripWeapon } from '@/lib/share';
import type { ShareResult, BuildPayload } from '@/lib/share';
import type { Weapon } from '@/types/weapon';

const TABS = [
  { id: 'build', label: 'Build' },
  { id: 'armas', label: 'Armas y Joyeria' },
  { id: 'armadura', label: 'Armadura' },
  { id: 'simulacion', label: 'Simulacion' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function BuildPage() {
  const [activeTab, setActiveTab] = useState<TabId>('build');
  const [showImport, setShowImport] = useState(false);
  const { toast } = useToast();
  const { character, updateCharacter } = useCharacter();
  const {
    weapon, setWeapon, hasWeapon,
    weaponMode, setWeaponMode,
    secondaryWeapon, setSecondaryWeapon,
    arrows, setArrows,
  } = useBuildWeapon();
  const { armorSet, loadPieces, updateSet } = useArmor();
  const { jewelry, updatePiece } = useJewelry();

  const hasArmorData = Object.values(armorSet.pieces).some((p) => p && p.pba > 0);

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

    const code = encodeShareCode('build', payload);
    navigator.clipboard.writeText(code).then(
      () => toast('Build copiado al portapapeles', 'success'),
      () => toast('Error al copiar', 'error'),
    );
  };

  const handleImportBuild = (result: ShareResult) => {
    const data = result.data as BuildPayload;

    // Character
    updateCharacter(data.character);

    // Weapon
    setWeapon({ ...data.weapon, id: 'build-weapon', createdAt: '', isDefault: false } as Weapon);
    setWeaponMode(data.weaponMode || '2manos');
    if (data.secondaryWeapon) {
      setSecondaryWeapon({ ...data.secondaryWeapon, id: 'build-weapon-secondary', createdAt: '', isDefault: false } as Weapon);
    }
    if (data.arrows) {
      setArrows(data.arrows);
    }

    // Armor
    if (data.armor) {
      const { pieces, ...armorRest } = data.armor;
      loadPieces(pieces || {});
      updateSet(armorRest);
    }

    // Jewelry
    if (data.jewelry) {
      const j = data.jewelry;
      if (j.anillo1) updatePiece('anillo1', j.anillo1.bonuses || []);
      if (j.anillo2) updatePiece('anillo2', j.anillo2.bonuses || []);
      if (j.amuleto) updatePiece('amuleto', j.amuleto.bonuses || []);
    }

    toast('Build importado', 'success');
  };

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
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setShowImport(true)}>Importar build</Button>
            <Button size="sm" onClick={handleExportBuild}>Exportar build</Button>
          </div>
        }
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

      <ImportModal
        open={showImport}
        onClose={() => setShowImport(false)}
        expectedType="build"
        onImport={handleImportBuild}
      />
    </div>
  );
}
