import React from 'react';
import { INDIA_POLICIES } from '../../data/india_policies';
import { 
  ShieldAlert, 
  TrendingUp, 
  FileText, 
  Building, 
  AlertTriangle, 
  CheckCircle2, 
  BarChart3,
  Globe
} from 'lucide-react';

export const MarketIntelligenceView: React.FC = () => {
  const { nationalOverview, centralSchemes, statePolicies } = INDIA_POLICIES;

  const chokepoints = [
    {
      mineral: "Gallium (Ga 7N: 99.99999%)",
      application: "GaN power chips, GaAs RF front-ends, Blue/UV LEDs, advanced radars",
      monopoly: "94% Chinese Global Refining Monopoly",
      riskLevel: "Critical",
      indianAlternative: "Hindalco Renukoot & Belagavi alumina refinery alkaline Bayer liquor extraction (capacity 10-15 MTPA potential)."
    },
    {
      mineral: "Germanium (Ge 6N)",
      application: "Infrared thermal optics, space solar cells, high-speed SiGe transistors",
      monopoly: "83% Global Supply Dominated by China",
      riskLevel: "Critical",
      indianAlternative: "Hindustan Zinc sphalerite flue dust leach circuits and coal fly ash recovery."
    },
    {
      mineral: "Acid-Grade Fluorspar (CaF2 ≥ 97%)",
      application: "Precursor for Ultra-Pure Hydrofluoric Acid (UP-HF <10 ppt) & NF3 etch gas",
      monopoly: "68% Global Chemical-Grade Supply Held by China & Mongolia",
      riskLevel: "High",
      indianAlternative: "GMDC Ambadungar mine (Gujarat) revival (20k-50k MTPA beneficiation plant) + phosphoric acid fluorosilicic acid (FSA) circular conversion."
    },
    {
      mineral: "High-Purity Quartz (4N SiO2)",
      application: "Synthetic fused silica crucibles (32\" Czochralski ingots) and quartz diffusion tubes",
      monopoly: "Single Global Chokepoint: Spruce Pine, North Carolina (Sibelco)",
      riskLevel: "Extreme",
      indianAlternative: "Rajasthan/Andhra pegmatite deposits multi-stage acid leaching + synthetic silicon tetrachloride (SiCl4) chemical vapor soot deposition."
    }
  ];

  const marginBenchmarks = [
    { segment: "Front-End Semiconductor Foundries (TSMC, Intel)", gross: "50% - 55%", ebit: "38% - 44%", capex: "High (45-55% Rev)" },
    { segment: "Capital Equipment Lithography & Etch (ASML, Lam)", gross: "48% - 53%", ebit: "28% - 34%", capex: "Medium (10-15% Rev)" },
    { segment: "Specialty Electronic Gases & Precursors (Entegris)", gross: "42% - 48%", ebit: "24% - 30%", capex: "Medium (15-20% Rev)" },
    { segment: "Silicon Ingot & Bare Wafer Makers (Shin-Etsu)", gross: "34% - 40%", ebit: "22% - 28%", capex: "High (35-45% Rev)" },
    { segment: "Advanced Packaging & OSAT (ASE, Amkor, Micron)", gross: "18% - 24%", ebit: "10% - 14%", capex: "Moderate (20-25% Rev)" },
    { segment: "Mined Raw Minerals & Beneficiation (Fluorspar, Quartz)", gross: "35% - 45%", ebit: "22% - 28%", capex: "Moderate (18-24% Rev)" }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider block mb-1">
            Macro Techno-Economics
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Sovereign Chokepoints, Margin Dynamics & Policy Architecture
          </h2>
          <p className="text-sm text-slate-600 dark:text-zinc-400 mt-1">
            Global market margin benchmarks, Chinese export monopoly risks, and India's multi-layered semiconductor policy incentives.
          </p>
        </div>
        <span className="text-xs font-mono font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/50 px-3 py-1.5 rounded-md self-start md:self-auto">
          Geopolitical Risk Intelligence
        </span>
      </div>

      {/* Critical Minerals Chokepoints Matrix */}
      <div className="p-6 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Critical Minerals & Precursor Chokepoints (Chinese Monopoly Assessment)
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500 dark:text-zinc-400">
            Export Quota & Sovereign Exposure
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {chokepoints.map((cp, idx) => (
            <div key={idx} className="p-5 rounded-md bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-2">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{cp.mineral}</h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40 font-bold">
                  {cp.riskLevel}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                <strong className="text-slate-800 dark:text-zinc-200">Semiconductor Application:</strong> {cp.application}
              </p>
              <div className="text-xs font-mono text-rose-600 dark:text-rose-400">
                <strong>Vulnerability:</strong> {cp.monopoly}
              </div>
              <div className="p-2.5 rounded bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/30 text-xs text-slate-700 dark:text-zinc-300">
                <strong className="text-emerald-800 dark:text-emerald-300 block font-mono text-[10px] uppercase font-bold mb-0.5">
                  Domestic Indian Localization Route:
                </strong>
                {cp.indianAlternative}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Margin Benchmarks Across Supply Chain Tiers */}
      <div className="p-6 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sky-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Semiconductor Supply Chain EBITDA & Profitability Benchmarks
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500 dark:text-zinc-400">
            Global Industry Medians
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 font-mono text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Value Chain Segment</th>
                <th className="px-4 py-3">Gross Margin</th>
                <th className="px-4 py-3">Operating Margin (EBIT)</th>
                <th className="px-4 py-3">CapEx Intensity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {marginBenchmarks.map((bm, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{bm.segment}</td>
                  <td className="px-4 py-3 font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{bm.gross}</td>
                  <td className="px-4 py-3 font-mono text-sky-600 dark:text-sky-400 font-semibold">{bm.ebit}</td>
                  <td className="px-4 py-3 font-mono text-amber-600 dark:text-amber-400">{bm.capex}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Central ISM Policy Framework */}
      <div className="p-6 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-emerald-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {nationalOverview.title}
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
            Outlay: {nationalOverview.totalOutlay}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
          {nationalOverview.centralVision}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {centralSchemes.map((cs) => (
            <div key={cs.id} className="p-4 rounded bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-2 text-xs">
              <span className="font-bold text-slate-900 dark:text-white text-sm block">{cs.name}</span>
              <div className="font-mono text-sky-600 dark:text-sky-400 font-semibold">Support: {cs.fiscalSupport}</div>
              <div className="text-slate-600 dark:text-zinc-400">Target Nodes: {cs.targetNodes}</div>
              {cs.eligibility && (
                <div className="text-slate-500 dark:text-zinc-400 text-[11px] pt-1 border-t border-slate-200 dark:border-zinc-800">
                  Eligibility: {cs.eligibility}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
