import React, { useState } from 'react';
import { Sliders, Coins, Landmark, Zap, Droplets, MapPin, CheckCircle2 } from 'lucide-react';
import { SCINT_STATE_POLICIES, SCINT_INDUSTRY_PRESETS, SCIntIndustryPreset } from '@/data/scintData';
import { Badge } from '@/components/common/Badge';

interface SCIntSubsidyLabProps {
  onApplyPreset?: (preset: SCIntIndustryPreset) => void;
}

export const SCIntSubsidyLab: React.FC<SCIntSubsidyLabProps> = () => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('silicon-fab');
  const [capexInput, setCapexInput] = useState<number>(10000);
  const [centralGrantPercent, setCentralGrantPercent] = useState<number>(50);
  const [selectedStateId, setSelectedStateId] = useState<string>('gujarat');

  const selectedState = SCINT_STATE_POLICIES.find((s) => s.id === selectedStateId) || SCINT_STATE_POLICIES[0];

  const handleSelectPreset = (preset: SCIntIndustryPreset) => {
    setSelectedPresetId(preset.id);
    setCapexInput(preset.defaultCapexINR);
    setCentralGrantPercent(preset.centralSubsidyPercent);
  };

  const centralGrantAmount = (capexInput * centralGrantPercent) / 100;
  const stateGrantAmount = (capexInput * selectedState.capexTopUpPercent) / 100;
  const totalSubsidies = centralGrantAmount + stateGrantAmount;
  const totalSubsidyPercent = centralGrantPercent + selectedState.capexTopUpPercent;
  const netPromoterEquity = Math.max(0, capexInput - totalSubsidies);
  const estimatedDebt = Math.round(netPromoterEquity * 0.6); // 60:40 standard promoter debt-to-equity ratio
  const purePromoterCash = Math.max(0, netPromoterEquity - estimatedDebt);

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline">Interactive Simulation Engine</Badge>
          <span className="text-xs text-zinc-400 font-mono">India Semicon Mission (ISM 2.0)</span>
        </div>
        <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
          CapEx & Sovereign Subsidy Incentive Engine
        </h2>
        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-3xl">
          Simulate Central Government (ISM / SPECS 2.0) and State Government fiscal co-funding to compute net promoter equity and debt requirements for semiconductor manufacturing in India.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Controls */}
        <div className="lg:col-span-6 space-y-6">
          {/* Industry Benchmark Presets */}
          <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold block">
              1. Choose Project Benchmark Preset
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SCINT_INDUSTRY_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-400 dark:border-sky-500 shadow-sm'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">{preset.name}</span>
                      <span className="text-[10px] font-mono text-zinc-400">₹{preset.defaultCapexINR} Cr</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1">
                      {preset.categoryLabel} ({preset.centralSubsidyPercent}% Central Grant)
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tactile CapEx Slider & Input */}
          <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold">
                2. Total Factory Capital Expenditure (CapEx)
              </span>
              <div className="flex items-center gap-1 font-mono text-xs font-bold text-sky-600 dark:text-sky-400">
                <span>₹</span>
                <input
                  type="number"
                  min={50}
                  max={50000}
                  step={50}
                  value={capexInput}
                  onChange={(e) => setCapexInput(Math.max(50, Number(e.target.value) || 50))}
                  className="w-24 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-right text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
                <span>Crores</span>
              </div>
            </div>

            <input
              type="range"
              min={50}
              max={50000}
              step={50}
              value={capexInput}
              onChange={(e) => setCapexInput(Number(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer"
            />

            <div className="flex justify-between text-[10px] font-mono text-zinc-400">
              <span>₹50 Cr (Micro-modular)</span>
              <span>₹10,000 Cr</span>
              <span>₹50,000 Cr (Mega-Fab)</span>
            </div>
          </div>

          {/* Target State Incentive Selector */}
          <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold block">
              3. Target State Industrial Policy & Top-Up
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SCINT_STATE_POLICIES.map((sp) => {
                const isSelected = selectedStateId === sp.id;
                return (
                  <button
                    key={sp.id}
                    type="button"
                    onClick={() => setSelectedStateId(sp.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-400 dark:border-sky-500 shadow-sm'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900'
                    }`}
                  >
                    <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{sp.state}</div>
                    <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                      +{sp.capexTopUpPercent}% Top-Up
                    </div>
                  </button>
                );
              })}
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              {selectedState.description}
            </p>
          </div>
        </div>

        {/* Right Column: Live Financial Waterfall Stack */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider font-mono">
                Project Financing Structure
              </h3>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                {totalSubsidyPercent}% Combined Subsidy
              </span>
            </div>

            {/* Visual Waterfall Numbers */}
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500">Gross Factory CapEx:</span>
                <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  ₹{capexInput.toLocaleString()} Crores
                </span>
              </div>

              <div className="flex justify-between items-center text-sky-600 dark:text-sky-400">
                <span>Central Government (ISM {centralGrantPercent}%):</span>
                <span className="font-bold">-₹{centralGrantAmount.toLocaleString()} Crores</span>
              </div>

              <div className="flex justify-between items-center text-sky-600 dark:text-sky-400">
                <span>{selectedState.state} State Incentive (+{selectedState.capexTopUpPercent}%):</span>
                <span className="font-bold">-₹{stateGrantAmount.toLocaleString()} Crores</span>
              </div>

              <div className="flex justify-between items-center pt-3 border-t-2 border-zinc-200 dark:border-zinc-700 text-emerald-600 dark:text-emerald-400">
                <span className="font-bold text-sm">Net Promoter Capital Outlay:</span>
                <span className="font-black text-lg">₹{netPromoterEquity.toLocaleString()} Crores</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-zinc-500 border-t border-zinc-100 dark:border-zinc-800">
                <div>Promoter Equity (Cash): <strong className="text-zinc-800 dark:text-zinc-200">₹{purePromoterCash.toFixed(1)} Cr</strong></div>
                <div>Commercial Bank Debt: <strong className="text-zinc-800 dark:text-zinc-200">₹{estimatedDebt.toFixed(1)} Cr</strong></div>
              </div>
            </div>

            {/* Non-Fiscal State Advantages */}
            <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 font-mono uppercase tracking-wider">
                {selectedState.state} Non-Fiscal Incentives
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-zinc-900 dark:text-zinc-100">
                    <MapPin className="w-3.5 h-3.5 text-sky-500" />
                    <span>Land Subsidy</span>
                  </div>
                  <p className="text-[11px] text-zinc-500">{selectedState.landRebate}</p>
                </div>

                <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-zinc-900 dark:text-zinc-100">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Power Tariff</span>
                  </div>
                  <p className="text-[11px] text-zinc-500">{selectedState.powerSubsidy}</p>
                </div>

                <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-zinc-900 dark:text-zinc-100">
                    <Droplets className="w-3.5 h-3.5 text-blue-500" />
                    <span>Water Tariff</span>
                  </div>
                  <p className="text-[11px] text-zinc-500">{selectedState.waterRebate}</p>
                </div>

                <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-zinc-900 dark:text-zinc-100">
                    <Landmark className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Stamp Duty Exemption</span>
                  </div>
                  <p className="text-[11px] text-zinc-500">{selectedState.stampDuty}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
