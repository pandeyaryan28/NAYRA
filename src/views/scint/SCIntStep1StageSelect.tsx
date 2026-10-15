import React from 'react';
import { ArrowRight } from 'lucide-react';
import { SCIntTier } from '@/types';
import { SCINT_TIERS } from '@/data/scintData';

interface SCIntStep1StageSelectProps {
  onSelectStage: (tier: SCIntTier) => void;
}

export const SCIntStep1StageSelect: React.FC<SCIntStep1StageSelectProps> = ({ onSelectStage }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Narrative Header */}
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Where in India's microchip journey do you want to build?
        </h2>
        <p className="text-base text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
          Every microchip goes through 6 sequential steps—from digging raw rocks out of the ground to soldering finished chips onto electronics boards. Click a stage below to explore practical business opportunities.
        </p>
      </div>

      {/* Spacious 6-Stage Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {SCINT_TIERS.map((tier) => {
          return (
            <button
              type="button"
              key={tier.tier}
              onClick={() => onSelectStage(tier.tier)}
              className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-5 group text-left w-full focus:outline-none focus:ring-2 focus:ring-sky-500/50"
            >
              {/* Header: Stage Number & Count */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 px-2.5 py-1 rounded-md bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/40">
                    Stage 0{tier.tier}
                  </span>
                  <span className="text-xs font-mono font-semibold text-zinc-500 dark:text-zinc-400">
                    {tier.count} Business Opportunities
                  </span>
                </div>

                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                  {tier.title.split(':')[1]?.trim() || tier.title}
                </h3>

                <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {tier.strategicRole}
                </p>
              </div>

              {/* Feedstocks Preview & Action */}
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  <strong className="text-zinc-700 dark:text-zinc-300 font-medium">What is used here:</strong>{' '}
                  {tier.tagline}
                </div>

                <div className="flex items-center gap-1.5 text-sm font-bold text-sky-600 dark:text-sky-400 group-hover:translate-x-1 transition-transform flex-shrink-0">
                  <span>Explore Opportunities</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
