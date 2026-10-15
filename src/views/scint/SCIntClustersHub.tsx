import React, { useState } from 'react';
import { MapPin, Building, Droplets, Zap, Plane, CheckCircle2 } from 'lucide-react';
import { SCINT_CLUSTERS } from '@/data/scintData';
import { SCIntCluster } from '@/types';
import { Badge } from '@/components/common/Badge';

export const SCIntClustersHub: React.FC = () => {
  const [selectedClusterId, setSelectedClusterId] = useState<string>(SCINT_CLUSTERS[0].id);

  const selectedCluster = SCINT_CLUSTERS.find((c) => c.id === selectedClusterId) || SCINT_CLUSTERS[0];

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline">National Infrastructure Feasibility</Badge>
          <span className="text-xs text-zinc-400 font-mono">7 Sovereign Manufacturing Corridors</span>
        </div>
        <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
          India's Emerging Semiconductor Industrial Footprint
        </h2>
        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-3xl">
          Detailed infrastructure feasibility assessments covering Ultra-Pure Water (UPW), dual 220kV power grids, seismic/vibration isolation, and cargo logistics across India's top 7 fab and OSAT corridors.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Corridor Selection Cards */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold block">
            Select Industrial Manufacturing Hub
          </span>

          <div className="space-y-2">
            {SCINT_CLUSTERS.map((cluster) => {
              const isSelected = selectedClusterId === cluster.id;
              return (
                <div
                  key={cluster.id}
                  onClick={() => setSelectedClusterId(cluster.id)}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-400 dark:border-sky-500 shadow-sm'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400">
                        <MapPin className="w-3.5 h-3.5 text-sky-500" />
                        <span>{cluster.state}</span>
                      </div>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {cluster.name}
                      </h4>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        {cluster.readinessScore}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 line-clamp-1">
                    {cluster.category}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deep Infrastructure Dossier */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-6 shadow-sm">
            {/* Header */}
            <div className="space-y-2 border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-sky-600 dark:text-sky-400 font-semibold">
                  {selectedCluster.state} Sovereign Hub
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  Readiness: <strong>{selectedCluster.readinessScore}</strong>
                </span>
              </div>

              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {selectedCluster.name}
              </h3>

              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {selectedCluster.overview}
              </p>
            </div>

            {/* Anchor Tenants */}
            {selectedCluster.anchorTenants.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-mono uppercase text-zinc-400 font-bold tracking-wider">
                  Anchor Fab & OSAT Tenants
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {selectedCluster.anchorTenants.map((tenant) => (
                    <div
                      key={tenant}
                      className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 flex items-center gap-2 text-xs"
                    >
                      <Building className="w-4 h-4 text-sky-500 flex-shrink-0" />
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">{tenant}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Infrastructure Pillars */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-mono uppercase text-zinc-400 font-bold tracking-wider">
                Mission-Critical Infrastructure Specifications
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-zinc-100">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    <span>Water & UPW Reliability</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    {selectedCluster.waterInfrastructure.adequacy}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-zinc-100">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>Power Grid & Voltage Sags</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    {selectedCluster.powerInfrastructure.reliability} ({selectedCluster.powerInfrastructure.tariff})
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 space-y-1 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-zinc-100">
                  <Plane className="w-4 h-4 text-emerald-500" />
                  <span>Logistics & Multi-Modal Connectivity</span>
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Air Cargo: {selectedCluster.logisticsConnectivity.airCargo} • Ports: {selectedCluster.logisticsConnectivity.ports}
                </p>
              </div>
            </div>

            {/* Recommended Supply Chain Nodes */}
            {selectedCluster.recommendedComponents.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <h4 className="text-xs font-mono uppercase text-zinc-400 font-bold tracking-wider">
                  Recommended Supply Chain Anchor Ventures
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCluster.recommendedComponents.map((comp) => (
                    <span
                      key={comp}
                      className="px-2.5 py-1 rounded-md text-xs font-medium border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                    >
                      {comp}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
