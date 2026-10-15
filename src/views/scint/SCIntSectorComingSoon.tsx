import React from 'react';
import { SovereignSectorId } from '@/types';
import { SOVEREIGN_SECTORS } from '@/data/scintData';
import { ArrowLeft, Sun, BatteryCharging, Mountain, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/common/Button';

interface SCIntSectorComingSoonProps {
  sectorId: SovereignSectorId;
  onBackToSemiconductors: () => void;
}

export const SCIntSectorComingSoon: React.FC<SCIntSectorComingSoonProps> = ({
  sectorId,
  onBackToSemiconductors,
}) => {
  const sector = SOVEREIGN_SECTORS.find((s) => s.id === sectorId) || SOVEREIGN_SECTORS[1];

  const getSectorIcon = () => {
    switch (sectorId) {
      case 'solar':
        return <Sun className="w-12 h-12 text-amber-500" />;
      case 'batteries':
        return <BatteryCharging className="w-12 h-12 text-emerald-500" />;
      case 'minerals':
        return <Mountain className="w-12 h-12 text-purple-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="py-12 max-w-2xl mx-auto text-center space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-center">{getSectorIcon()}</div>

      <div className="space-y-2">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 px-3 py-1 rounded-md bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/40">
          Sovereign Roadmap Pipeline
        </span>
        <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          {sector.name}
        </h2>
        <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {sector.tagline}. Full 4-stage supply chain mapping, PLI subsidy calculations, and venture playbooks are currently in research compilation.
        </p>
      </div>

      <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-left space-y-3">
        <h3 className="text-sm font-bold uppercase font-mono tracking-wider text-zinc-900 dark:text-zinc-100">
          Scheduled Diligence Deliverables
        </h3>
        <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{sector.stageCount}-Stage sovereign manufacturing continuum</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{sector.nodeCount} Zero-to-one industrial venture playbooks</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>National PLI (Production Linked Incentive) co-funding calculators</span>
          </div>
        </div>
      </div>

      <div>
        <Button variant="primary" size="md" onClick={onBackToSemiconductors}>
          Return to Semiconductors & Microchips
        </Button>
      </div>
    </div>
  );
};
