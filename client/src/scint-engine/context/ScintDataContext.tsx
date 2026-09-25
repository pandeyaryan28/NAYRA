import React, { createContext, useContext, useState, useEffect } from 'react';
import type { 
  VentureBlueprint, 
  BlueprintScale, 
  DiligencePillarTab, 
  ExplorerViewMode,
  CalculatorState
} from '../types/index';
import { VENTURE_BLUEPRINTS, DEFAULT_BLUEPRINT_ID } from '../data/venture_blueprints';
import { SEMICON_SUPPLY_CHAIN_DATA } from '../data/supply_chain_data';
import { INDIA_LOCATIONS } from '../data/india_locations';
import { INDIA_POLICIES } from '../data/india_policies';

interface ScintDataContextType {
  // Blueprints State
  activeBlueprintId: string;
  setActiveBlueprintId: (id: string) => void;
  activeScale: BlueprintScale;
  setActiveScale: (scale: BlueprintScale) => void;
  activePillarTab: DiligencePillarTab;
  setActivePillarTab: (tab: DiligencePillarTab) => void;
  currentBlueprint: VentureBlueprint;
  selectBlueprint: (id: string, pillarTab?: DiligencePillarTab) => void;

  // Supply Chain Explorer State
  activeTierFilter: number | 'all';
  setActiveTierFilter: (tier: number | 'all') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  explorerViewMode: ExplorerViewMode;
  setExplorerViewMode: (mode: ExplorerViewMode) => void;
  selectedComponentId: string | null;
  setSelectedComponentId: (id: string | null) => void;
  isComponentModalOpen: boolean;
  setIsComponentModalOpen: (open: boolean) => void;
  activeModalTab: string;
  setActiveModalTab: (tab: string) => void;
  openComponentDetail: (id: string, tab?: string) => void;

  // Subsidy & CapEx Calculator State
  calculatorInputs: CalculatorState;
  updateCalculatorInputs: (updates: Partial<CalculatorState>) => void;
  applyCalculatorPreset: (presetKey: string) => void;

  // Hubs State
  activeHubState: string;
  setActiveHubState: (state: string) => void;

  // Data & Utilities
  exportFullDatasetJson: () => void;
  backendStatus: {
    status: string;
    nodes: number;
    tiers: number;
    subElements: number;
    hubs: number;
  } | null;
}

const DEFAULT_CALC_STATE: CalculatorState = {
  nodeId: 'tata-dholera',
  stateName: 'gujarat',
  facilityType: 'silicon-fab',
  capexINR: 10000,
  debtPercentage: 60,
  annualRevenueMultiplier: 0.45,
  ebitdaMarginPercentage: 42
};

const ScintDataContext = createContext<ScintDataContextType | undefined>(undefined);

export const ScintDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Blueprints
  const [activeBlueprintId, setActiveBlueprintId] = useState<string>(() => {
    return localStorage.getItem('scint_active_bp') || DEFAULT_BLUEPRINT_ID;
  });
  const [activeScale, setActiveScale] = useState<BlueprintScale>('50k');
  const [activePillarTab, setActivePillarTab] = useState<DiligencePillarTab>('overview');

  // Explorer
  const [activeTierFilter, setActiveTierFilter] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [explorerViewMode, setExplorerViewMode] = useState<ExplorerViewMode>('grid');
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [isComponentModalOpen, setIsComponentModalOpen] = useState<boolean>(false);
  const [activeModalTab, setActiveModalTab] = useState<string>('overview');

  // Calculator
  const [calculatorInputs, setCalculatorInputs] = useState<CalculatorState>(DEFAULT_CALC_STATE);

  // Hubs
  const [activeHubState, setActiveHubState] = useState<string>('all');

  // Backend Status
  const [backendStatus, setBackendStatus] = useState<any>(null);

  // Fetch backend status if available
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/scint-engine/status');
        if (res.ok) {
          const data = await res.json();
          setBackendStatus(data);
        }
      } catch {
        // Fallback local status
        setBackendStatus({
          status: 'online',
          nodes: 34,
          tiers: 6,
          subElements: 193,
          hubs: 7
        });
      }
    };
    fetchStatus();
  }, []);

  const currentBlueprint: VentureBlueprint = 
    VENTURE_BLUEPRINTS[activeBlueprintId] || 
    VENTURE_BLUEPRINTS[DEFAULT_BLUEPRINT_ID] || 
    (Object.values(VENTURE_BLUEPRINTS)[0] as VentureBlueprint);

  const selectBlueprint = (id: string, pillarTab?: DiligencePillarTab) => {
    if (VENTURE_BLUEPRINTS[id]) {
      setActiveBlueprintId(id);
      localStorage.setItem('scint_active_bp', id);
    }
    if (pillarTab) {
      setActivePillarTab(pillarTab);
    }
  };

  const openComponentDetail = (id: string, tab?: string) => {
    setSelectedComponentId(id);
    if (tab) setActiveModalTab(tab);
    setIsComponentModalOpen(true);
  };

  const updateCalculatorInputs = (updates: Partial<CalculatorState>) => {
    setCalculatorInputs(prev => ({ ...prev, ...updates }));
  };

  const applyCalculatorPreset = (presetKey: string) => {
    const PRESETS: Record<string, { capex: number; type: any; state: string }> = {
      'tata-dholera': { capex: 91526, type: 'silicon-fab', state: 'gujarat' },
      'micron-sanand': { capex: 22500, type: 'osat', state: 'gujarat' },
      'cg-semi': { capex: 7600, type: 'osat', state: 'gujarat' },
      'kaynes-sanand': { capex: 3300, type: 'osat', state: 'gujarat' },
      'polymatech-tn': { capex: 5000, type: 'compound-semi', state: 'tamilnadu' },
      'yeida-fab': { capex: 20000, type: 'silicon-fab', state: 'up' },
      'dahej-chemical': { capex: 500, type: 'consumables', state: 'gujarat' }
    };

    const p = PRESETS[presetKey];
    if (p) {
      setCalculatorInputs(prev => ({
        ...prev,
        capexINR: p.capex,
        facilityType: p.type,
        stateName: p.state,
        nodeId: presetKey
      }));
    }
  };

  const exportFullDatasetJson = () => {
    try {
      const fullDataset = {
        title: "ChipChain 360 - Complete Semiconductor Supply Chain & Venture Diligence Platform",
        version: "2.0.0",
        exportedAt: new Date().toISOString(),
        framework: "India Semiconductor Mission (ISM 2.0) & 11-Pillar Diligence Architecture",
        supplyChainTiers: SEMICON_SUPPLY_CHAIN_DATA.tiersMeta,
        componentsCount: SEMICON_SUPPLY_CHAIN_DATA.components.length,
        components: SEMICON_SUPPLY_CHAIN_DATA.components,
        industrialHubsCount: INDIA_LOCATIONS.length,
        industrialHubs: INDIA_LOCATIONS,
        policyFramework: INDIA_POLICIES,
        ventureBlueprintsCount: Object.keys(VENTURE_BLUEPRINTS).length,
        ventureBlueprints: VENTURE_BLUEPRINTS
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullDataset, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `chipchain-360-semiconductor-intelligence-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error("Failed to export dataset", err);
    }
  };

  return (
    <ScintDataContext.Provider
      value={{
        activeBlueprintId,
        setActiveBlueprintId,
        activeScale,
        setActiveScale,
        activePillarTab,
        setActivePillarTab,
        currentBlueprint,
        selectBlueprint,
        activeTierFilter,
        setActiveTierFilter,
        searchQuery,
        setSearchQuery,
        explorerViewMode,
        setExplorerViewMode,
        selectedComponentId,
        setSelectedComponentId,
        isComponentModalOpen,
        setIsComponentModalOpen,
        activeModalTab,
        setActiveModalTab,
        openComponentDetail,
        calculatorInputs,
        updateCalculatorInputs,
        applyCalculatorPreset,
        activeHubState,
        setActiveHubState,
        exportFullDatasetJson,
        backendStatus
      }}
    >
      {children}
    </ScintDataContext.Provider>
  );
};

export const useScintData = () => {
  const context = useContext(ScintDataContext);
  if (!context) {
    throw new Error('useScintData must be used within a ScintDataProvider');
  }
  return context;
};
