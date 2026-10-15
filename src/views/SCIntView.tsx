import React, { useState } from 'react';
import { SovereignSectorId, SCIntTier, SCIntNodeBlueprint } from '@/types';
import { SCINT_VENTURE_BLUEPRINTS, SCINT_TIERS } from '@/data/scintData';
import { SCIntTopBar } from './scint/SCIntTopBar';
import { SCIntStep1StageSelect } from './scint/SCIntStep1StageSelect';
import { SCIntStep2PlaybookSelect } from './scint/SCIntStep2PlaybookSelect';
import { SCIntStep3VentureDossier } from './scint/SCIntStep3VentureDossier';
import { SCIntSectorComingSoon } from './scint/SCIntSectorComingSoon';

export const SCIntView: React.FC = () => {
  // Multi-Sector state
  const [currentSector, setCurrentSector] = useState<SovereignSectorId>('semiconductor');

  // Guided 3-Step Journey state
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedTier, setSelectedTier] = useState<SCIntTier>(0);
  const [selectedPlaybook, setSelectedPlaybook] = useState<SCIntNodeBlueprint | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const scrollToTop = () => {
    try {
      if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch {
      // no-op in test environments
    }
  };

  // Step 1 -> Step 2
  const handleSelectStage = (tier: SCIntTier) => {
    setSelectedTier(tier);
    setCurrentStep(2);
    scrollToTop();
  };

  // Step 2 -> Step 3
  const handleSelectPlaybook = (playbook: SCIntNodeBlueprint) => {
    setSelectedPlaybook(playbook);
    setCurrentStep(3);
    scrollToTop();
  };

  // Breadcrumb navigation
  const handleNavigateStep = (step: 1 | 2 | 3) => {
    setCurrentStep(step);
    scrollToTop();
  };

  const currentTierMeta = SCINT_TIERS.find((t) => t.tier === selectedTier);
  const selectedStageTitle = currentTierMeta
    ? currentTierMeta.title.split(':')[1]?.trim() || currentTierMeta.title
    : undefined;

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-8 select-none view-enter">
      {/* Top Header with Multi-Sector Selector & 3-Step Breadcrumbs */}
      <SCIntTopBar
        currentSector={currentSector}
        onSelectSector={setCurrentSector}
        currentStep={currentStep}
        onNavigateStep={handleNavigateStep}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedStageName={currentStep >= 2 ? selectedStageTitle : undefined}
        selectedPlaybookName={currentStep >= 3 ? selectedPlaybook?.name : undefined}
      />

      {/* Main Viewport Content */}
      <main className="transition-all duration-200">
        {currentSector !== 'semiconductor' ? (
          <SCIntSectorComingSoon
            sectorId={currentSector}
            onBackToSemiconductors={() => setCurrentSector('semiconductor')}
          />
        ) : (
          <>
            {/* STEP 1: CHOOSE STAGE IN SILICON CONTINUUM */}
            {currentStep === 1 && (
              <SCIntStep1StageSelect onSelectStage={handleSelectStage} />
            )}

            {/* STEP 2: CHOOSE CURATED VENTURE PLAYBOOK */}
            {currentStep === 2 && (
              <SCIntStep2PlaybookSelect
                selectedTier={selectedTier}
                blueprints={SCINT_VENTURE_BLUEPRINTS}
                onSelectPlaybook={handleSelectPlaybook}
                onBackToStages={() => setCurrentStep(1)}
                searchQuery={searchQuery}
              />
            )}

            {/* STEP 3: THE VENTURE EXECUTIVE DOSSIER */}
            {currentStep === 3 && selectedPlaybook && (
              <SCIntStep3VentureDossier
                playbook={selectedPlaybook}
                onBackToPlaybooks={() => setCurrentStep(2)}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};
