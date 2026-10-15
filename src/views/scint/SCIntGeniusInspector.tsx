import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Coins,
  Factory,
  Briefcase,
  CheckCircle2,
  ExternalLink,
  MapPin,
  TrendingUp,
} from 'lucide-react';
import { SCIntNodeBlueprint } from '@/types';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';

interface SCIntGeniusInspectorProps {
  blueprint: SCIntNodeBlueprint | null;
  onClose: () => void;
  stateTopUpPercent: number;
}

type InspectorTab = 'moat' | 'financials' | 'factory' | 'offtake';

export const SCIntGeniusInspector: React.FC<SCIntGeniusInspectorProps> = ({
  blueprint,
  onClose,
  stateTopUpPercent,
}) => {
  const [activeTab, setActiveTab] = useState<InspectorTab>('moat');
  const [scale, setScale] = useState<'modular' | 'benchmark'>('modular');

  if (!blueprint) return null;

  const rawCapex = scale === 'modular' ? blueprint.capexModularINR : blueprint.capexBenchmarkINR;
  const centralSubsidyRate = blueprint.subsidyPercentageISM;
  const centralSubsidyAmount = (rawCapex * centralSubsidyRate) / 100;
  const stateSubsidyAmount = (rawCapex * stateTopUpPercent) / 100;
  const totalSubsidies = centralSubsidyAmount + stateSubsidyAmount;
  const netPromoterEquity = Math.max(0, rawCapex - totalSubsidies);

  const tabs: { id: InspectorTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'moat', label: 'Overview & Moat', icon: ShieldCheck },
    { id: 'financials', label: 'Financial Stack', icon: Coins },
    { id: 'factory', label: 'Factory & Machinery', icon: Factory },
    { id: 'offtake', label: 'Offtake & Clearances', icon: Briefcase },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-sm flex justify-end transition-opacity">
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col h-full overflow-hidden animate-in slide-in-from-right duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="inspector-title"
      >
        {/* Top Header Bar */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 space-y-4 flex-shrink-0 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase text-sky-600 dark:text-sky-400 font-bold">
                  Node #{blueprint.nodeNumber}
                </span>
                <span className="text-zinc-300 dark:text-zinc-700">•</span>
                <span className="text-xs text-zinc-500 font-mono">
                  {blueprint.tierName.split(':')[0]}
                </span>
                <Badge variant="outline">{blueprint.category}</Badge>
              </div>

              <h2 id="inspector-title" className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
                {blueprint.name}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Close Inspector"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Segmented Inspector Navigation Tabs */}
          <div className="flex items-center p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 gap-1 overflow-x-auto">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-500' : 'text-zinc-400'}`} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-zinc-700 dark:text-zinc-300">
          {/* TAB 1: OVERVIEW & MOAT */}
          {activeTab === 'moat' && (
            <div className="space-y-6">
              {/* Strategic Purpose */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 font-mono">
                  Sovereign Venture Objective
                </h4>
                <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                  {blueprint.description}
                </p>
              </div>

              {/* Strategic Moat & Market Demand */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 space-y-1">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase font-semibold">
                    Global / National Market Size
                  </span>
                  <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {blueprint.marketSize || 'High Strategic Priority'}
                  </div>
                  <p className="text-[11px] text-zinc-500">Rapidly expanding domestic requirement under India Semicon Mission.</p>
                </div>

                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 space-y-1">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase font-semibold">
                    Target Operating Margin
                  </span>
                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {blueprint.ebitdaMarginExpected}
                  </div>
                  <p className="text-[11px] text-zinc-500">Gross Margin: {blueprint.grossMargin || '35% - 48%'}</p>
                </div>
              </div>

              {/* Target Clusters */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 font-mono flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sky-500" />
                  <span>Target Domestic Manufacturing Clusters</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {blueprint.targetClusters.map((cluster) => (
                    <span
                      key={cluster}
                      className="px-2.5 py-1 rounded-md text-xs font-medium border border-sky-200 dark:border-sky-900 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300"
                    >
                      {cluster}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FINANCIAL STACK & SUBSIDIES */}
          {activeTab === 'financials' && (
            <div className="space-y-6">
              {/* Scale Switcher */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40">
                <div>
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Capacity Scaling Option
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    {scale === 'modular' ? blueprint.modularCapacityLabel : blueprint.commercialCapacityLabel}
                  </div>
                </div>

                <div className="flex items-center p-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
                  <button
                    type="button"
                    onClick={() => setScale('modular')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded ${
                      scale === 'modular'
                        ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                        : 'text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    Modular
                  </button>
                  <button
                    type="button"
                    onClick={() => setScale('benchmark')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded ${
                      scale === 'benchmark'
                        ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                        : 'text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    Benchmark
                  </button>
                </div>
              </div>

              {/* Waterfall Breakdown */}
              <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 font-mono">
                  CapEx & Subsidy Waterfall (Co-Funding)
                </h4>

                <div className="space-y-2.5 font-mono text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-zinc-200 dark:border-zinc-700">
                    <span className="text-zinc-500">Gross Factory CapEx:</span>
                    <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      ₹{rawCapex} Crores
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sky-600 dark:text-sky-400">
                    <span>Central India Semicon Mission Grant ({centralSubsidyRate}%):</span>
                    <span className="font-semibold">-₹{centralSubsidyAmount.toFixed(1)} Cr</span>
                  </div>

                  <div className="flex justify-between items-center text-sky-600 dark:text-sky-400">
                    <span>State Industrial Top-Up Grant ({stateTopUpPercent}%):</span>
                    <span className="font-semibold">-₹{stateSubsidyAmount.toFixed(1)} Cr</span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t-2 border-zinc-300 dark:border-zinc-600 text-emerald-600 dark:text-emerald-400">
                    <span className="font-bold text-sm">Net Promoter Capital Outlay:</span>
                    <span className="font-bold text-base">₹{netPromoterEquity.toFixed(1)} Crores</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] font-mono text-zinc-500 border-t border-zinc-200 dark:border-zinc-700">
                  <div>Estimated Payback: <strong className="text-zinc-800 dark:text-zinc-200">{blueprint.paybackPeriodYears} Years</strong></div>
                  <div>TRL Level: <strong className="text-zinc-800 dark:text-zinc-200">{blueprint.techReadinessLevel}/9</strong></div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FACTORY FLOOR & MACHINERY */}
          {activeTab === 'factory' && (
            <div className="space-y-6">
              {/* Precision Machinery */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 font-mono">
                  High-Precision Capital Machinery
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {blueprint.keyMachinery.map((mach) => (
                    <div
                      key={mach}
                      className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Factory className="w-4 h-4 text-sky-500 flex-shrink-0" />
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs">{mach}</span>
                      </div>
                      <Badge variant="outline">Capital Tool</Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feedstocks & Raw Materials */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 font-mono">
                  Critical Feedstocks & Raw Materials
                </h4>
                <div className="flex flex-wrap gap-2">
                  {blueprint.primaryRawMaterials.map((mat) => (
                    <span
                      key={mat}
                      className="px-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium"
                    >
                      {mat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: OFFTAKE & CLEARANCES */}
          {activeTab === 'offtake' && (
            <div className="space-y-6">
              {/* Indian Anchor Buyers */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 font-mono">
                  Confirmed Indian Anchor Offtake Customers
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {blueprint.offtakeBuyers.map((buyer) => (
                    <div
                      key={buyer}
                      className="p-3 rounded-lg border border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs">{buyer}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Regulatory Clearances Checklist */}
              {blueprint.clearances && blueprint.clearances.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 font-mono">
                    Statutory Diligence & Regulatory Clearances
                  </h4>
                  <div className="space-y-1.5">
                    {blueprint.clearances.map((c) => (
                      <div
                        key={c}
                        className="p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-2 text-xs"
                      >
                        <ShieldCheck className="w-4 h-4 text-sky-500 flex-shrink-0" />
                        <span className="text-zinc-700 dark:text-zinc-300">{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Actions Bar */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/80 flex-shrink-0">
          <div className="text-xs text-zinc-500 font-mono">
            Node #{blueprint.nodeNumber} • TRL {blueprint.techReadinessLevel}/9
          </div>
          <Button variant="primary" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};
