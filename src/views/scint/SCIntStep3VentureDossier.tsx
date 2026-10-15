import React, { useState } from 'react';
import {
  ArrowLeft,
  Factory,
  CheckCircle2,
  MapPin,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
} from 'lucide-react';
import { SCIntNodeBlueprint } from '@/types';
import { SCINT_STATE_POLICIES } from '@/data/scintData';
import { Badge } from '@/components/common/Badge';

interface SCIntStep3VentureDossierProps {
  playbook: SCIntNodeBlueprint;
  onBackToPlaybooks: () => void;
}

export const SCIntStep3VentureDossier: React.FC<SCIntStep3VentureDossierProps> = ({
  playbook,
  onBackToPlaybooks,
}) => {
  const [capexAmount, setCapexAmount] = useState<number>(playbook.capexBenchmarkINR);
  const [selectedStateId, setSelectedStateId] = useState<string>('gujarat');
  const [isTechnicalSpecsOpen, setIsTechnicalSpecsOpen] = useState<boolean>(false);

  const selectedState =
    SCINT_STATE_POLICIES.find((s) => s.id === selectedStateId) || SCINT_STATE_POLICIES[0];

  const centralGrantRate = playbook.subsidyPercentageISM;
  const centralGrantAmount = (capexAmount * centralGrantRate) / 100;
  const stateGrantAmount = (capexAmount * selectedState.capexTopUpPercent) / 100;
  const totalSubsidies = centralGrantAmount + stateGrantAmount;
  const totalSubsidyPercent = centralGrantRate + selectedState.capexTopUpPercent;
  const netPromoterCapital = Math.max(0, capexAmount - totalSubsidies);
  const estimatedDebt = Math.round(netPromoterCapital * 0.6);
  const promoterPureCash = Math.max(0, netPromoterCapital - estimatedDebt);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Back Button */}
      <button
        type="button"
        onClick={onBackToPlaybooks}
        className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Playbooks in Stage 0{playbook.tier}</span>
      </button>

      {/* Hero Headline & Sovereign Context */}
      <div className="space-y-3 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 px-2.5 py-1 rounded-md bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/40">
            Node #{playbook.nodeNumber}
          </span>
          <span className="text-zinc-300 dark:text-zinc-700">•</span>
          <Badge variant="outline">{playbook.category}</Badge>
          <span className="text-zinc-300 dark:text-zinc-700">•</span>
          <span className="text-xs font-mono text-zinc-500 font-medium">{playbook.tierName}</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
          {playbook.name}
        </h2>

        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 max-w-4xl leading-relaxed">
          {playbook.description}
        </p>
      </div>

      {/* The Visual Financial Waterfall & Simulator */}
      <div className="p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-md space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Interactive Investment & Government Subsidy Calculator
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              Adjust the factory size slider below, or switch states to see how much money the government pays toward your factory.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs font-mono text-zinc-400 font-medium">Select State Incentive:</span>
            <select
              value={selectedStateId}
              onChange={(e) => setSelectedStateId(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-sky-500/50 cursor-pointer"
            >
              {SCINT_STATE_POLICIES.map((sp) => (
                <option key={sp.id} value={sp.id}>
                  {sp.state} (+{sp.capexTopUpPercent}% Top-Up)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tactile CapEx Slider */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              Total Factory Setup Cost:
            </span>
            <span className="font-mono text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
              ₹{capexAmount.toLocaleString()} Crores
            </span>
          </div>

          <input
            type="range"
            min={playbook.capexModularINR}
            max={playbook.capexBenchmarkINR * 1.5}
            step={25}
            value={capexAmount}
            onChange={(e) => setCapexAmount(Number(e.target.value))}
            className="w-full accent-sky-500 cursor-pointer h-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg"
          />

          <div className="flex justify-between text-xs font-mono text-zinc-400">
            <span>Smaller Pilot Factory: ₹{playbook.capexModularINR} Cr</span>
            <span>Full Commercial Factory: ₹{playbook.capexBenchmarkINR} Cr</span>
          </div>
        </div>

        {/* Visual Waterfall Breakdown (Human & Clean) */}
        <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/60 space-y-4">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-1 border-b border-zinc-200 dark:border-zinc-700">
              <span className="text-zinc-600 dark:text-zinc-400 font-medium">Total Factory Setup Cost:</span>
              <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                ₹{capexAmount.toLocaleString()} Cr
              </span>
            </div>

            <div className="flex justify-between items-center text-sky-600 dark:text-sky-400">
              <span className="font-medium">
                Central Government Grant (ISM 2.0 - {centralGrantRate}% Co-funding):
              </span>
              <span className="font-mono font-bold">-₹{centralGrantAmount.toFixed(1)} Cr</span>
            </div>

            <div className="flex justify-between items-center text-sky-600 dark:text-sky-400">
              <span className="font-medium">
                {selectedState.state} State Government Grant (+{selectedState.capexTopUpPercent}% Top-Up):
              </span>
              <span className="font-mono font-bold">-₹{stateGrantAmount.toFixed(1)} Cr</span>
            </div>

            <div className="flex justify-between items-center pt-3 border-t-2 border-zinc-300 dark:border-zinc-600">
              <div>
                <span className="text-base font-bold text-zinc-900 dark:text-zinc-100 block">
                  Your Actual Net Cost ({totalSubsidyPercent}% Paid by Government Grants!):
                </span>
                <span className="text-xs text-zinc-500">
                  You only need pure cash equity of ₹{promoterPureCash.toFixed(0)} Cr + ₹{estimatedDebt.toFixed(0)} Cr from bank loans.
                </span>
              </div>
              <span className="font-mono text-3xl font-black text-emerald-600 dark:text-emerald-400">
                ₹{netPromoterCapital.toFixed(1)} Cr
              </span>
            </div>
          </div>
        </div>

        {/* Operational Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <span className="text-xs font-mono text-zinc-400 uppercase font-semibold block">Time to Recover Money</span>
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1 block">
              {playbook.paybackPeriodYears} Years
            </span>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <span className="text-xs font-mono text-zinc-400 uppercase font-semibold block">Expected Operating Profit</span>
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
              {playbook.ebitdaMarginExpected}
            </span>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <span className="text-xs font-mono text-zinc-400 uppercase font-semibold block">Technology Maturity</span>
            <span className="text-2xl font-bold text-sky-600 dark:text-sky-400 mt-1 block">
              Proven Tech (Level {playbook.techReadinessLevel} of 9)
            </span>
          </div>
        </div>
      </div>

      {/* Confirmed Offtake Customers & Target Clusters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Offtake Buyers */}
        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4">
          <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span>Ready Customers in India (Guaranteed Buyers for Your Factory)</span>
          </h4>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Companies currently manufacturing in India that need these supplies locally:
          </p>

          <div className="space-y-2">
            {playbook.offtakeBuyers.map((buyer) => (
              <div
                key={buyer}
                className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 font-semibold text-sm text-zinc-800 dark:text-zinc-200"
              >
                {buyer}
              </div>
            ))}
          </div>
        </div>

        {/* Target Clusters */}
        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4">
          <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-sky-500" />
            <span>Best Industrial Parks in India to Build This Factory</span>
          </h4>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Industrial clusters offering 24/7 dedicated power, chemical water, and fast logistics:
          </p>

          <div className="space-y-2">
            {playbook.targetClusters.map((cluster) => (
              <div
                key={cluster}
                className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 font-semibold text-sm text-zinc-800 dark:text-zinc-200"
              >
                {cluster}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expandable Deep Dive Accordion (Clean, Hidden by Default) */}
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900">
        <button
          type="button"
          onClick={() => setIsTechnicalSpecsOpen(!isTechnicalSpecsOpen)}
          className="w-full p-6 text-left flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
        >
          <div>
            <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Factory Machinery, Ingredients & Government Licenses
            </h4>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              Click to see the exact equipment to buy, raw materials needed, and required government permits.
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm font-semibold text-sky-600 dark:text-sky-400">
            <span>{isTechnicalSpecsOpen ? 'Hide Details' : 'View Machinery & Permits'}</span>
            {isTechnicalSpecsOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </button>

        {isTechnicalSpecsOpen && (
          <div className="p-6 pt-0 border-t border-zinc-100 dark:border-zinc-800 space-y-6 text-sm">
            {/* Machinery Breakdown */}
            <div className="space-y-3 pt-6">
              <h5 className="font-bold text-zinc-900 dark:text-zinc-100 uppercase font-mono text-xs tracking-wider">
                Heavy Factory Machines Needed
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {playbook.keyMachinery.map((mach) => (
                  <div
                    key={mach}
                    className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/30 flex items-center gap-2"
                  >
                    <Factory className="w-4 h-4 text-sky-500 flex-shrink-0" />
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">{mach}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Feedstocks & Clearances */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="space-y-3">
                <h5 className="font-bold text-zinc-900 dark:text-zinc-100 uppercase font-mono text-xs tracking-wider">
                  Raw Materials & Ingredients
                </h5>
                <div className="space-y-1.5">
                  {playbook.primaryRawMaterials.map((mat) => (
                    <div
                      key={mat}
                      className="p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/30 text-zinc-700 dark:text-zinc-300"
                    >
                      {mat}
                    </div>
                  ))}
                </div>
              </div>

              {playbook.clearances && playbook.clearances.length > 0 && (
                <div className="space-y-3">
                  <h5 className="font-bold text-zinc-900 dark:text-zinc-100 uppercase font-mono text-xs tracking-wider">
                    Government Licenses & Permissions Required
                  </h5>
                  <div className="space-y-1.5">
                    {playbook.clearances.map((c) => (
                      <div
                        key={c}
                        className="p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/30 text-zinc-700 dark:text-zinc-300 flex items-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4 text-sky-500 flex-shrink-0" />
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
