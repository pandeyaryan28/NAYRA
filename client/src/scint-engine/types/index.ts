// TypeScript Definitions for ChipChain 360 (Semiconductor Intelligence Engine)

export type NavigationSubTab = 'blueprints' | 'explorer' | 'calculator' | 'hubs' | 'intelligence';

export type BlueprintScale = '20k' | '50k';

export type DiligencePillarTab = 
  | 'overview' 
  | 'roadmap' 
  | 'capex' 
  | 'machinery' 
  | 'process' 
  | 'materials' 
  | 'buyers' 
  | 'clearances' 
  | 'future' 
  | 'threats';

export type ExplorerViewMode = 'grid' | 'table' | 'tree';

export interface ProductSpecification {
  chemicalFormula?: string;
  commercialGrade?: string;
  minPurity?: string;
  maxSilica?: string;
  maxCalciumCarbonate?: string;
  maxPhosphorus?: string;
  maxSulfur?: string;
  maxMoisture?: string;
  physicalForm?: string;
  [key: string]: any;
}

export interface BlueprintMetadata {
  id: string;
  title: string;
  subtitle: string;
  tier: number;
  version: string;
  lastUpdated: string;
  productSpecification: ProductSpecification;
  keyMetrics?: {
    puritySpecification?: string;
    modularScaleCapacity?: string;
    commercialScaleCapacity?: string;
    targetMarketShareIndia?: string;
    landRequiredAcres?: string;
    waterRequirementMLD?: string;
    powerRequirementMW?: string;
    employmentDirect?: string;
    primaryIndianClusters?: string;
    rawMaterialFeedstock?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface PhaseMachineryImport {
  name: string;
  origin: string;
  leadTimeMonths?: number | string;
  estimatedCostINR?: number | string;
}

export interface PhaseMachineryDomestic {
  equipmentType: string;
  suggestedVendors: string[];
  estimatedCostINR?: number | string;
}

export interface RoadmapPhase {
  phaseNumber: number;
  phaseName: string;
  durationMonths: string;
  capitalAllocationINR: number | string;
  primaryFocus: string;
  importedMachineryRequired?: PhaseMachineryImport[];
  domesticIndianFabrication?: PhaseMachineryDomestic[];
  rawMaterialsFeedstockProcured?: Array<{ material: string; source: string }>;
  dueDiligenceClearancesMilestone?: Array<{ authority: string; approvalName: string; leadTimeMonths?: number | string }>;
  keyMilestonesToExitPhase: string[];
  [key: string]: any;
}

export interface ScaleCapex {
  scaleName: string;
  annualProductionCapacity: string;
  totalProjectCapexINR: number;
  plantAndMachineryINR: number;
  civilConstructionAndCleanroomINR: number;
  utilitiesWaterPowerEffluentINR: number;
  contingencyAndEscalationINR: number;
  marginMoneyWorkingCapitalINR: number;
  netInvestorOutlayINR: number;
  centralGovernmentSubsidyISM: { percentage: number; amountINR: number; schemeName: string };
  stateGovernmentSubsidy: { percentage: number; amountINR: number; stateName: string };
  debtEquityStructure: { debtINR: number; equityINR: number; debtRatio: string };
  annualRevenueINR: number;
  ebitdaINR: number;
  ebitdaMarginPercentage: number;
  simplePaybackYears: number;
  preTaxIRRPercentage: number;
  [key: string]: any;
}

export interface CapexBreakdown {
  modularPioneerScale: ScaleCapex;
  commercialBenchmarkScale: ScaleCapex;
  [key: string]: any;
}

export interface ImportedMachinery {
  machineName: string;
  functionAndSpec: string;
  recommendedManufacturers: Array<{ name: string; country: string; modelNumber?: string }>;
  estimatedCostINR: number | string;
  leadTimeMonths: number | string;
  cleanroomOrHandlingSpec: string;
  [key: string]: any;
}

export interface DomesticMachinery {
  machineName: string;
  engineeringRole: string;
  suggestedIndianFabricators: string[];
  estimatedCostINR: number | string;
  fabricationLeadTimeMonths: number | string;
  standardOrCodeCompliance: string;
  [key: string]: any;
}

export interface MachineryBreakdown {
  importedHighTech: ImportedMachinery[];
  domesticHeavyEngineering: DomesticMachinery[];
  [key: string]: any;
}

export interface ProcessStep {
  stepNumber: number;
  stepName: string;
  plainEnglishDescription: string;
  chemistryAndPhysics: string;
  input: string;
  output: string;
  keyEquipmentRequired?: string;
  yieldRecoveryRate?: string;
  [key: string]: any;
}

export interface ManufacturingProcess {
  plainEnglishSummary: string;
  steps: ProcessStep[];
  syntheticFsaProcess?: {
    routeTitle?: string;
    explanation?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface SupplierInfo {
  name: string;
  location: string;
  note?: string;
}

export interface RawMaterialItem {
  materialName: string;
  role: string;
  gradeSpec: string;
  consumptionNorm: string;
  estimatedCostPerTonINR?: number | string;
  topSuppliers?: SupplierInfo[];
  availabilityStatus: string;
  [key: string]: any;
}

export interface BuyerItem {
  companyName: string;
  location: string;
  annualDemandEstimatedMT?: string;
  applicationNote?: string;
  [key: string]: any;
}

export interface BuyersAndDemand {
  domesticIndianBuyers: BuyerItem[];
  globalOfftakeBuyers: BuyerItem[];
  [key: string]: any;
}

export interface ClearanceItem {
  clearanceName: string;
  issuingAuthority: string;
  statutoryMandate: string;
  typicalLeadTimeMonths: number | string;
  keyDocumentsAndPrerequisites: string[];
  riskIfDelayed: string;
  [key: string]: any;
}

export interface ThreatItem {
  threatCategory: string;
  riskDescription: string;
  probabilityScore: string;
  impactSeverity: string;
  concreteMitigationStrategy: string;
  [key: string]: any;
}

export interface VentureBlueprint {
  metadata: BlueprintMetadata;
  executiveSummary: {
    plainEnglishContext: string;
    theStrategicProblem: string;
    theSovereignSolution: string;
    importSubstitutionOpportunity: string;
    coreValueProposition: string;
    dualProductionRoutesExplanation?: string;
    [key: string]: any;
  };
  roadmapPhases: RoadmapPhase[];
  capexBreakdown: CapexBreakdown;
  machineryBreakdown: MachineryBreakdown;
  manufacturingProcess: ManufacturingProcess;
  rawMaterialsAndReagents: RawMaterialItem[];
  buyersAndMarketDemand: BuyersAndDemand;
  unitEconomicsAndFinancials: any;
  dueDiligenceAndClearances: ClearanceItem[];
  futureScopeAndExpansion: any;
  threatsAndMitigations: ThreatItem[];
  [key: string]: any;
}

export type SubBreakdownElement = 
  | string 
  | {
      name: string;
      role?: string;
      keyMaterials?: string;
      topGlobalMakers?: string;
      [key: string]: any;
    };

export type ComponentRawMaterial = 
  | string 
  | {
      name: string;
      spec?: string;
      suppliers?: string;
      [key: string]: any;
    };

export interface SupplyChainComponent {
  id: string;
  name: string;
  tier: number;
  tierName?: string;
  category?: string;
  description?: string;
  summary?: string;
  marketSize?: string;
  grossMargin?: string;
  operatingMargin?: string;
  capexIntensity?: string;
  subBreakdown?: SubBreakdownElement[];
  rawMaterials?: ComponentRawMaterial[];
  subBreakdownAnalyses?: any[];
  rawMaterialsAnalyses?: any[];
  rawMaterialsAnalysis?: any[];
  availability?: string;
  margins?: string;
  linkId?: string;
  [key: string]: any;
}

export interface TierMeta {
  tier: number;
  name: string;
  subtitle: string;
  description: string;
  badgeColor: string;
}

export interface SupplyChainData {
  tiersMeta: TierMeta[];
  components: SupplyChainComponent[];
}

export interface LocationHub {
  id: string;
  name: string;
  state: string;
  category: string;
  readinessScore: string;
  overview: string;
  anchorTenants: string[];
  waterInfrastructure: {
    source?: string;
    adequacy?: string;
    effluentHandling?: string;
    [key: string]: any;
  };
  powerInfrastructure: {
    grid?: string;
    reliability?: string;
    tariff?: string;
    [key: string]: any;
  };
  vibrationSeismic: {
    seismicZone?: string;
    vibrationGrade?: string;
    [key: string]: any;
  };
  logisticsConnectivity: {
    airCargo?: string;
    ports?: string;
    expressways?: string;
    highways?: string;
    railways?: string;
    [key: string]: any;
  };
  chemicalEcosystem?: {
    proximity?: string;
    [key: string]: any;
  };
  recommendedComponents: string[];
  [key: string]: any;
}

export interface CentralScheme {
  id: string;
  name: string;
  fiscalSupport: string;
  targetNodes: string;
  eligibility?: string;
  pariPassuRelease?: string;
  impact?: string;
  keyApprovedProjects?: Array<{
    company?: string;
    location?: string;
    investment?: string;
    capacity?: string;
    nodes?: string;
    type?: string;
    [key: string]: any;
  }>;
  [key: string]: any;
}

export interface StatePolicy {
  state: string;
  policyName: string;
  capexSupport: string;
  landSubsidy: string;
  powerSubsidy: string;
  waterSubsidy: string;
  stampDuty: string;
  flagshipHubs: string[];
}

export interface IndiaPolicies {
  nationalOverview: {
    title: string;
    totalOutlay: string;
    nodalAgency: string;
    centralVision: string;
  };
  centralSchemes: CentralScheme[];
  statePolicies: StatePolicy[];
}

export interface CalculatorState {
  nodeId: string;
  stateName: string;
  facilityType: 'silicon-fab' | 'compound-semi' | 'osat' | 'consumables' | 'custom';
  capexINR: number;
  debtPercentage: number;
  annualRevenueMultiplier: number;
  ebitdaMarginPercentage: number;
}
