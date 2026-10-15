import React, { useState, useMemo } from 'react';
import { ArrowRight, Filter, SlidersHorizontal, CheckCircle2 } from 'lucide-react';
import { SCIntNodeBlueprint, SCIntTier } from '@/types';
import { SCINT_TIERS } from '@/data/scintData';
import { Badge } from '@/components/common/Badge';

interface SCIntBlueprintStudioProps {
  blueprints: SCIntNodeBlueprint[];
  onSelectBlueprint: (bp: SCIntNodeBlueprint) => void;
  capexScale: 'modular' | 'benchmark';
  stateTopUpPercent: number;
  searchQuery: string;
}

export const SCIntBlueprintStudio: React.FC<SCIntBlueprintStudioProps> = ({
  blueprints,
  onSelectBlueprint,
  capexScale,
  stateTopUpPercent,
  searchQuery,
}) => {
  const [selectedTier, setSelectedTier] = useState<SCIntTier | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = useMemo(() => {
    const set = new Set<string>();
    blueprints.forEach((b) => set.add(b.category));
    return ['all', ...Array.from(set)];
  }, [blueprints]);

  const filteredBlueprints = useMemo(() => {
    return blueprints.filter((b) => {
      if (selectedTier !== 'all' && b.tier !== selectedTier) return false;
      if (selectedCategory !== 'all' && b.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          b.name.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q) ||
          b.targetClusters.some((c) => c.toLowerCase().includes(q)) ||
          b.keyMachinery.some((m) => m.toLowerCase().includes(q)) ||
          b.offtakeBuyers.some((buyer) => buyer.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [blueprints, selectedTier, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Filters Strip */}
      <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Tier Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setSelectedTier('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              selectedTier === 'all'
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            All 34 Blueprints
          </button>
          {SCINT_TIERS.map((tier) => (
            <button
              key={tier.tier}
              type="button"
              onClick={() => setSelectedTier(tier.tier)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                selectedTier === tier.tier
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              Tier {tier.tier}
            </button>
          ))}
        </div>

        {/* Category Dropdown & Results Count */}
        <div className="flex items-center gap-3 justify-between md:justify-end flex-shrink-0">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-400 font-mono hidden sm:inline">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-8 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-sky-500 max-w-[180px] truncate"
            >
              <option value="all">All Domains ({categories.length - 1})</option>
              {categories
                .filter((c) => c !== 'all')
                .map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
            </select>
          </div>

          <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800">
            {filteredBlueprints.length} Playbooks
          </span>
        </div>
      </div>

      {/* Blueprints Grid */}
      {filteredBlueprints.length === 0 ? (
        <div className="py-16 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
          No venture playbooks match your current filters or search term.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBlueprints.map((bp) => {
            const rawCapex = capexScale === 'modular' ? bp.capexModularINR : bp.capexBenchmarkINR;
            const totalSubsidyRate = bp.subsidyPercentageISM + stateTopUpPercent;
            const subsidyAmount = (rawCapex * totalSubsidyRate) / 100;
            const netEquity = Math.max(0, rawCapex - subsidyAmount);

            return (
              <div
                key={bp.id}
                onClick={() => onSelectBlueprint(bp)}
                className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all cursor-pointer flex flex-col justify-between space-y-4 group shadow-sm hover:shadow"
              >
                {/* Header Information */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider">
                      Node #{bp.nodeNumber} • Tier {bp.tier}
                    </span>
                    <Badge variant="outline">{bp.category}</Badge>
                  </div>

                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors leading-snug">
                    {bp.name}
                  </h3>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {bp.description}
                  </p>
                </div>

                {/* Offtake Preview */}
                {bp.offtakeBuyers.length > 0 && (
                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                    <span className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
                      Indian Anchor Buyers:
                    </span>
                    <div className="text-xs text-zinc-700 dark:text-zinc-300 font-medium truncate">
                      {bp.offtakeBuyers.slice(0, 3).join(', ')}
                    </div>
                  </div>
                )}

                {/* 3 Essential Financial Numbers */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2">
                  <div className="flex justify-between items-baseline text-xs font-mono">
                    <span className="text-zinc-400">Total CapEx:</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      ₹{rawCapex} Cr
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline text-xs font-mono text-emerald-600 dark:text-emerald-400">
                    <span>Net Promoter Equity ({totalSubsidyRate}% grant):</span>
                    <span className="font-bold text-sm">
                      ₹{netEquity.toFixed(1)} Cr
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 font-mono">
                    <span>Payback: <strong className="text-zinc-700 dark:text-zinc-300">{bp.paybackPeriodYears} yrs</strong></span>
                    <span>EBITDA: <strong className="text-zinc-700 dark:text-zinc-300">{bp.ebitdaMarginExpected}</strong></span>
                    <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400 font-sans font-medium text-xs">
                      Inspect <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
