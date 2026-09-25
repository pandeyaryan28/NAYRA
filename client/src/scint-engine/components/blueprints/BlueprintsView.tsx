import React, { useState } from 'react';
import { useScintData } from '../../context/ScintDataContext';
import { VENTURE_BLUEPRINTS } from '../../data/venture_blueprints';
import { SEMICON_SUPPLY_CHAIN_DATA } from '../../data/supply_chain_data';
import { ProcessFlowchartSvg } from '../common/ProcessFlowchartSvg';
import { SourcingMapSvg } from '../common/SourcingMapSvg';
import type { DiligencePillarTab } from '../../types/index';
import { 
  FileText, 
  Milestone, 
  Coins, 
  Cpu, 
  Workflow, 
  FlaskConical, 
  Users, 
  ShieldCheck, 
  TrendingUp, 
  AlertTriangle,
  ChevronDown,
  Search,
  Check,
  Building,
  MapPin,
  Clock,
  Layers
} from 'lucide-react';

const PILLAR_TABS: { id: DiligencePillarTab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'overview', label: '1. Executive Summary', icon: FileText },
  { id: 'roadmap', label: '2. 36-Mo Roadmap', icon: Milestone },
  { id: 'capex', label: '3. CapEx & Financials', icon: Coins },
  { id: 'machinery', label: '4. Machinery & Logistics', icon: Cpu },
  { id: 'process', label: '5. Process Flowchart', icon: Workflow },
  { id: 'materials', label: '6. Raw Feedstocks', icon: FlaskConical },
  { id: 'buyers', label: '7. Offtake Buyers', icon: Users },
  { id: 'clearances', label: '8. Clearances & Due Diligence', icon: ShieldCheck },
  { id: 'future', label: '9. Strategic Scope', icon: TrendingUp },
  { id: 'threats', label: '10. Threats & Mitigations', icon: AlertTriangle },
];

export const BlueprintsView: React.FC = () => {
  const { 
    activeBlueprintId, 
    selectBlueprint, 
    activeScale, 
    setActiveScale, 
    activePillarTab, 
    setActivePillarTab, 
    currentBlueprint 
  } = useScintData();

  const [isNodePickerOpen, setIsNodePickerOpen] = useState(false);
  const [nodeSearchQuery, setNodeSearchQuery] = useState('');

  if (!currentBlueprint) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-zinc-400">
        Loading Venture Blueprint...
      </div>
    );
  }

  const { metadata, executiveSummary, roadmapPhases, capexBreakdown, machineryBreakdown, manufacturingProcess, rawMaterialsAndReagents, buyersAndMarketDemand, dueDiligenceAndClearances, futureScopeAndExpansion, threatsAndMitigations } = currentBlueprint;

  // Active scale data
  const capexData = activeScale === '20k' 
    ? capexBreakdown?.modular20k || (capexBreakdown as any)?.modularPioneerScale
    : capexBreakdown?.commercial50k || (capexBreakdown as any)?.commercialBenchmarkScale;

  const totalCapex = capexData?.totalCapexCr || (capexData?.totalProjectCapexINR ? capexData.totalProjectCapexINR / 10000000 : 150);
  const netOutlay = capexData?.netInvestorOutlayCr || (capexData?.netInvestorOutlayINR ? capexData.netInvestorOutlayINR / 10000000 : 75);
  const annualRev = capexData?.annualRevenueCr || (capexData?.annualRevenueINR ? capexData.annualRevenueINR / 10000000 : 200);
  const ebitdaMargin = capexData?.ebitdaMarginPct || capexData?.ebitdaMarginPercentage || 42;
  const payback = capexData?.paybackYears ? `${capexData.paybackYears} Yrs` : (capexData?.simplePaybackYears ? `${capexData.simplePaybackYears} Yrs` : '3.0 Yrs');

  // Filtered components for picker
  const filteredComponents = SEMICON_SUPPLY_CHAIN_DATA.components.filter(c => 
    c.name.toLowerCase().includes(nodeSearchQuery.toLowerCase()) || 
    c.id.toLowerCase().includes(nodeSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Node Selector & Top Header Controls */}
      <div className="p-4 sm:p-5 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Node Switcher Dropdown */}
          <div className="relative flex-1">
            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-1 font-semibold">
              Active Venture Blueprint (34 Critical Sovereign Nodes)
            </label>
            <button
              onClick={() => setIsNodePickerOpen(!isNodePickerOpen)}
              className="w-full sm:max-w-xl flex items-center justify-between px-3.5 py-2.5 rounded-md bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 text-left hover:border-sky-500 dark:hover:border-sky-500 transition-colors"
            >
              <div className="flex items-center gap-2.5 truncate">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 font-semibold shrink-0">
                  Tier {metadata.tier}
                </span>
                <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                  {metadata.title}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 dark:text-zinc-500 shrink-0 ml-2" />
            </button>

            {/* Dropdown Menu */}
            {isNodePickerOpen && (
              <div className="absolute top-full left-0 mt-1 w-full sm:max-w-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-md shadow-xl z-30 overflow-hidden">
                <div className="p-2 border-b border-slate-100 dark:border-zinc-800">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400 dark:text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Search across all 34 nodes..."
                      value={nodeSearchQuery}
                      onChange={(e) => setNodeSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800/60">
                  {filteredComponents.map((c) => {
                    const isSelected = c.id === activeBlueprintId;
                    return (
                      <button
                        key={c.id}
                        onClick={() => {
                          selectBlueprint(c.id);
                          setIsNodePickerOpen(false);
                          setNodeSearchQuery('');
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors ${
                          isSelected
                            ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200 font-bold'
                            : 'hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="font-mono text-[10px] text-slate-400 dark:text-zinc-500 shrink-0">
                            T{c.tier}
                          </span>
                          <span className="truncate">{c.name}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Scale Switcher Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-semibold">
              Scale Model:
            </div>
            <div className="flex items-center p-1 rounded-md bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs font-semibold">
              <button
                onClick={() => setActiveScale('20k')}
                className={`px-3 py-1.5 rounded transition-all cursor-pointer ${
                  activeScale === '20k'
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-2xs font-bold'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Modular Pioneer Scale
              </button>
              <button
                onClick={() => setActiveScale('50k')}
                className={`px-3 py-1.5 rounded transition-all cursor-pointer ${
                  activeScale === '50k'
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-2xs font-bold'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Commercial Benchmark
              </button>
            </div>
          </div>
        </div>

        {/* Quick Headline Stat Strip */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-2 rounded bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800">
            <span className="text-slate-400 dark:text-zinc-500 block text-[10px] uppercase font-bold">Total CapEx</span>
            <span className="font-bold text-slate-900 dark:text-zinc-100 text-sm">₹{totalCapex} Cr</span>
          </div>
          <div className="p-2 rounded bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800">
            <span className="text-slate-400 dark:text-zinc-500 block text-[10px] uppercase font-bold">Net Investor Outlay</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">₹{netOutlay} Cr</span>
          </div>
          <div className="p-2 rounded bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800">
            <span className="text-slate-400 dark:text-zinc-500 block text-[10px] uppercase font-bold">Annual Revenue</span>
            <span className="font-bold text-sky-600 dark:text-sky-400 text-sm">₹{annualRev} Cr</span>
          </div>
          <div className="p-2 rounded bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800">
            <span className="text-slate-400 dark:text-zinc-500 block text-[10px] uppercase font-bold">EBITDA & Payback</span>
            <span className="font-bold text-purple-600 dark:text-purple-400 text-sm">{ebitdaMargin}% • {payback}</span>
          </div>
        </div>
      </div>

      {/* 10-Pillar Sub-Navigation Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 dark:border-zinc-800 no-scrollbar">
        {PILLAR_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activePillarTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActivePillarTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-sky-600 text-white dark:bg-sky-500 dark:text-zinc-950 font-bold shadow-xs'
                  : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* PILLAR 1: EXECUTIVE SUMMARY */}
      {activePillarTab === 'overview' && (
        <div className="space-y-6">
          <div className="p-6 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-mono text-xs uppercase font-bold">
              <FileText className="w-4 h-4" />
              <span>Strategic Import Substitution Mandate</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {metadata.title}
            </h3>
            <p className="text-sm sm:text-base leading-relaxed text-slate-700 dark:text-zinc-300">
              {executiveSummary?.plainEnglishContext || executiveSummary?.coreValueProposition}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-3">
              <h4 className="text-sm font-bold text-rose-600 dark:text-rose-400 uppercase font-mono tracking-wider">
                The Sovereign Vulnerability (Status Quo)
              </h4>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
                {executiveSummary?.theStrategicProblem}
              </p>
            </div>

            <div className="p-6 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-3">
              <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase font-mono tracking-wider">
                The Domestic Solution (Venture Architecture)
              </h4>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
                {executiveSummary?.theSovereignSolution || executiveSummary?.importSubstitutionOpportunity}
              </p>
            </div>
          </div>

          {/* Product Technical Specifications */}
          {metadata.productSpecification && (
            <div className="p-6 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase font-mono tracking-wider mb-4 flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-sky-500" />
                <span>Chemical & Engineering Purity Specifications</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs font-mono">
                {Object.entries(metadata.productSpecification).map(([key, val]) => (
                  <div key={key} className="p-3 rounded bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                    <span className="text-slate-500 dark:text-zinc-400 block text-[10px] uppercase font-bold truncate">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-zinc-200 block mt-1">
                      {String(val)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Infrastructure & Facility Metrics */}
          {metadata.keyMetrics && (
            <div className="p-6 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase font-mono tracking-wider mb-4 flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-500" />
                <span>Industrial Utilities & Siting Parameters</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 rounded bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                  <span className="text-slate-500 dark:text-zinc-400 block text-[10px] uppercase font-bold">Land Needed</span>
                  <span className="font-semibold text-slate-900 dark:text-zinc-100 text-sm mt-0.5 block">{metadata.keyMetrics.landRequiredAcres || '25-50 Acres'}</span>
                </div>
                <div className="p-3 rounded bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                  <span className="text-slate-500 dark:text-zinc-400 block text-[10px] uppercase font-bold">Water Requirement</span>
                  <span className="font-semibold text-slate-900 dark:text-zinc-100 text-sm mt-0.5 block">{metadata.keyMetrics.waterRequirementMLD || '1.5 MLD'}</span>
                </div>
                <div className="p-3 rounded bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                  <span className="text-slate-500 dark:text-zinc-400 block text-[10px] uppercase font-bold">Power Load</span>
                  <span className="font-semibold text-slate-900 dark:text-zinc-100 text-sm mt-0.5 block">{metadata.keyMetrics.powerRequirementMW || '12 MW'}</span>
                </div>
                <div className="p-3 rounded bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                  <span className="text-slate-500 dark:text-zinc-400 block text-[10px] uppercase font-bold">Direct Jobs Created</span>
                  <span className="font-semibold text-slate-900 dark:text-zinc-100 text-sm mt-0.5 block">{metadata.keyMetrics.employmentDirect || '250-450 Engineers'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PILLAR 2: 36-MONTH MASTER ROADMAP */}
      {activePillarTab === 'roadmap' && (
        <div className="space-y-6">
          <div className="p-6 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Milestone className="w-5 h-5 text-sky-500" />
              <span>36-Month Master Project Execution Timeline (6 Phased Milestones)</span>
            </h3>
            <p className="text-sm text-slate-600 dark:text-zinc-400 mt-1">
              Structured sequence from site procurement through cleanroom qualification, trial batch runs, to commercial offtake delivery.
            </p>
          </div>

          <div className="space-y-4">
            {(roadmapPhases || []).map((phase) => (
              <div 
                key={phase.phaseNumber} 
                className="p-6 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-md bg-sky-600 dark:bg-sky-500 text-white dark:text-zinc-950 font-bold font-mono text-sm flex items-center justify-center shrink-0">
                      0{phase.phaseNumber}
                    </span>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">
                        {phase.phaseName}
                      </h4>
                      <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono">
                        {phase.durationMonths}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 self-start sm:self-auto">
                    Capital: ₹{typeof phase.capitalAllocationINR === 'number' ? (phase.capitalAllocationINR / 10000000).toFixed(1) : phase.capitalAllocationINR} Cr
                  </span>
                </div>

                <p className="text-sm text-slate-700 dark:text-zinc-300 leading-relaxed">
                  <strong className="text-slate-900 dark:text-white font-medium">Core Objective:</strong> {phase.primaryFocus}
                </p>

                {/* Key Milestones */}
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-2 font-bold">
                    Phase Exit Criteria & Milestones:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {(phase.keyMilestonesToExitPhase || []).map((m, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-2 rounded bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 text-slate-700 dark:text-zinc-300">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{m}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PILLAR 3: CAPEX & FINANCIALS */}
      {activePillarTab === 'capex' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Summary Metrics */}
            <div className="lg:col-span-5 bg-white dark:bg-zinc-900 p-6 rounded-md border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
              <h4 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-3 flex items-center gap-2">
                <Coins className="w-4 h-4 text-sky-500" />
                <span>Capital Architecture & Net Outlay</span>
              </h4>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between p-3 rounded bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800">
                  <span className="text-slate-600 dark:text-zinc-400">Total Project CapEx:</span>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">₹{totalCapex} Cr</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800">
                  <span className="text-slate-600 dark:text-zinc-400">Central ISM Subsidy (50%):</span>
                  <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">₹{(totalCapex * 0.5).toFixed(1)} Cr</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800">
                  <span className="text-slate-600 dark:text-zinc-400">State Top-Up Subsidy (20%):</span>
                  <span className="font-bold text-sm text-sky-600 dark:text-sky-400">₹{(totalCapex * 0.2).toFixed(1)} Cr</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/40">
                  <span className="text-sky-900 dark:text-sky-200 font-bold">Net Private Equity Outlay:</span>
                  <span className="font-black text-base text-sky-700 dark:text-sky-300">₹{netOutlay} Cr</span>
                </div>
              </div>

              <div className="pt-2 text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-sans">
                Effective blended government co-funding: <strong>70%</strong> on a pari-passu milestone disbursement basis.
              </div>
            </div>

            {/* Right: Itemized Capital Breakdown */}
            <div className="lg:col-span-7 bg-white dark:bg-zinc-900 p-6 rounded-md border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
              <h4 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-3">
                Itemized Package Allocation (Plant & Machinery, Civil, UPW)
              </h4>

              <div className="space-y-2 text-xs font-mono">
                {capexData?.lineItems ? (
                  capexData.lineItems.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800">
                      <span className="text-slate-700 dark:text-zinc-300 font-sans">{item.category}</span>
                      <span className="font-bold text-slate-900 dark:text-white">₹{typeof item.costCr === 'number' ? item.costCr.toFixed(1) : item.costCr} Cr</span>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 dark:text-zinc-400">Standard itemized breakdown available upon diligence request.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PILLAR 4: MACHINERY BREAKDOWN & SOURCING MAP */}
      {activePillarTab === 'machinery' && (
        <div className="space-y-6">
          <div className="p-6 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-sky-500" />
              <span>Capital Machinery Breakdown: Precision Foreign Imports vs Domestic Heavy Engineering</span>
            </h3>
            <p className="text-sm text-slate-600 dark:text-zinc-400">
              Clear segregation between high-precision foreign tool corridors (Japan, Germany, USA, South Korea) and domestic Indian fabrication partners (BHEL, L&T, Godrej, Thermax).
            </p>
          </div>

          {/* Sourcing Map Vector SVG */}
          <div className="p-6 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-bold">
                Machinery Procurement Logistics Corridors
              </span>
              <span className="text-xs font-mono text-sky-600 dark:text-sky-400 font-semibold">
                Dual-Corridor Architecture
              </span>
            </div>
            <SourcingMapSvg
              importedEquipment={machineryBreakdown?.importedEquipment || machineryBreakdown?.importedHighTech || []}
              indigenousEquipment={machineryBreakdown?.indigenousEquipment || machineryBreakdown?.domesticHeavyEngineering || []}
              plantLocation={metadata.keyMetrics?.primaryIndianClusters || 'Dholera SIR / Sanand, Gujarat'}
              blueprintTitle={metadata.title}
            />
          </div>

          {/* Detailed Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Imported Equipment */}
            <div className="p-6 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-rose-600 dark:text-rose-400 uppercase font-mono tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-xs bg-rose-500"></span>
                <span>Foreign Precision Equipment</span>
              </h4>
              <div className="space-y-3">
                {(machineryBreakdown?.importedEquipment || machineryBreakdown?.importedHighTech || []).map((m: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{m.machineName}</span>
                      <span className="font-mono text-rose-600 dark:text-rose-400 font-semibold">{m.countryOfOrigin || m.origin || 'Import'}</span>
                    </div>
                    <p className="text-slate-600 dark:text-zinc-400">{m.functionAndSpec || m.function}</p>
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-zinc-400 pt-1 border-t border-slate-200 dark:border-zinc-800">
                      <span>Lead Time: {m.leadTimeMonths ? `${m.leadTimeMonths} Months` : '8-14 Months'}</span>
                      <span>Cost: ₹{m.estimatedCostINR ? (typeof m.estimatedCostINR === 'number' ? (m.estimatedCostINR / 10000000).toFixed(1) : m.estimatedCostINR) : 'Market Quote'} Cr</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Domestic Indigenous Equipment */}
            <div className="p-6 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase font-mono tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-xs bg-emerald-500"></span>
                <span>Domestic Indian Engineering</span>
              </h4>
              <div className="space-y-3">
                {(machineryBreakdown?.indigenousEquipment || machineryBreakdown?.domesticHeavyEngineering || []).map((m: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{m.machineName}</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">Make in India</span>
                    </div>
                    <p className="text-slate-600 dark:text-zinc-400">{m.engineeringRole || m.role || m.function}</p>
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-zinc-400 pt-1 border-t border-slate-200 dark:border-zinc-800">
                      <span>Vendors: {m.suggestedIndianFabricators ? m.suggestedIndianFabricators.slice(0, 2).join(', ') : 'L&T, BHEL'}</span>
                      <span>Lead Time: {m.fabricationLeadTimeMonths ? `${m.fabricationLeadTimeMonths} Mo` : '4-8 Mo'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PILLAR 5: MANUFACTURING PROCESS FLOWCHART */}
      {activePillarTab === 'process' && (
        <div className="space-y-6">
          <div className="p-6 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Workflow className="w-5 h-5 text-sky-500" />
              <span>Step-by-Step Production Circuit with Zero Liquid Discharge (ZLD)</span>
            </h3>
            <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
              {manufacturingProcess?.plainEnglishSummary}
            </p>
          </div>

          {/* Process Flowchart Vector SVG */}
          <div className="p-6 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-bold">
                Industrial Closed-Loop Engineering Flow
              </span>
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                ZLD + ISO Cleanroom Compliance
              </span>
            </div>
            <ProcessFlowchartSvg 
              steps={manufacturingProcess?.steps || []} 
              blueprintTitle={metadata.title} 
            />
          </div>

          {/* Sequential Step Cards */}
          <div className="space-y-3">
            {(manufacturingProcess?.steps || []).map((step) => (
              <div key={step.stepNumber} className="p-5 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded bg-sky-600 dark:bg-sky-500 text-white dark:text-zinc-950 font-bold font-mono text-xs flex items-center justify-center">
                      {step.stepNumber}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{step.stepName}</h4>
                  </div>
                  <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                    Yield: {step.yieldRecoveryRate || '99.5%'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-zinc-300 leading-relaxed">
                  {step.plainEnglishDescription}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-slate-100 dark:border-zinc-800">
                  <div className="text-slate-500 dark:text-zinc-400">
                    <span className="font-bold text-slate-700 dark:text-zinc-300">Input:</span> {step.input}
                  </div>
                  <div className="text-emerald-700 dark:text-emerald-400">
                    <span className="font-bold">Output:</span> {step.output}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PILLAR 6: RAW MATERIALS & REAGENTS */}
      {activePillarTab === 'materials' && (
        <div className="space-y-6">
          <div className="p-6 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-sky-500" />
              <span>Precursor Feedstocks, Reagents & Supply Security</span>
            </h3>
            <p className="text-sm text-slate-600 dark:text-zinc-400">
              Input consumption norms, purity grades, and domestic Indian suppliers mapped against global fallback sources.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(rawMaterialsAndReagents || []).map((rm, idx) => (
              <div key={idx} className="p-5 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{rm.materialName}</h4>
                  <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    {typeof rm.estimatedCostPerTonINR === 'number' ? `₹${rm.estimatedCostPerTonINR.toLocaleString('en-IN')}/MT` : (rm.estimatedCostPerTonINR || 'Market Rate')}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  <strong className="text-slate-800 dark:text-zinc-200">Role:</strong> {rm.role}
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono p-2.5 rounded bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800">
                  <div>
                    <span className="text-slate-400 dark:text-zinc-500 text-[10px] uppercase font-bold block">Spec Grade</span>
                    <span className="text-slate-800 dark:text-zinc-200 font-semibold truncate block">{rm.gradeSpec}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-zinc-500 text-[10px] uppercase font-bold block">Consumption</span>
                    <span className="text-slate-800 dark:text-zinc-200 font-semibold truncate block">{rm.consumptionNorm}</span>
                  </div>
                </div>
                <div className="text-xs text-slate-500 dark:text-zinc-400">
                  <span className="font-bold text-slate-700 dark:text-zinc-300">Availability:</span> {rm.availabilityStatus}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PILLAR 7: OFFTAKE BUYERS & MARKET DEMAND */}
      {activePillarTab === 'buyers' && (
        <div className="space-y-6">
          <div className="p-6 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-sky-500" />
              <span>Target Commercial Offtake Customers (Domestic Fabs & Global Tier-1s)</span>
            </h3>
            <p className="text-sm text-slate-600 dark:text-zinc-400">
              Contracted demand absorption pipeline across Indian semiconductor hubs and export corridors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Domestic Indian Offtake */}
            <div className="p-6 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase font-mono tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-xs bg-emerald-500"></span>
                <span>Domestic Indian Semiconductor Buyers</span>
              </h4>
              <div className="space-y-2.5">
                {(buyersAndMarketDemand?.domesticIndianBuyers || []).map((b, idx) => (
                  <div key={idx} className="p-3 rounded bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white mb-1">
                      <span>{b.companyName}</span>
                      <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 font-normal">{b.location}</span>
                    </div>
                    <div className="text-slate-600 dark:text-zinc-400">
                      Annual Demand: <strong>{b.annualDemandEstimatedMT || 'High Volume Domestic Allocation'}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Global Offtake Buyers */}
            <div className="p-6 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-sky-600 dark:text-sky-400 uppercase font-mono tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-xs bg-sky-500"></span>
                <span>Global Semiconductor Tier-1 Customers</span>
              </h4>
              <div className="space-y-2.5">
                {(buyersAndMarketDemand?.globalOfftakeBuyers || []).map((b, idx) => (
                  <div key={idx} className="p-3 rounded bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white mb-1">
                      <span>{b.companyName}</span>
                      <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 font-normal">{b.location}</span>
                    </div>
                    <div className="text-slate-600 dark:text-zinc-400">
                      Annual Demand: <strong>{b.annualDemandEstimatedMT || 'Export Market Quota'}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PILLAR 8: STATUTORY CLEARANCES */}
      {activePillarTab === 'clearances' && (
        <div className="space-y-6">
          <div className="p-6 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-sky-500" />
              <span>Statutory Approvals & Environmental Regulatory Matrix</span>
            </h3>
            <p className="text-sm text-slate-600 dark:text-zinc-400">
              Clearance timelines from MoEFCC, State Pollution Control Boards (CTE/CTO), PESO, and Fire/Hazard safety authorities.
            </p>
          </div>

          <div className="space-y-3">
            {(dueDiligenceAndClearances || []).map((c, idx) => (
              <div key={idx} className="p-5 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 dark:border-zinc-800 pb-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{c.clearanceName}</h4>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                    Lead Time: {c.typicalLeadTimeMonths ? `${c.typicalLeadTimeMonths} Months` : '3-6 Months'}
                  </span>
                </div>
                <div className="text-xs text-slate-600 dark:text-zinc-400">
                  <strong className="text-slate-800 dark:text-zinc-200">Authority:</strong> {c.issuingAuthority} • <strong className="text-slate-800 dark:text-zinc-200">Mandate:</strong> {c.statutoryMandate}
                </div>
                <div className="text-xs text-rose-600 dark:text-rose-400 font-mono">
                  Risk if Delayed: {c.riskIfDelayed}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PILLAR 9: STRATEGIC FUTURE SCOPE */}
      {activePillarTab === 'future' && (
        <div className="space-y-6">
          <div className="p-6 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-sky-500" />
              <span>Future Scope, Node Scaling & Downstream Ecosystem Synergies</span>
            </h3>
            <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
              Long-term growth vectors including sub-nanometer node capability upgrades, backward raw mineral integration, EV battery electrolyte production, and export scaling.
            </p>
          </div>

          <div className="p-6 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white font-mono uppercase tracking-wider">
              Strategic Expansion Horizons
            </h4>
            <div className="space-y-2 text-xs text-slate-700 dark:text-zinc-300">
              {Array.isArray(futureScopeAndExpansion) ? (
                futureScopeAndExpansion.map((f: any, idx: number) => (
                  <div key={idx} className="p-3 rounded bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800">
                    <span className="font-bold text-slate-900 dark:text-white block mb-1">{f.title || f.horizon || `Horizon ${idx + 1}`}</span>
                    <p className="text-slate-600 dark:text-zinc-400">{f.description || f.scope || JSON.stringify(f)}</p>
                  </div>
                ))
              ) : typeof futureScopeAndExpansion === 'object' && futureScopeAndExpansion !== null ? (
                Object.entries(futureScopeAndExpansion).map(([k, v]) => (
                  <div key={k} className="p-3 rounded bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800">
                    <span className="font-bold text-slate-900 dark:text-white block mb-1 capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                    <p className="text-slate-600 dark:text-zinc-400">{String(v)}</p>
                  </div>
                ))
              ) : (
                <p className="text-slate-600 dark:text-zinc-400">{String(futureScopeAndExpansion || 'Multi-phase expansion to support domestic fabs and regional exports.')}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PILLAR 10: THREATS & CONCRETE MITIGATIONS */}
      {activePillarTab === 'threats' && (
        <div className="space-y-6">
          <div className="p-6 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>Risk Matrix: Sovereign Threats & Concrete Mitigation Playbooks</span>
            </h3>
            <p className="text-sm text-slate-600 dark:text-zinc-400">
              Analysis of feedstock purity swings, Chinese price dumping, export restrictions, and contamination safeguards with actionable mitigation plans.
            </p>
          </div>

          <div className="space-y-4">
            {(threatsAndMitigations || []).map((t, idx) => (
              <div key={idx} className="p-5 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-2.5">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {t.threatCategory || `Risk Factor ${idx + 1}`}
                  </span>
                  <div className="flex items-center gap-2 text-[11px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40 font-semibold">
                      Prob: {t.probabilityScore || 'Medium'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40 font-semibold">
                      Impact: {t.impactSeverity || 'High'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  <strong className="text-slate-800 dark:text-zinc-200">Threat Nature:</strong> {t.riskDescription}
                </p>

                <div className="p-3 rounded bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/30 text-xs">
                  <strong className="text-emerald-800 dark:text-emerald-300 block mb-1 font-mono uppercase tracking-wider text-[10px]">
                    Concrete Mitigation Playbook:
                  </strong>
                  <p className="text-slate-700 dark:text-zinc-300 leading-relaxed">
                    {t.concreteMitigationStrategy}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
