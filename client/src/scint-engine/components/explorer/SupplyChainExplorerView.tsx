import React from 'react';
import { useScintData } from '../../context/ScintDataContext';
import { SEMICON_SUPPLY_CHAIN_DATA } from '../../data/supply_chain_data';
import type { ExplorerViewMode } from '../../types/index';
import { 
  Search, 
  LayoutGrid, 
  Table as TableIcon, 
  GitBranch, 
  Layers, 
  X, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle,
  Building2,
  TrendingUp,
  Cpu
} from 'lucide-react';

export const SupplyChainExplorerView: React.FC<{ onNavigateToBlueprint?: (nodeId: string) => void }> = ({
  onNavigateToBlueprint
}) => {
  const { 
    activeTierFilter, 
    setActiveTierFilter, 
    searchQuery, 
    setSearchQuery, 
    explorerViewMode, 
    setExplorerViewMode, 
    selectedComponentId, 
    isComponentModalOpen, 
    setIsComponentModalOpen, 
    activeModalTab, 
    setActiveModalTab, 
    openComponentDetail,
    selectBlueprint
  } = useScintData();

  const tiers = SEMICON_SUPPLY_CHAIN_DATA.tiersMeta;
  const components = SEMICON_SUPPLY_CHAIN_DATA.components;

  // Filter components
  const filteredComponents = components.filter(c => {
    const matchesTier = activeTierFilter === 'all' || c.tier === activeTierFilter;
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.category && c.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.summary && c.summary.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTier && matchesSearch;
  });

  const selectedComponent = components.find(c => c.id === selectedComponentId) || null;

  return (
    <div className="space-y-6">
      {/* Search & Tier Filter Bar */}
      <div className="p-4 sm:p-5 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Search components, chemicals, tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-md bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs self-start md:self-auto">
            <button
              onClick={() => setExplorerViewMode('grid')}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                explorerViewMode === 'grid'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setExplorerViewMode('table')}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                explorerViewMode === 'table'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setExplorerViewMode('tree')}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                explorerViewMode === 'tree'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Hierarchy Tree View"
            >
              <GitBranch className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tier Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-medium">
          <button
            onClick={() => setActiveTierFilter('all')}
            className={`px-3 py-1.5 rounded-md transition-all shrink-0 cursor-pointer ${
              activeTierFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-zinc-950 font-bold shadow-2xs'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
            }`}
          >
            All Tiers (34 Nodes)
          </button>
          {tiers.map((t) => (
            <button
              key={t.tier}
              onClick={() => setActiveTierFilter(t.tier)}
              className={`px-3 py-1.5 rounded-md transition-all shrink-0 cursor-pointer ${
                activeTierFilter === t.tier
                  ? 'bg-sky-600 text-white dark:bg-sky-500 dark:text-zinc-950 font-bold shadow-2xs'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
              }`}
            >
              T{t.tier}: {t.name.split(':')[1]?.trim() || t.name}
            </button>
          ))}
        </div>
      </div>

      {/* GRID VIEW */}
      {explorerViewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredComponents.map((c) => {
            const subCount = (c.subBreakdown || []).length;
            const rmCount = (c.rawMaterials || []).length;
            return (
              <div 
                key={c.id}
                className="p-5 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-sky-400 dark:hover:border-sky-500 transition-all flex flex-col justify-between shadow-xs space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 font-semibold">
                      Tier {c.tier}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                      {c.category || 'Semiconductor Component'}
                    </span>
                  </div>

                  <h4 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                    {c.name}
                  </h4>

                  <p className="text-xs text-slate-600 dark:text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                    {c.description || c.summary || 'Critical semiconductor supply chain node.'}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs font-mono text-slate-500 dark:text-zinc-400">
                    <span>{subCount} Sub-elements</span>
                    <span>{rmCount} Raw Materials</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                  <button
                    onClick={() => openComponentDetail(c.id, 'overview')}
                    className="flex-1 px-3 py-1.5 rounded text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 transition-colors text-center cursor-pointer"
                  >
                    View Dossier
                  </button>
                  <button
                    onClick={() => {
                      selectBlueprint(c.id);
                      if (onNavigateToBlueprint) {
                        onNavigateToBlueprint(c.id);
                      }
                    }}
                    className="px-3 py-1.5 rounded text-xs font-medium bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/50 dark:hover:bg-sky-900/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/40 transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Open Full 11-Pillar Blueprint"
                  >
                    <span>Blueprint</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TABLE VIEW */}
      {explorerViewMode === 'table' && (
        <div className="bg-white dark:bg-zinc-900 rounded-md border border-slate-200 dark:border-zinc-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 font-mono text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Tier</th>
                  <th className="px-4 py-3">Component / Node</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Gross Margin</th>
                  <th className="px-4 py-3">Sovereign Availability</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {filteredComponents.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-sky-600 dark:text-sky-400">
                      T{c.tier}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                      {c.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-zinc-400">
                      {c.category || 'Process Node'}
                    </td>
                    <td className="px-4 py-3 font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                      {c.grossMargin || c.margins?.split('|')[0]?.trim() || '35% - 48%'}
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-zinc-400 truncate max-w-xs">
                      {c.availability || 'Import Dependent'}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => openComponentDetail(c.id)}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-medium cursor-pointer"
                      >
                        Dossier
                      </button>
                      <button
                        onClick={() => {
                          selectBlueprint(c.id);
                          if (onNavigateToBlueprint) onNavigateToBlueprint(c.id);
                        }}
                        className="px-2.5 py-1 rounded bg-sky-600 hover:bg-sky-700 text-white font-medium cursor-pointer"
                      >
                        Blueprint
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* HIERARCHY TREE VIEW */}
      {explorerViewMode === 'tree' && (
        <div className="space-y-6">
          {tiers.map((tier) => {
            const tierComponents = components.filter(c => c.tier === tier.tier);
            if (activeTierFilter !== 'all' && activeTierFilter !== tier.tier) return null;

            return (
              <div key={tier.tier} className="p-6 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 font-bold uppercase">
                      Tier {tier.tier} Hierarchy
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                      {tier.name}
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono">
                    {tierComponents.length} Strategic Nodes
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {tierComponents.map((c) => (
                    <div
                      key={c.id}
                      className="p-3.5 rounded bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="truncate">
                        <span className="font-bold text-slate-900 dark:text-white block truncate">
                          {c.name}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400 block truncate">
                          {c.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => openComponentDetail(c.id)}
                          className="px-2 py-1 rounded bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 font-medium cursor-pointer"
                        >
                          Info
                        </button>
                        <button
                          onClick={() => {
                            selectBlueprint(c.id);
                            if (onNavigateToBlueprint) onNavigateToBlueprint(c.id);
                          }}
                          className="px-2 py-1 rounded bg-sky-600 text-white font-medium cursor-pointer"
                        >
                          Plan
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* COMPONENT DOSSIER MODAL */}
      {isComponentModalOpen && selectedComponent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[85vh] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-4 bg-slate-50/50 dark:bg-zinc-950/50">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 font-bold">
                    Tier {selectedComponent.tier} Dossier
                  </span>
                  <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono">
                    {selectedComponent.category}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedComponent.name}
                </h3>
              </div>
              <button
                onClick={() => setIsComponentModalOpen(false)}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-200 dark:border-zinc-800 text-xs font-semibold overflow-x-auto no-scrollbar">
              {['overview', 'subbreakdown', 'rawmaterials', 'margins'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveModalTab(tab)}
                  className={`px-3 py-2 border-b-2 transition-all cursor-pointer capitalize ${
                    activeModalTab === tab
                      ? 'border-sky-600 text-sky-600 dark:border-sky-400 dark:text-sky-400'
                      : 'border-transparent text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab === 'subbreakdown' ? 'Sub-Breakdown' : tab === 'rawmaterials' ? 'Raw Materials' : tab}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              {activeModalTab === 'overview' && (
                <div className="space-y-4">
                  <p className="text-sm leading-relaxed text-slate-700 dark:text-zinc-300">
                    {selectedComponent.description || selectedComponent.summary}
                  </p>
                  <div className="p-4 rounded bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-2">
                    <span className="font-bold text-slate-900 dark:text-white block font-mono uppercase text-[10px]">
                      Sovereign Import Status & Monopolies:
                    </span>
                    <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                      {selectedComponent.availability || 'Critical import dependency requiring immediate domestic substitution.'}
                    </p>
                  </div>
                </div>
              )}

              {activeModalTab === 'subbreakdown' && (
                <div className="space-y-3">
                  {(selectedComponent.subBreakdown || []).map((sub: any, idx: number) => {
                    const isStr = typeof sub === 'string';
                    return (
                      <div key={idx} className="p-3.5 rounded bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-1">
                        <span className="font-bold text-slate-900 dark:text-white text-sm block">
                          {isStr ? sub.split('-')[0].trim() : sub.name}
                        </span>
                        <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                          {isStr ? sub : (sub.role || sub.description)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeModalTab === 'rawmaterials' && (
                <div className="space-y-3">
                  {(selectedComponent.rawMaterials || []).map((rm: any, idx: number) => {
                    const isStr = typeof rm === 'string';
                    return (
                      <div key={idx} className="p-3.5 rounded bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-1">
                        <span className="font-bold text-slate-900 dark:text-white text-sm block">
                          {isStr ? rm : rm.name}
                        </span>
                        {!isStr && rm.spec && (
                          <div className="font-mono text-slate-500 dark:text-zinc-400">Spec: {rm.spec}</div>
                        )}
                        {!isStr && rm.suppliers && (
                          <div className="font-mono text-emerald-600 dark:text-emerald-400">Suppliers: {rm.suppliers}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {activeModalTab === 'margins' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 font-mono">
                    <div className="p-3 rounded bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                      <span className="text-slate-400 dark:text-zinc-500 block text-[10px] uppercase font-bold">Gross Margin</span>
                      <span className="font-bold text-base text-emerald-600 dark:text-emerald-400 mt-1 block">
                        {selectedComponent.grossMargin || '38% - 50%'}
                      </span>
                    </div>
                    <div className="p-3 rounded bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                      <span className="text-slate-400 dark:text-zinc-500 block text-[10px] uppercase font-bold">Operating Margin</span>
                      <span className="font-bold text-base text-sky-600 dark:text-sky-400 mt-1 block">
                        {selectedComponent.operatingMargin || '22% - 30%'}
                      </span>
                    </div>
                  </div>
                  {selectedComponent.margins && (
                    <div className="p-3 rounded bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 font-mono text-slate-700 dark:text-zinc-300">
                      {selectedComponent.margins}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-zinc-950/50">
              <button
                onClick={() => setIsComponentModalOpen(false)}
                className="px-4 py-2 rounded-md border border-slate-300 dark:border-zinc-700 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  selectBlueprint(selectedComponent.id);
                  setIsComponentModalOpen(false);
                  if (onNavigateToBlueprint) {
                    onNavigateToBlueprint(selectedComponent.id);
                  }
                }}
                className="px-4 py-2 rounded-md bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <span>Open Full 11-Pillar Blueprint</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
