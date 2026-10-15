import React, { useState } from 'react';
import { SCIntHubId, SCIntNodeBlueprint } from '@/types';
import { SCINT_VENTURE_BLUEPRINTS } from '@/data/scintData';
import { SCIntHeader } from './scint/SCIntHeader';
import { SCIntValueChainHub } from './scint/SCIntValueChainHub';
import { SCIntBlueprintStudio } from './scint/SCIntBlueprintStudio';
import { SCIntSubsidyLab } from './scint/SCIntSubsidyLab';
import { SCIntClustersHub } from './scint/SCIntClustersHub';
import { SCIntGeniusInspector } from './scint/SCIntGeniusInspector';

export const SCIntView: React.FC = () => {
  const [activeHub, setActiveHub] = useState<SCIntHubId>('journey');
  const [searchQuery, setSearchQuery] = useState('');
  const [capexScale, setCapexScale] = useState<'modular' | 'benchmark'>('modular');
  const [selectedBlueprint, setSelectedBlueprint] = useState<SCIntNodeBlueprint | null>(null);

  // 20% Gujarat / UP state industrial incentive baseline
  const stateTopUpPercent = 20;

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-6 select-none view-enter">
      {/* Apple Studio Top Header & Hub Navigation */}
      <SCIntHeader
        activeHub={activeHub}
        onSelectHub={setActiveHub}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        capexScale={capexScale}
        onScaleChange={setCapexScale}
      />

      {/* 4 Focused Studio Hub Viewports */}
      <main className="transition-all duration-150">
        {activeHub === 'journey' && (
          <SCIntValueChainHub
            blueprints={SCINT_VENTURE_BLUEPRINTS}
            onSelectBlueprint={setSelectedBlueprint}
            capexScale={capexScale}
            stateTopUpPercent={stateTopUpPercent}
            searchQuery={searchQuery}
          />
        )}

        {activeHub === 'blueprints' && (
          <SCIntBlueprintStudio
            blueprints={SCINT_VENTURE_BLUEPRINTS}
            onSelectBlueprint={setSelectedBlueprint}
            capexScale={capexScale}
            stateTopUpPercent={stateTopUpPercent}
            searchQuery={searchQuery}
          />
        )}

        {activeHub === 'subsidies' && (
          <SCIntSubsidyLab />
        )}

        {activeHub === 'clusters' && (
          <SCIntClustersHub />
        )}
      </main>

      {/* Apple-grade Genius Slide-Over Inspector */}
      <SCIntGeniusInspector
        blueprint={selectedBlueprint}
        onClose={() => setSelectedBlueprint(null)}
        stateTopUpPercent={stateTopUpPercent}
      />
    </div>
  );
};
