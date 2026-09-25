import React from 'react';
import { useScintData } from '../../context/ScintDataContext';
import { INDIA_LOCATIONS } from '../../data/india_locations';
import { 
  Building2, 
  MapPin, 
  Droplets, 
  Zap, 
  Activity, 
  Plane, 
  ShieldCheck, 
  Check, 
  Layers 
} from 'lucide-react';

export const HubsMatrixView: React.FC = () => {
  const { activeHubState, setActiveHubState } = useScintData();

  const states = ['all', 'Gujarat', 'Uttar Pradesh', 'Tamil Nadu', 'Karnataka', 'Assam'];

  const filteredHubs = INDIA_LOCATIONS.filter(h => 
    activeHubState === 'all' || h.state.toLowerCase() === activeHubState.toLowerCase()
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider block mb-1">
            Geographic Infrastructure Intelligence
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            India Semiconductor Manufacturing Hubs & Industrial Corridors
          </h2>
          <p className="text-sm text-slate-600 dark:text-zinc-400 mt-1">
            Site diligence assessing Ultra-Pure Water (ASTM D5127 Type E-1), 99.999% power uptime with DVR, VC-E/VC-F vibration isolation, and anchor fab tenants.
          </p>
        </div>
        <span className="text-xs font-mono font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800/50 px-3 py-1.5 rounded-md self-start md:self-auto">
          7 Validated Megasites
        </span>
      </div>

      {/* State Filter Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-medium">
        {states.map((st) => (
          <button
            key={st}
            onClick={() => setActiveHubState(st)}
            className={`px-3 py-1.5 rounded-md transition-all shrink-0 cursor-pointer ${
              activeHubState.toLowerCase() === st.toLowerCase()
                ? 'bg-slate-900 text-white dark:bg-white dark:text-zinc-950 font-bold shadow-2xs'
                : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
            }`}
          >
            {st === 'all' ? 'All Industrial Hubs (7)' : st}
          </button>
        ))}
      </div>

      {/* Hub Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredHubs.map((hub) => (
          <div
            key={hub.id}
            className="p-6 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-4">
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 font-bold">
                      {hub.state}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono">
                      {hub.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {hub.name}
                  </h3>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 uppercase block font-bold">
                    Readiness
                  </span>
                  <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {hub.readinessScore}
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                {hub.overview}
              </p>

              {/* Anchor Tenants */}
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-bold block mb-1.5">
                  Anchor Fab & Packaging Projects:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {hub.anchorTenants.map((tenant, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2.5 py-1 rounded bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 font-medium"
                    >
                      {tenant}
                    </span>
                  ))}
                </div>
              </div>

              {/* Infrastructure Checklist Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Water & UPW */}
                <div className="p-3 rounded bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-bold font-mono text-[11px]">
                    <Droplets className="w-3.5 h-3.5" />
                    <span>Water & ZLD</span>
                  </div>
                  <p className="text-slate-600 dark:text-zinc-400 leading-tight">
                    {hub.waterInfrastructure.adequacy || hub.waterInfrastructure.source}
                  </p>
                </div>

                {/* Power & DVR */}
                <div className="p-3 rounded bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold font-mono text-[11px]">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Power Grid & DVR</span>
                  </div>
                  <p className="text-slate-600 dark:text-zinc-400 leading-tight">
                    {hub.powerInfrastructure.reliability} • {hub.powerInfrastructure.tariff}
                  </p>
                </div>

                {/* Vibration & Seismic */}
                <div className="p-3 rounded bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold font-mono text-[11px]">
                    <Activity className="w-3.5 h-3.5" />
                    <span>Vibration & Seismic</span>
                  </div>
                  <p className="text-slate-600 dark:text-zinc-400 leading-tight">
                    {hub.vibrationSeismic.seismicZone} • {hub.vibrationSeismic.vibrationGrade?.slice(0, 75)}...
                  </p>
                </div>

                {/* Logistics */}
                <div className="p-3 rounded bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-bold font-mono text-[11px]">
                    <Plane className="w-3.5 h-3.5" />
                    <span>Logistics Corridors</span>
                  </div>
                  <p className="text-slate-600 dark:text-zinc-400 leading-tight">
                    {hub.logisticsConnectivity.airCargo || hub.logisticsConnectivity.expressways}
                  </p>
                </div>
              </div>
            </div>

            {/* Recommended Nodes */}
            <div className="pt-3 border-t border-slate-100 dark:border-zinc-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-bold block mb-1">
                Optimized Supply Chain Nodes:
              </span>
              <p className="text-xs text-slate-700 dark:text-zinc-300">
                {hub.recommendedComponents.slice(0, 3).join(' • ')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
