import React, { useState, useMemo } from 'react';
import {
  Cpu,
  Search,
  Sliders,
  ExternalLink,
  MapPin,
  TrendingUp,
  Factory,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { SCINT_TIERS, SCINT_VENTURE_BLUEPRINTS } from '@/data/scintData';
import { SCIntNodeBlueprint, SCIntTier } from '@/types';

export const SCIntView: React.FC = () => {
  const [selectedTier, setSelectedTier] = useState<SCIntTier | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBlueprint, setSelectedBlueprint] = useState<SCIntNodeBlueprint | null>(null);

  // CapEx Scale Toggle: 'modular' | 'benchmark'
  const [capexScale, setCapexScale] = useState<'modular' | 'benchmark'>('modular');

  // Subsidy parameters
  const [stateTopUpPercent, setStateTopUpPercent] = useState<number>(20); // 20% Gujarat / UP state incentive

  const filteredBlueprints = useMemo(() => {
    return SCINT_VENTURE_BLUEPRINTS.filter((node) => {
      if (selectedTier !== 'all' && node.tier !== selectedTier) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          node.name.toLowerCase().includes(q) ||
          node.category.toLowerCase().includes(q) ||
          node.targetClusters.some((c) => c.toLowerCase().includes(q)) ||
          node.keyMachinery.some((m) => m.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [selectedTier, searchQuery]);

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-8 select-none view-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Cpu className="h-5 w-5 text-sky-500" />
            <span>SCInt: Semiconductor Full Supply Chain & Diligence Engine</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            6-tier supply chain matrix, 34 venture blueprints, dual-scale CapEx engine & ISM 2.0 / SPECS subsidy calculator.
          </p>
        </div>

        {/* CapEx Scale Switcher */}
        <div className="flex items-center rounded-md border border-zinc-200 dark:border-zinc-800 p-0.5 bg-zinc-50 dark:bg-zinc-900">
          <button
            onClick={() => setCapexScale('modular')}
            className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${
              capexScale === 'modular'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            Modular Scale
          </button>
          <button
            onClick={() => setCapexScale('benchmark')}
            className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${
              capexScale === 'benchmark'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            Benchmark Scale
          </button>
        </div>
      </div>

      {/* 6-Tier Horizontal Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <button
          onClick={() => setSelectedTier('all')}
          className={`p-2.5 rounded-lg border text-left transition-colors ${
            selectedTier === 'all'
              ? 'border-zinc-900 dark:border-zinc-100 bg-white dark:bg-zinc-900 shadow-xs'
              : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 hover:border-zinc-300'
          }`}
        >
          <span className="text-[10px] font-mono text-zinc-400 uppercase block">Complete Matrix</span>
          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">All 34 Nodes</span>
        </button>

        {SCINT_TIERS.map((tier) => {
          const isSelected = selectedTier === tier.tier;
          return (
            <button
              key={tier.tier}
              onClick={() => setSelectedTier(tier.tier)}
              className={`p-2.5 rounded-lg border text-left transition-colors ${
                isSelected
                  ? 'border-zinc-900 dark:border-zinc-100 bg-white dark:bg-zinc-900 shadow-xs'
                  : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 hover:border-zinc-300'
              }`}
            >
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">
                Tier {tier.tier}
              </span>
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate block">
                {tier.title.split(':')[1]?.trim() || tier.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
        <input
          type="text"
          placeholder="Search node, machinery, material or cluster..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-9 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-9 pr-3 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
        />
      </div>

      {/* Blueprints Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBlueprints.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-zinc-400 border border-dashed rounded-lg">
            No venture blueprints match your query.
          </div>
        ) : (
          filteredBlueprints.map((node) => {
            const rawCapex = capexScale === 'modular' ? node.capexModularINR : node.capexBenchmarkINR;
            const centralSubsidyAmount = (rawCapex * node.subsidyPercentageISM) / 100;
            const stateSubsidyAmount = (rawCapex * stateTopUpPercent) / 100;
            const netPromoterCapex = Math.max(0, rawCapex - centralSubsidyAmount - stateSubsidyAmount);

            return (
              <div
                key={node.id}
                onClick={() => setSelectedBlueprint(node)}
                className="p-5 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-600 card-enter interactive-card cursor-pointer flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase">
                      Node #{node.nodeNumber} • {node.tierName.split(':')[0]}
                    </span>
                    <Badge variant="outline">{node.category}</Badge>
                  </div>

                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                    {node.name}
                  </h3>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                    {node.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2">
                  <div className="flex items-baseline justify-between text-xs font-mono">
                    <span className="text-zinc-400">Gross CapEx:</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      ₹{rawCapex} Cr
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between text-xs font-mono">
                    <span className="text-emerald-600 dark:text-emerald-400">
                      Net Equity (After {node.subsidyPercentageISM + stateTopUpPercent}% Subsidies):
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{netPromoterCapex.toFixed(1)} Cr
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                    <span>Payback: {node.paybackPeriodYears}y</span>
                    <span>TRL: {node.techReadinessLevel}/9</span>
                    <span>EBITDA: {node.ebitdaMarginExpected}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Blueprint Detail & 11-Pillar Diligence Modal */}
      <Modal
        isOpen={Boolean(selectedBlueprint)}
        onClose={() => setSelectedBlueprint(null)}
        title={selectedBlueprint ? `Node #${selectedBlueprint.nodeNumber}: ${selectedBlueprint.name}` : ''}
        description={selectedBlueprint?.tierName}
        maxWidth="2xl"
      >
        {selectedBlueprint && (
          <div className="space-y-6 text-xs">
            {/* Overview */}
            <div className="space-y-1">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-[11px]">
                Process Blueprint Overview
              </span>
              <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {selectedBlueprint.description}
              </p>
            </div>

            {/* CapEx & Policy Incentive Analysis */}
            <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-2 font-mono">
              <div className="flex justify-between">
                <span>Modular Pioneer CapEx:</span>
                <span className="font-bold">₹{selectedBlueprint.capexModularINR} Crores</span>
              </div>
              <div className="flex justify-between">
                <span>Commercial Benchmark CapEx:</span>
                <span className="font-bold">₹{selectedBlueprint.capexBenchmarkINR} Crores</span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>India Semiconductor Mission (ISM) 2.0 Co-funding:</span>
                <span>{selectedBlueprint.subsidyPercentageISM}%</span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>State Industrial Top-Up Subsidy (Gujarat / UP):</span>
                <span>{stateTopUpPercent}%</span>
              </div>
            </div>

            {/* Key Precision Machinery */}
            <div className="space-y-1.5">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-[11px]">
                Precision Machinery & Capital Equipment
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedBlueprint.keyMachinery.map((m) => (
                  <Badge key={m} variant="default">{m}</Badge>
                ))}
              </div>
            </div>

            {/* Primary Raw Materials */}
            <div className="space-y-1.5">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-[11px]">
                Critical Feedstocks & Raw Materials
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedBlueprint.primaryRawMaterials.map((r) => (
                  <Badge key={r} variant="outline">{r}</Badge>
                ))}
              </div>
            </div>

            {/* Target Indian Industrial Clusters */}
            <div className="space-y-1.5">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-[11px]">
                Target Domestic Industrial Clusters
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedBlueprint.targetClusters.map((c) => (
                  <Badge key={c} variant="info">{c}</Badge>
                ))}
              </div>
            </div>

            {/* Offtake Buyers */}
            <div className="space-y-1.5">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-[11px]">
                Commercial Offtake Buyers & Customers
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedBlueprint.offtakeBuyers.map((b) => (
                  <Badge key={b} variant="success">{b}</Badge>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setSelectedBlueprint(null)}
              >
                Close Blueprint
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
