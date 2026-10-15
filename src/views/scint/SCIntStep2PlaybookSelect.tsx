import React from 'react';
import { ArrowLeft, ArrowRight, Building, CheckCircle2 } from 'lucide-react';
import { SCIntNodeBlueprint, SCIntTier } from '@/types';
import { SCINT_TIERS } from '@/data/scintData';
import { Badge } from '@/components/common/Badge';

interface SCIntStep2PlaybookSelectProps {
  selectedTier: SCIntTier;
  blueprints: SCIntNodeBlueprint[];
  onSelectPlaybook: (playbook: SCIntNodeBlueprint) => void;
  onBackToStages: () => void;
  searchQuery: string;
}

export const SCIntStep2PlaybookSelect: React.FC<SCIntStep2PlaybookSelectProps> = ({
  selectedTier,
  blueprints,
  onSelectPlaybook,
  onBackToStages,
  searchQuery,
}) => {
  const currentTierMeta = SCINT_TIERS.find((t) => t.tier === selectedTier) || SCINT_TIERS[0];

  const stageBlueprints = blueprints.filter((b) => {
    if (b.tier !== selectedTier) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        b.name.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        b.targetClusters.some((c) => c.toLowerCase().includes(q)) ||
        b.offtakeBuyers.some((buyer) => buyer.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Back Button & Stage Header */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={onBackToStages}
          className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to All 6 Stages</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                Stage 0{currentTierMeta.tier}
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span className="text-xs text-zinc-500 font-mono">
                {stageBlueprints.length} Strategic Playbooks
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 mt-1">
              {currentTierMeta.title.split(':')[1]?.trim() || currentTierMeta.title}
            </h2>
            <p className="text-base text-zinc-600 dark:text-zinc-400 max-w-3xl mt-1 leading-relaxed">
              {currentTierMeta.strategicRole}
            </p>
          </div>
        </div>
      </div>

      {/* Playbooks Grid (Spacious 2-column layout) */}
      {stageBlueprints.length === 0 ? (
        <div className="py-16 text-center text-sm text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
          No venture playbooks match your search query in this stage.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {stageBlueprints.map((bp) => {
            const rawCapex = bp.capexBenchmarkINR;
            const subsidyRate = bp.subsidyPercentageISM + 20; // 50% central + 20% state baseline
            const subsidyAmount = (rawCapex * subsidyRate) / 100;
            const netOutlay = Math.max(0, rawCapex - subsidyAmount);

            return (
              <button
                type="button"
                key={bp.id}
                onClick={() => onSelectPlaybook(bp)}
                className="p-7 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between space-y-6 group text-left w-full focus:outline-none focus:ring-2 focus:ring-sky-500/50"
              >
                {/* Header: Node Title & Category */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase text-zinc-400 tracking-wider">
                      Node #{bp.nodeNumber}
                    </span>
                    <Badge variant="outline">{bp.category}</Badge>
                  </div>

                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors leading-snug">
                    {bp.name}
                  </h3>

                  <p className="text-sm text-zinc-600 dark:text-zinc-300 line-clamp-3 leading-relaxed">
                    {bp.description}
                  </p>
                </div>

                {/* Confirmed Offtake Customers Preview */}
                {bp.offtakeBuyers.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
                    <span className="text-xs font-mono font-semibold uppercase text-zinc-400 block mb-1">
                      Confirmed Domestic Offtake Buyers:
                    </span>
                    <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                      {bp.offtakeBuyers.slice(0, 3).join(' • ')}
                    </div>
                  </div>
                )}

                {/* High-Contrast Financial Strip (Legible & Human) */}
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-mono text-zinc-400 block">Total Factory CapEx</span>
                      <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                        ₹{rawCapex} Cr
                      </span>
                    </div>

                    <div>
                      <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 block">
                        Net Capital Outlay ({subsidyRate}% Govt Grant)
                      </span>
                      <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        ₹{netOutlay.toFixed(0)} Cr
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 text-xs text-zinc-500 font-medium">
                    <span>Payback: <strong className="text-zinc-800 dark:text-zinc-200">{bp.paybackPeriodYears} yrs</strong></span>
                    <span>Target Margin: <strong className="text-zinc-800 dark:text-zinc-200">{bp.ebitdaMarginExpected}</strong></span>
                    <span className="flex items-center gap-1.5 text-sm font-bold text-sky-600 dark:text-sky-400 group-hover:translate-x-1 transition-transform">
                      Open Dossier <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
