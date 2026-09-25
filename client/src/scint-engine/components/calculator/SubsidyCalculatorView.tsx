import React from 'react';
import { useScintData } from '../../context/ScintDataContext';
import { Calculator, Coins, Building2, Zap, Droplets, ShieldCheck, Check } from 'lucide-react';

export const SubsidyCalculatorView: React.FC = () => {
  const { calculatorInputs, updateCalculatorInputs, applyCalculatorPreset } = useScintData();

  const capex = Math.max(10, calculatorInputs.capexINR || 10000);
  const projectType = calculatorInputs.facilityType;
  const state = calculatorInputs.stateName;

  // Subsidy calculations
  let centralRate = 0.50; // ISM standard 50%
  if (projectType === 'consumables') centralRate = 0.25; // SPECS 25%

  const centralAmount = capex * centralRate;

  let stateRateOfCentral = 0.40;
  let powerTariffDiscount = "₹2/unit (10 yrs) + ₹12/m3 water subsidy";
  let recommendedLoc = "Dholera SIR, Gujarat";

  if (state === 'gujarat') {
    stateRateOfCentral = 0.40;
    powerTariffDiscount = "₹2/unit (10 yrs) + ₹12/m3 water subsidy";
    recommendedLoc = (projectType === 'osat') 
      ? "Sanand GIDC, Gujarat" 
      : (projectType === 'consumables') 
      ? "Dahej PCPIR / Sanand, Gujarat" 
      : "Dholera SIR, Gujarat";
  } else if (state === 'up') {
    stateRateOfCentral = 0.50;
    powerTariffDiscount = "100% electricity duty waiver (10 yrs)";
    recommendedLoc = "YEIDA / Jewar Airport Corridor, Greater Noida";
  } else if (state === 'tamilnadu') {
    stateRateOfCentral = 0.35;
    powerTariffDiscount = "Green power corridor priority tariff";
    recommendedLoc = "Sriperumbudur / Oragadam, Tamil Nadu";
  } else if (state === 'karnataka') {
    stateRateOfCentral = 0.25;
    powerTariffDiscount = "₹1.50/unit rebate (5 yrs) + R&D grant";
    recommendedLoc = "Mysuru ESDM Cluster / Bengaluru KIADB";
  } else if (state === 'assam') {
    stateRateOfCentral = 0.40;
    powerTariffDiscount = "Subsidized hydro-power allocation";
    recommendedLoc = "Morigaon Semiconductor Park, Assam";
  }

  const stateAmount = centralAmount * stateRateOfCentral;
  const totalSubsidyAmount = centralAmount + stateAmount;
  const investorNetOutlay = capex - totalSubsidyAmount;
  const effectiveSubsidyPercent = (totalSubsidyAmount / capex) * 100;

  const centralPct = (centralAmount / capex) * 100;
  const statePct = (stateAmount / capex) * 100;
  const outlayPct = Math.max(0, 100 - centralPct - statePct);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider block mb-1">
            Financial Simulation Engine
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            India Semiconductor Mission (ISM 2.0) Subsidy Calculator
          </h2>
          <p className="text-sm text-slate-600 dark:text-zinc-400 mt-1">
            Simulate Central (up to 50%) and State (20-50% matching) fiscal grants to calculate net private equity and debt factory setup outlay.
          </p>
        </div>
        <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/50 px-3 py-1.5 rounded-md self-start md:self-auto">
          Semicon 2.0 Framework
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Calculator Controls */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 p-6 rounded-md border border-slate-200 dark:border-zinc-800 space-y-5 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-zinc-800 pb-3 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-sky-500" />
            <span>Project Parameters</span>
          </h3>

          {/* Benchmark Presets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase font-bold text-slate-600 dark:text-zinc-400">
                Benchmark Presets
              </span>
              <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono">Real India Projects</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {[
                { id: 'tata-dholera', label: 'Tata Dholera', spec: '₹91.5k Cr • Fab' },
                { id: 'micron-sanand', label: 'Micron Sanand', spec: '₹22.5k Cr • OSAT' },
                { id: 'cg-semi', label: 'CG Semi', spec: '₹7.6k Cr • OSAT' },
                { id: 'kaynes-sanand', label: 'Kaynes Semicon', spec: '₹3.3k Cr • OSAT' },
                { id: 'polymatech-tn', label: 'Polymatech TN', spec: '₹5k Cr • SiC/GaN' },
                { id: 'yeida-fab', label: 'YEIDA / Vama', spec: '₹20k Cr • Fab' },
              ].map((p) => {
                const isSelected = calculatorInputs.nodeId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => applyCalculatorPreset(p.id)}
                    className={`p-2 rounded-md text-left border transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200 font-bold shadow-xs'
                        : 'border-slate-200 dark:border-zinc-800 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-950 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                    }`}
                  >
                    <span className="font-bold text-slate-900 dark:text-zinc-100 block truncate">{p.label}</span>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">{p.spec}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Project Category */}
          <div>
            <label className="block text-xs font-mono uppercase font-bold text-slate-600 dark:text-zinc-400 mb-2">
              Project Category
            </label>
            <select
              value={calculatorInputs.facilityType}
              onChange={(e) => updateCalculatorInputs({ facilityType: e.target.value as any })}
              className="w-full px-3.5 py-2.5 rounded-md bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 font-sans cursor-pointer"
            >
              <option value="silicon-fab">Commercial Silicon Fab (50% Central Grant)</option>
              <option value="compound-semi">Compound Semi Fab - SiC / GaN (50% Central Grant)</option>
              <option value="osat">OSAT / ATMP Packaging Facility (50% Central Grant)</option>
              <option value="consumables">Consumables / Chemicals / SPECS (25% Central Grant)</option>
            </select>
          </div>

          {/* Total Factory CapEx Slider & Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono uppercase font-bold text-slate-600 dark:text-zinc-400">
                Total Factory CapEx
              </label>
              <div className="flex items-center gap-1.5 font-mono text-sky-600 dark:text-sky-400 text-base font-bold">
                <span>₹</span>
                <input
                  type="number"
                  value={calculatorInputs.capexINR}
                  min={100}
                  max={100000}
                  step={100}
                  onChange={(e) => updateCalculatorInputs({ capexINR: parseFloat(e.target.value) || 100 })}
                  className="w-28 px-2.5 py-1 rounded bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 text-right focus:outline-none focus:border-sky-500 text-slate-900 dark:text-white"
                />
                <span>Cr</span>
              </div>
            </div>
            <input
              type="range"
              min={100}
              max={100000}
              step={100}
              value={calculatorInputs.capexINR}
              onChange={(e) => updateCalculatorInputs({ capexINR: parseFloat(e.target.value) || 100 })}
              className="w-full accent-sky-500 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 dark:text-zinc-400 font-mono mt-1">
              <span>₹100 Cr (Consumables)</span>
              <span>₹25,000 Cr</span>
              <span>₹50,000 Cr</span>
              <span>₹1,00,000 Cr (Mega Fab)</span>
            </div>
          </div>

          {/* State Selection */}
          <div>
            <label className="block text-xs font-mono uppercase font-bold text-slate-600 dark:text-zinc-400 mb-2">
              Target State Government
            </label>
            <select
              value={calculatorInputs.stateName}
              onChange={(e) => updateCalculatorInputs({ stateName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-md bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 font-sans cursor-pointer"
            >
              <option value="gujarat">Gujarat (40% Central match + 75% land rebate)</option>
              <option value="up">Uttar Pradesh (50% Central match + 75% YEIDA land rebate)</option>
              <option value="tamilnadu">Tamil Nadu (35% Central match + SIPCOT corridor)</option>
              <option value="karnataka">Karnataka (25% capex top-up + R&D grants)</option>
              <option value="assam">Assam (40% Central match + Morigaon park)</option>
            </select>
          </div>
        </div>

        {/* Right Column: Capital Stack & Subsidy Outputs */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 p-6 rounded-md border border-slate-200 dark:border-zinc-800 flex flex-col justify-between space-y-6 shadow-xs">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-zinc-800 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-emerald-500" />
                <span>Simulated Capital Structure</span>
              </div>
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                {effectiveSubsidyPercent.toFixed(1)}% Co-Funded by Govt
              </span>
            </h3>

            {/* Visual Capital Stack Bar */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-zinc-400">
                <span>Capital Distribution</span>
                <span>Total: ₹{capex.toLocaleString('en-IN')} Cr</span>
              </div>
              <div className="w-full h-8 rounded-md overflow-hidden flex bg-slate-100 dark:bg-zinc-800 p-0.5 border border-slate-200 dark:border-zinc-700">
                <div 
                  style={{ width: `${centralPct}%` }}
                  className="bg-sky-600 dark:bg-sky-500 h-full flex items-center justify-center text-white text-[11px] font-bold font-mono transition-all"
                  title={`Central Grant: ₹${centralAmount.toLocaleString('en-IN')} Cr (${centralPct.toFixed(0)}%)`}
                >
                  {centralPct > 12 && `${centralPct.toFixed(0)}%`}
                </div>
                <div 
                  style={{ width: `${statePct}%` }}
                  className="bg-emerald-600 dark:bg-emerald-500 h-full flex items-center justify-center text-white text-[11px] font-bold font-mono transition-all"
                  title={`State Subsidy: ₹${stateAmount.toLocaleString('en-IN')} Cr (${statePct.toFixed(0)}%)`}
                >
                  {statePct > 10 && `${statePct.toFixed(0)}%`}
                </div>
                <div 
                  style={{ width: `${outlayPct}%` }}
                  className="bg-slate-700 dark:bg-zinc-600 h-full flex items-center justify-center text-white text-[11px] font-bold font-mono transition-all"
                  title={`Private Investor Outlay: ₹${investorNetOutlay.toLocaleString('en-IN')} Cr (${outlayPct.toFixed(0)}%)`}
                >
                  {outlayPct > 12 && `${outlayPct.toFixed(0)}%`}
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono pt-1 text-slate-600 dark:text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-sky-500"></span>
                  <span>Central Grant ({centralPct.toFixed(0)}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500"></span>
                  <span>State Grant ({statePct.toFixed(0)}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-slate-700 dark:bg-zinc-600"></span>
                  <span>Private Outlay ({outlayPct.toFixed(0)}%)</span>
                </div>
              </div>
            </div>

            {/* Figures Grid */}
            <div className="mt-5 grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3.5 rounded bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                <span className="text-slate-500 dark:text-zinc-400 block uppercase text-[10px] font-bold">
                  Central Fiscal Grant
                </span>
                <span className="text-lg font-bold text-sky-600 dark:text-sky-400 mt-1 block">
                  ₹{centralAmount.toLocaleString('en-IN')} Cr
                </span>
                <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-sans mt-0.5 block">
                  {(centralRate * 100).toFixed(0)}% Project Cost (Pari-Passu)
                </span>
              </div>

              <div className="p-3.5 rounded bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                <span className="text-slate-500 dark:text-zinc-400 block uppercase text-[10px] font-bold">
                  State Matching Subsidy
                </span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
                  ₹{stateAmount.toLocaleString('en-IN')} Cr
                </span>
                <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-sans mt-0.5 block">
                  {(stateRateOfCentral * centralRate * 100).toFixed(0)}% Additional Top-Up Grant
                </span>
              </div>

              <div className="p-3.5 rounded bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                <span className="text-slate-500 dark:text-zinc-400 block uppercase text-[10px] font-bold">
                  Total Govt Co-Funding
                </span>
                <span className="text-lg font-bold text-slate-900 dark:text-white mt-1 block">
                  ₹{totalSubsidyAmount.toLocaleString('en-IN')} Cr
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-sans mt-0.5 block">
                  {effectiveSubsidyPercent.toFixed(1)}% Combined Support
                </span>
              </div>

              <div className="p-3.5 rounded bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/40">
                <span className="text-sky-800 dark:text-sky-300 block uppercase text-[10px] font-bold">
                  Net Private Investor Outlay
                </span>
                <span className="text-lg font-black text-sky-700 dark:text-sky-300 mt-1 block">
                  ₹{investorNetOutlay.toLocaleString('en-IN')} Cr
                </span>
                <span className="text-[11px] text-sky-600 dark:text-sky-400 font-sans mt-0.5 block font-semibold">
                  Debt & Equity Capital Requirement
                </span>
              </div>
            </div>
          </div>

          {/* Operational Incentives & Cluster Recommendation */}
          <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 space-y-3">
            <h4 className="text-xs font-mono font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              Additional State Operational Subsidies & Utility Concessions
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 flex items-start gap-2.5">
                <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">Power Tariff Concession</span>
                  <span className="text-slate-600 dark:text-zinc-400">{powerTariffDiscount}</span>
                </div>
              </div>

              <div className="p-3 rounded bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 flex items-start gap-2.5">
                <Building2 className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">Recommended Cluster</span>
                  <span className="text-slate-600 dark:text-zinc-400">{recommendedLoc}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
