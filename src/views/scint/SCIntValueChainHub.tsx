import React, { useState } from 'react';
import { ArrowRight, Layers, Factory, Compass, CheckCircle2 } from 'lucide-react';
import { SCIntNodeBlueprint, SCIntTier } from '@/types';
import { SCINT_TIERS } from '@/data/scintData';
import { Badge } from '@/components/common/Badge';

interface SCIntValueChainHubProps {
  blueprints: SCIntNodeBlueprint[];
  onSelectBlueprint: (bp: SCIntNodeBlueprint) => void;
  capexScale: 'modular' | 'benchmark';
  stateTopUpPercent: number;
  searchQuery: string;
}

export const SCIntValueChainHub: React.FC<SCIntValueChainHubProps> = ({
  blueprints,
  onSelectBlueprint,
  capexScale,
  stateTopUpPercent,
  searchQuery,
}) => {
  const [activeTier, setActiveTier] = useState<SCIntTier>(0);

  const currentTierMeta = SCINT_TIERS.find((t) => t.tier === activeTier) || SCINT_TIERS[0];

  const tierBlueprints = blueprints.filter((b) => {
    if (b.tier !== activeTier) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        b.name.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        b.targetClusters.some((c) => c.toLowerCase().includes(q)) ||
        b.keyMachinery.some((m) => m.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Visual Continuum Timeline / Ribbon (6 Stages of Semiconductor Sovereignty) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold">
            Stage Continuum: Sand to Silicon Odyssey
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
            Tier {activeTier} of 5 Active
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {SCINT_TIERS.map((tier) => {
            const isSelected = activeTier === tier.tier;
            return (
              <button
                key={tier.tier}
                type="button"
                onClick={() => setActiveTier(tier.tier)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-sky-50/80 dark:bg-sky-950/30 border-sky-400/80 dark:border-sky-500/50 shadow-sm'
                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-mono uppercase font-bold ${
                      isSelected
                        ? 'text-sky-600 dark:text-sky-400'
                        : 'text-zinc-400 dark:text-zinc-500'
                    }`}
                  >
                    Stage 0{tier.tier}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    {tier.count} Nodes
                  </span>
                </div>
                <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate mt-1">
                  {tier.title.split(':')[1]?.trim() || tier.title}
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                  {tier.tagline.split(',')[0]}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stage Executive Briefing Banner */}
      <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Tier {currentTierMeta.tier} Deep Dive</Badge>
              <span className="text-xs text-zinc-400 font-mono">
                {tierBlueprints.length} Strategic Venture Blueprints
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {currentTierMeta.title}
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 max-w-3xl leading-relaxed">
              {currentTierMeta.strategicRole}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 self-start p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-xs font-mono">
            <Layers className="w-4 h-4 text-sky-500" />
            <span>National Bottleneck Severity:</span>
            <span className="font-bold text-amber-600 dark:text-amber-400">Critical (90%+ Import)</span>
          </div>
        </div>

        {/* 3-Step Input-to-Output Continuum Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-xs">
          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-700/50 space-y-1">
            <span className="text-[10px] font-mono text-zinc-400 uppercase font-semibold">1. Critical Inflow</span>
            <div className="font-semibold text-zinc-900 dark:text-zinc-100">Feedstocks & Precursors</div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2">
              {currentTierMeta.tagline}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-700/50 space-y-1">
            <span className="text-[10px] font-mono text-zinc-400 uppercase font-semibold">2. Cleanroom Transformation</span>
            <div className="font-semibold text-zinc-900 dark:text-zinc-100">Core Industrial Process</div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Beneficiation, multi-stage distillation, chemical vapor synthesis & precision inspection.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-700/50 space-y-1">
            <span className="text-[10px] font-mono text-zinc-400 uppercase font-semibold">3. Sovereign Outflow</span>
            <div className="font-semibold text-zinc-900 dark:text-zinc-100">Domestic Silicon Supply</div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Feeds downstream Tier {activeTier < 5 ? activeTier + 1 : 5} manufacturing anchor fabs in India.
            </p>
          </div>
        </div>
      </div>

      {/* Nodes in this Tier */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Venture Opportunities in Tier {activeTier}
          </h3>
          <span className="text-xs text-zinc-400 font-mono">
            Tap any card to inspect full diligence
          </span>
        </div>

        {tierBlueprints.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
            No venture blueprints found matching your filter in this tier.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tierBlueprints.map((bp) => {
              const rawCapex = capexScale === 'modular' ? bp.capexModularINR : bp.capexBenchmarkINR;
              const totalSubsidyRate = bp.subsidyPercentageISM + stateTopUpPercent;
              const subsidyAmount = (rawCapex * totalSubsidyRate) / 100;
              const netEquity = Math.max(0, rawCapex - subsidyAmount);

              return (
                <div
                  key={bp.id}
                  onClick={() => onSelectBlueprint(bp)}
                  className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-zinc-400">Node #{bp.nodeNumber}</span>
                      <Badge variant="outline">{bp.category}</Badge>
                    </div>

                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-1">
                      {bp.name}
                    </h4>

                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {bp.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 space-y-1.5 font-mono text-xs">
                    <div className="flex justify-between items-baseline">
                      <span className="text-zinc-400">Gross CapEx:</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        ₹{rawCapex} Cr
                      </span>
                    </div>

                    <div className="flex justify-between items-baseline text-emerald-600 dark:text-emerald-400">
                      <span>Net Promoter Equity:</span>
                      <span className="font-bold">
                        ₹{netEquity.toFixed(1)} Cr
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-800/60">
                      <span>Payback: {bp.paybackPeriodYears}y</span>
                      <span>EBITDA: {bp.ebitdaMarginExpected}</span>
                      <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400 font-sans font-medium">
                        Diligence <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
