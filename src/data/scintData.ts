import { SCIntNodeBlueprint, SCIntTier, SCIntCluster, SCIntStatePolicy, SovereignSectorMeta } from '@/types';

export interface SCIntTierMeta {
  tier: SCIntTier;
  title: string;
  tagline: string;
  count: number;
  strategicRole: string;
}

export interface SCIntIndustryPreset {
  id: string;
  name: string;
  defaultCapexINR: number;
  centralSubsidyPercent: number;
  categoryLabel: string;
  description: string;
}

export const SOVEREIGN_SECTORS: SovereignSectorMeta[] = [
  {
    id: 'semiconductor',
    name: 'Semiconductors & Microelectronics',
    shortName: 'Semiconductors',
    tagline: 'From raw mined quartz to 300mm fabs and 3D chiplet packaging',
    status: 'live',
    stageCount: 6,
    nodeCount: 34,
  },
  {
    id: 'solar',
    name: 'Solar Photovoltaics & Clean Tech',
    shortName: 'Solar PV',
    tagline: 'Polysilicon ingots, TOPCon/HJT solar cells, and high-efficiency modules',
    status: 'coming-soon',
    stageCount: 4,
    nodeCount: 16,
  },
  {
    id: 'batteries',
    name: 'Advanced Battery Storage (Lithium & Sodium)',
    shortName: 'Battery Storage',
    tagline: 'Cathode/anode precursors, solid-state electrolytes, and cell gigafactories',
    status: 'coming-soon',
    stageCount: 4,
    nodeCount: 18,
  },
  {
    id: 'minerals',
    name: 'Critical Minerals & Strategic Metallurgy',
    shortName: 'Critical Minerals',
    tagline: 'Lithium, rare earths, titanium, gallium, and deep refining beneficiation',
    status: 'coming-soon',
    stageCount: 4,
    nodeCount: 20,
  },
];

export const SCINT_TIERS: SCIntTierMeta[] = [
  {
    "tier": 0,
    "title": "Stage 00: Raw Earth & Mined Minerals",
    "tagline": "Quartz Rock, Fluorspar, Gallium, Germanium, Electronic Copper",
    "count": 6,
    "strategicRole": "Digging up the natural rocks, sand, and minerals from the ground that provide the raw ingredients for all computer chips."
  },
  {
    "tier": 1,
    "title": "Stage 01: Ultra-Pure Chemicals & Gases",
    "tagline": "Hyper-Pure Silicon 99.9999999%, Clean Acids, Laser Gases",
    "count": 3,
    "strategicRole": "Purifying raw rocks and chemicals into liquids and gases that are 99.9999999% pure, removing every single microscopic speck of dust."
  },
  {
    "tier": 2,
    "title": "Stage 02: Silicon Wafers & Discs",
    "tagline": "Mirror-Smooth 300mm Silicon Plates, Silicon Carbide Wafers",
    "count": 5,
    "strategicRole": "Melting pure silicon crystals into giant logs and slicing them into paper-thin, mirror-smooth round plates ready for circuit printing."
  },
  {
    "tier": 3,
    "title": "Stage 03: Chip Factories (Cleanroom Fabs)",
    "tagline": "Computer Logic Fabs, Power Chips, Transistor Cleanrooms",
    "count": 8,
    "strategicRole": "Spotless cleanroom factories where laser stencils print billions of microscopic electrical switches (transistors) onto the silicon plates."
  },
  {
    "tier": 4,
    "title": "Stage 04: Chip Packaging & Testing (ATMP)",
    "tagline": "Protective Black Casings, Golden Connector Wires, Metal Pins",
    "count": 7,
    "strategicRole": "Cutting the plates into tiny individual chips, attaching microscopic connector legs, sealing them in protective black casings, and testing each one."
  },
  {
    "tier": 5,
    "title": "Stage 05: Finished Circuit Boards & Devices",
    "tagline": "AI Supercomputers, Electric Car Controllers, Telecom Systems",
    "count": 5,
    "strategicRole": "Soldering the finished microchips onto green circuit boards to power electric cars, smartphones, smart grids, and AI data centers."
  }
];

export const SCINT_VENTURE_BLUEPRINTS: SCIntNodeBlueprint[] = [
  {
    "id": "acid-grade-fluorspar",
    "nodeNumber": 1,
    "name": "Acid-Grade Fluorspar (Fluorite / CaF2)",
    "tier": 0,
    "tierName": "Tier 0: Mined Raw Minerals & Foundational Commodities",
    "category": "Mined Raw Mineral",
    "description": "A natural white rock mined from the earth that is used to make ultra-pure acid. Chip factories need this acid to clean and etch microscopic circuits into silicon. Without it, no chip factory can operate. India currently imports almost all of it from abroad, making a local processing plant a guaranteed supplier to upcoming Indian chip factories.",
    "marketSize": "$2.4 Billion",
    "grossMargin": "28% - 38%",
    "operatingMargin": "16% - 24%",
    "capexModularINR": 200,
    "capexBenchmarkINR": 600,
    "modularCapacityLabel": "Modular Pioneer Scale",
    "commercialCapacityLabel": "Commercial Benchmark Scale",
    "subsidyPercentageISM": 50,
    "subsidyPercentageSPECS": 20,
    "targetClusters": [
      "Kadipani / Chhota Udepur & Dahej, Gujarat",
      "Kachchh, Gujarat"
    ],
    "keyMachinery": [
      "Ball Mills",
      "Flotation Column Cells",
      "Disc Filters",
      "Flash Dryers"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "Raw Fluorite Ore (CaF2 30-60% mined grade)",
      "Concentrated Sulfuric Acid (98% H2SO4)",
      "Froth Flotation Reagents (Fatty acid collectors, sodium silicate depressants)",
      "Heavy Fuel Oil / Natural Gas for rotary kilns"
    ],
    "offtakeBuyers": [
      "Stella Chemifa & Morita Chemical",
      "Resonac, Kanto Denka, SK Materials",
      "Solvay, Chemours, Arkema",
      "Gujarat Fluorochemicals (GFL)"
    ],
    "topSuppliers": [
      "Chinese Mining Enterprises (China Kings, etc.)",
      "Orbia / Mexichem (Las Cuevas Mine)",
      "Minersa",
      "Sallies / Vergenoeg Mining"
    ],
    "ebitdaMarginExpected": "28% - 38%",
    "paybackPeriodYears": 3.2,
    "techReadinessLevel": 8,
    "sovereignMoat": "Essential mineral required by 100% of semiconductor factories. High profit margins with zero domestic competition.",
    "clearances": [
      "MoEFCC Environmental Clearance (Category A - Mining & Mineral Beneficiation)",
      "State PCB Consent to Establish (CTE) & Consent to Operate (CTO)",
      "Forest Clearance Stage-I & Stage-II (FCA Clearance)",
      "MMDR Mining Concession / GMDC Long-Term Offtake Joint Venture"
    ]
  },
  {
    "id": "compound-semi-precursor-minerals",
    "nodeNumber": 2,
    "name": "Compound Semiconductor Precursors (Gallium, Germanium & Indium)",
    "tier": 0,
    "tierName": "Tier 0: Mined Raw Minerals & Foundational Commodities",
    "category": "Critical Minerals",
    "description": "Rare metals extracted as natural byproducts from aluminum and zinc mining. These special metals are essential for super-fast chips used in 5G cell towers, radar systems, and electric cars. Setting up a local refining unit lets India capture high-value export and domestic demand with up to 70% government subsidies.",
    "marketSize": "$1.4 Billion (Strategic value far exceeds dollar size)",
    "grossMargin": "35% - 50%",
    "operatingMargin": "20% - 32%",
    "capexModularINR": 200,
    "capexBenchmarkINR": 600,
    "modularCapacityLabel": "Modular Pioneer Scale",
    "commercialCapacityLabel": "Commercial Benchmark Scale",
    "subsidyPercentageISM": 50,
    "subsidyPercentageSPECS": 20,
    "targetClusters": [
      "Renukoot, Uttar Pradesh",
      "Chanderiya / Debari, Rajasthan"
    ],
    "keyMachinery": [
      "Ball Mills",
      "Flotation Column Cells",
      "Disc Filters",
      "Flash Dryers"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "Alumina Refinery Bayer Process Recycled Liquor",
      "Zinc Smelter Hydrometallurgical Residues",
      "Hydrochloric Acid (Electronic Grade)",
      "Specialty Chelating Ion-Exchange Resins",
      "Zone Refining Inert Vacuum Chambers"
    ],
    "offtakeBuyers": [
      "Freiberger Compound Materials & Sumitomo Electric",
      "Wolfspeed, Coherent, STMicro",
      "IQE plc",
      "Indian Compound Semi Fabs (Crystal Matrix, Zoho)"
    ],
    "topSuppliers": [
      "Chinese State Refiners (Chinalco, Zhuzhou Keneng)",
      "5N Plus",
      "Dowa Holdings",
      "Indium Corporation"
    ],
    "ebitdaMarginExpected": "35% - 50%",
    "paybackPeriodYears": 3.2,
    "techReadinessLevel": 8,
    "sovereignMoat": "Critical national security minerals with high global scarcity. India already mines the raw ore locally.",
    "clearances": [
      "Environmental Clearance (Category B - Mineral Processing & Byproduct Recovery)",
      "Consent to Establish (CTE) & Consent to Operate (CTO)",
      "Host Alumina Refinery / Smelter Lease Agreement",
      "Hydrogen Storage & PESO License"
    ]
  },
  {
    "id": "high-purity-copper-cathode",
    "nodeNumber": 3,
    "name": "High-Purity Electronic Copper Cathode & Smelted Rods (Cu 6N)",
    "tier": 0,
    "tierName": "Tier 0: Mined Raw Minerals & Foundational Commodities",
    "category": "Refined Pure Metal",
    "description": "Copper purified to 99.9999% purity—less than one contaminated atom in a million. Used to create the tiny microscopic electrical wires and pins inside every microchip. India has huge copper smelters, making this a natural high-margin upgrade to serve local electronics manufacturing plants.",
    "marketSize": "$18.5 Billion (Total high-grade electronics copper)",
    "grossMargin": "Commodity Cathode: 8% - 14% | 6N Electronic Copper: 30% - 42%",
    "operatingMargin": "Cathode: 5% - 8% | 6N: 18% - 25%",
    "capexModularINR": 200,
    "capexBenchmarkINR": 600,
    "modularCapacityLabel": "Modular Pioneer Scale",
    "commercialCapacityLabel": "Commercial Benchmark Scale",
    "subsidyPercentageISM": 50,
    "subsidyPercentageSPECS": 20,
    "targetClusters": [
      "Mundra Port / Kachchh, Gujarat",
      "Dahej, Gujarat"
    ],
    "keyMachinery": [
      "Ball Mills",
      "Flotation Column Cells",
      "Disc Filters",
      "Flash Dryers"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "Copper Sulfide Concentrates (Chile, Peru, Indonesia, Australia)",
      "Silica Flux (SiO2) for Smelter Slagging",
      "Concentrated Sulfuric Acid & Copper Sulfate Electrolyte",
      "High-Vacuum Induction Furnaces"
    ],
    "offtakeBuyers": [
      "Unimicron, Ibiden, Nan Ya",
      "Mitsui High-tec & CWTC",
      "Heraeus & Tanaka",
      "TSMC & Intel"
    ],
    "topSuppliers": [
      "JX Metals (Nippon Mining)",
      "Aurubis AG",
      "Freeport-McMoRan",
      "BHP & Codelco",
      "Adani Kutch Copper & Hindalco"
    ],
    "ebitdaMarginExpected": "Commodity Cathode: 8% - 14%",
    "paybackPeriodYears": 3.2,
    "techReadinessLevel": 8,
    "sovereignMoat": "Basic electrical highway for every microchip and circuit board, replacing expensive Japanese and German imports.",
    "clearances": [
      "Environmental Clearance (Category B/A - Secondary Metallurgy)",
      "Consent to Establish (CTE) & Consent to Operate (CTO)",
      "GIDC Land Allotment & Infrastructure Hookup",
      "Factory License & Structural Safety Approval"
    ]
  },
  {
    "id": "high-purity-quartzite",
    "nodeNumber": 4,
    "name": "High-Purity Quartzite & Silica Sand (SiO2)",
    "tier": 0,
    "tierName": "Tier 0: Mined Raw Minerals & Foundational Commodities",
    "category": "Mined Raw Mineral",
    "description": "Super-clean white quartz rocks and silica sand. This is the starting raw material melted down to make all silicon computer chips and the ultra-heat-resistant glass melting pots used in chip factories.",
    "marketSize": "$1.8 Billion (High-purity electronic quartz segment)",
    "grossMargin": "Mining HPQ: 45% - 60% | MGS Smelting: 15% - 22%",
    "operatingMargin": "Mining: 30% - 42% | MGS: 7% - 12%",
    "capexModularINR": 200,
    "capexBenchmarkINR": 600,
    "modularCapacityLabel": "Modular Pioneer Scale",
    "commercialCapacityLabel": "Commercial Benchmark Scale",
    "subsidyPercentageISM": 50,
    "subsidyPercentageSPECS": 20,
    "targetClusters": [
      "Bhilwara / Ajmer Quartz Belt, Rajasthan",
      "Angul / Jharsuguda, Odisha"
    ],
    "keyMachinery": [
      "Ball Mills",
      "Flotation Column Cells",
      "Disc Filters",
      "Flash Dryers"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "Natural Quartzite Rock / Vein Quartz (SiO2 >99.5%)",
      "Low-Ash Bituminous Coal & Metallurgical Coke",
      "Hardwood Charcoal & Wood Chips",
      "Hydrofluoric Acid (for chemical leaching of quartz sand)"
    ],
    "offtakeBuyers": [
      "Wacker Chemie, Hemlock, Tokuyama",
      "Heraeus, Tosoh Quartz, Momentive",
      "Shin-Etsu Handotai & SUMCO"
    ],
    "topSuppliers": [
      "Sibelco (Spruce Pine Mine)",
      "The Quartz Corp (TQC)",
      "Ferroglobe",
      "Elkem ASA",
      "Chinese Smelters (Hoshine, etc.)"
    ],
    "ebitdaMarginExpected": "Mining HPQ: 45% - 60%",
    "paybackPeriodYears": 3.2,
    "techReadinessLevel": 8,
    "sovereignMoat": "The fundamental starting rock for all computing hardware. High domestic geological reserves across India.",
    "clearances": [
      "Environmental Clearance (Category A - Mineral Beneficiation)",
      "Consent to Establish (CTE) & Consent to Operate (CTO)",
      "Industrial Land Allotment & Possession",
      "Hazardous Chemical Storage & PESO License"
    ]
  },
  {
    "id": "petrochemical-epoxies-and-polymers",
    "nodeNumber": 5,
    "name": "Petrochemical Novolac Resins & Ajinomoto Functional Polymers",
    "tier": 0,
    "tierName": "Tier 0: Mined Raw Minerals & Foundational Commodities",
    "category": "Protective Polymers",
    "description": "Special industrial plastics and glues that seal computer chips and protect them from moisture, heat, and physical drops. Without these protective resins, bare silicon chips would break the moment they are installed in a car or phone.",
    "marketSize": "$4.1 Billion",
    "grossMargin": "Standard Epoxy: 15% - 22% | Ajinomoto ABF Resin: 55% - 65%",
    "operatingMargin": "Standard: 8% - 14% | Ajinomoto: 35% - 42%",
    "capexModularINR": 200,
    "capexBenchmarkINR": 600,
    "modularCapacityLabel": "Modular Pioneer Scale",
    "commercialCapacityLabel": "Commercial Benchmark Scale",
    "subsidyPercentageISM": 50,
    "subsidyPercentageSPECS": 20,
    "targetClusters": [
      "Dahej PCPIR / Hazira, Gujarat",
      "Cuddalore / Manali, Tamil Nadu"
    ],
    "keyMachinery": [
      "Ball Mills",
      "Flotation Column Cells",
      "Disc Filters",
      "Flash Dryers"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "Propylene & Benzene Fractions",
      "Epichlorohydrin (ECH)",
      "Ortho-Cresol & Formaldehyde",
      "Bisphenol-A (BPA)",
      "High-Purity Inert Nitrogen"
    ],
    "offtakeBuyers": [
      "Sumitomo Bakelite & Resonac",
      "Unimicron, Ibiden, Nan Ya",
      "Henkel Adhesive Technologies"
    ],
    "topSuppliers": [
      "Ajinomoto Fine-Techno",
      "Mitsubishi Gas Chemical",
      "DIC Corporation",
      "Resonac & Nippon Steel Chemical",
      "Chang Chun Plastics"
    ],
    "ebitdaMarginExpected": "Standard Epoxy: 15% - 22%",
    "paybackPeriodYears": 3.2,
    "techReadinessLevel": 8,
    "sovereignMoat": "High-tech chemical formulation with captive domestic electronics buyers.",
    "clearances": [
      "Environmental Clearance (Category A - Synthetic Organic Chemicals)",
      "Consent to Establish (CTE) & Consent to Operate (CTO)",
      "PESO Hazardous Chemical Storage & Solvent Handling License",
      "Industrial Development Corporation Land Possession"
    ]
  },
  {
    "id": "refractory-critical-metals",
    "nodeNumber": 6,
    "name": "Refractory Critical Metals (Tungsten, Tantalum, Cobalt, Titanium)",
    "tier": 0,
    "tierName": "Tier 0: Mined Raw Minerals & Foundational Commodities",
    "category": "Refined Pure Metal",
    "description": "Super-strong metals with ultra-high melting points. Inside a computer chip, these metals form tiny microscopic electrical highways and barrier walls that stop circuits from shorting out under intense heat.",
    "marketSize": "$5.6 Billion (Semiconductor segment)",
    "grossMargin": "22% - 35%",
    "operatingMargin": "12% - 20%",
    "capexModularINR": 200,
    "capexBenchmarkINR": 600,
    "modularCapacityLabel": "Modular Pioneer Scale",
    "commercialCapacityLabel": "Commercial Benchmark Scale",
    "subsidyPercentageISM": 50,
    "subsidyPercentageSPECS": 20,
    "targetClusters": [
      "Degana / Nagaur & Udaipur, Rajasthan",
      "Mundra / Dahej, Gujarat"
    ],
    "keyMachinery": [
      "Ball Mills",
      "Flotation Column Cells",
      "Disc Filters",
      "Flash Dryers"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "Wolframite / Scheelite Concentrates",
      "Columbite-Tantalite (Coltan) Ores",
      "Hydrofluoric & Sulfuric Acids (for Tantalum digestion)",
      "Methyl Isobutyl Ketone (MIBK) Solvent",
      "Electron-Beam Cold-Hearth Refining Furnaces"
    ],
    "offtakeBuyers": [
      "Entegris & SK Materials",
      "JX Metals & Honeywell",
      "TSMC, Intel, Samsung"
    ],
    "topSuppliers": [
      "China State Mining (Chinatungsten, etc.)",
      "DRC Mining Enterprises",
      "Global Advanced Metals (GAM)",
      "H.C. Starck / Masan High-Tech",
      "Glencore plc"
    ],
    "ebitdaMarginExpected": "22% - 35%",
    "paybackPeriodYears": 3.2,
    "techReadinessLevel": 8,
    "sovereignMoat": "Indispensable atomic barrier metals that prevent computer chips from burning out.",
    "clearances": [
      "Environmental Clearance (Category A - Metallurgical & Chemical Processing)",
      "Consent to Establish (CTE) & Consent to Operate (CTO)",
      "Atomic Energy Regulatory Board (AERB) Monazite / Coltan License",
      "PESO Hydrogen Manifold & Cryogenic Storage License"
    ]
  },
  {
    "id": "electronic-grade-polysilicon",
    "nodeNumber": 7,
    "name": "Electronic Grade Polysilicon (EG-Si 11N Purity: 99.999999999%)",
    "tier": 1,
    "tierName": "Tier 1: Refined Chemical Intermediates & Purified Specialty Gases",
    "category": "Purified Raw Silicon",
    "description": "The purest substance created by humans—less than one bad atom in ten billion. Raw quartz is melted and refined into these hyper-pure silicon chunks, which are then sliced to make all computer chips on earth.",
    "marketSize": "$3.2 Billion (Semiconductor grade only; excludes solar poly)",
    "grossMargin": "28% - 42%",
    "operatingMargin": "16% - 28%",
    "capexModularINR": 200,
    "capexBenchmarkINR": 600,
    "modularCapacityLabel": "Modular Pioneer Scale",
    "commercialCapacityLabel": "Commercial Benchmark Scale",
    "subsidyPercentageISM": 50,
    "subsidyPercentageSPECS": 20,
    "targetClusters": [
      "Mundra / Kutch, Gujarat",
      "Dahej PCPIR, Gujarat"
    ],
    "keyMachinery": [
      "Direct Chlorination Reactors",
      "Fractional Distillation Columns",
      "Decomposition Chambers"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "Metallurgical Grade Silicon (MGS 99% pure)",
      "Anhydrous Hydrogen Chloride (HCl Gas)",
      "High-Purity Hydrogen Gas (H2 99.9999%)",
      "Liquid Chlorine (Cl2)",
      "Massive Electrical Power Grid (~80,000 kWh per metric ton)"
    ],
    "offtakeBuyers": [
      "Shin-Etsu Handotai",
      "SUMCO Corporation",
      "GlobalWafers",
      "Siltronic AG",
      "SK Siltron"
    ],
    "topSuppliers": [
      "Wacker Chemie AG",
      "Hemlock Semiconductor (Corning)",
      "Tokuyama Corporation",
      "OCI Company",
      "REC Silicon"
    ],
    "ebitdaMarginExpected": "28% - 42%",
    "paybackPeriodYears": 3.2,
    "techReadinessLevel": 8,
    "sovereignMoat": "The fundamental pure silicon material required before any wafer or chip can be produced.",
    "clearances": [
      "Environmental Clearance (Category A - Chemical & Metallurgical Complex)",
      "Consent to Establish (CTE) & Consent to Operate (CTO)",
      "PESO Hydrogen & Chlorosilane Storage License",
      "Industrial Development Corporation Land Allotment"
    ]
  },
  {
    "id": "specialty-rare-noble-gases",
    "nodeNumber": 8,
    "name": "Specialty Rare & Noble Gases (Neon, Krypton, Xenon, Helium)",
    "tier": 1,
    "tierName": "Tier 1: Refined Chemical Intermediates & Purified Specialty Gases",
    "category": "Ultra-Clean Industrial Gases",
    "description": "Special noble gases that never catch fire or react with other chemicals. Used to power precision cutting lasers and keep microchip manufacturing chambers completely sterile and dust-free.",
    "marketSize": "$2.8 Billion (Volatile based on geopolitical shocks)",
    "grossMargin": "35% - 65% (Can spike above 80% during global supply squeezes)",
    "operatingMargin": "22% - 40%",
    "capexModularINR": 200,
    "capexBenchmarkINR": 600,
    "modularCapacityLabel": "Modular Pioneer Scale",
    "commercialCapacityLabel": "Commercial Benchmark Scale",
    "subsidyPercentageISM": 50,
    "subsidyPercentageSPECS": 20,
    "targetClusters": [
      "Rourkela / Kalinganagar / Jamshedpur Steel Corridor (Odisha & Jharkhand)",
      "Dholera SIR / Sanand, Gujarat"
    ],
    "keyMachinery": [
      "Direct Chlorination Reactors",
      "Fractional Distillation Columns",
      "Decomposition Chambers"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "Atmospheric Air (Processed through 50,000+ Nm3/hr Steel Mill ASUs)",
      "Crude Neon-Helium Gas Concentrate",
      "Helium-bearing Natural Gas Wells (Qatar, US, Algeria)",
      "Cryogenic Liquid Nitrogen Refrigeration",
      "Ultra-High Vacuum Dual-Valved Cylinders"
    ],
    "offtakeBuyers": [
      "ASML, Cymer & Gigaphoton",
      "TSMC, Intel, Samsung",
      "Micron & SK Hynix",
      "Tata Electronics Dholera"
    ],
    "topSuppliers": [
      "Linde plc",
      "Air Liquide",
      "Air Products & Chemicals",
      "Messer Group",
      "Chinese ASU Operators"
    ],
    "ebitdaMarginExpected": "35% - 65% (Can spike above 80% during global supply squeezes)",
    "paybackPeriodYears": 3.2,
    "techReadinessLevel": 8,
    "sovereignMoat": "Critical supply chain bottleneck for chip-printing lasers, traditionally dependent on volatile imports.",
    "clearances": [
      "Environmental Clearance (Category B - Industrial Gases & Cryogenics)",
      "Consent to Establish (CTE) & Consent to Operate (CTO)",
      "PESO High-Pressure Gas Cylinder Filling & Storage License",
      "Host Steel Mill Co-Location & Off-Take Concession Agreement"
    ]
  },
  {
    "id": "synthetic-fused-silica-quartz",
    "nodeNumber": 9,
    "name": "Synthetic Fused Silica Quartz (Ingots, Tubes & Crucibles)",
    "tier": 1,
    "tierName": "Tier 1: Refined Chemical Intermediates & Purified Specialty Gases",
    "category": "High-Temp Glass Ware",
    "description": "Special glass melting pots and tubes that can survive temperatures hotter than volcanic lava (over 1,400°C) without melting or contaminating pure molten silicon.",
    "marketSize": "$2.6 Billion",
    "grossMargin": "32% - 42%",
    "operatingMargin": "18% - 25%",
    "capexModularINR": 200,
    "capexBenchmarkINR": 600,
    "modularCapacityLabel": "Modular Pioneer Scale",
    "commercialCapacityLabel": "Commercial Benchmark Scale",
    "subsidyPercentageISM": 50,
    "subsidyPercentageSPECS": 20,
    "targetClusters": [
      "Sanand / Dholera, Gujarat",
      "Dahej PCPIR, Gujarat"
    ],
    "keyMachinery": [
      "Direct Chlorination Reactors",
      "Fractional Distillation Columns",
      "Decomposition Chambers"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "Silicon Tetrachloride (SiCl4) High-Purity Liquid",
      "High-Purity Natural Quartz Sand (Spruce Pine IOTA standard)",
      "Industrial Hydrogen and Oxygen Gases",
      "Hydrofluoric & Nitric Acids for Quartz Etch Cleaning"
    ],
    "offtakeBuyers": [
      "Shin-Etsu Handotai, SUMCO, GlobalWafers",
      "Tokyo Electron & Applied Materials",
      "Hoya & AGC",
      "Tata Electronics Dholera"
    ],
    "topSuppliers": [
      "Heraeus Quarzglas",
      "Tosoh Quartz",
      "Shin-Etsu Quartz",
      "Momentive Technologies"
    ],
    "ebitdaMarginExpected": "32% - 42%",
    "paybackPeriodYears": 3.2,
    "techReadinessLevel": 8,
    "sovereignMoat": "Consumable glass crucibles that must be replaced regularly by wafer manufacturing plants.",
    "clearances": [
      "Environmental Clearance (Category B - Glass & Ceramic Manufacturing)",
      "Consent to Establish (CTE) & Consent to Operate (CTO)",
      "High-Voltage Power Connection & Substation Sanction (15 MVA)",
      "Industrial Land Allotment"
    ]
  },
  {
    "id": "cleanroom-upw-infrastructure",
    "nodeNumber": 10,
    "name": "Ultra-Pure Water (UPW) Systems & Fab Cleanrooms",
    "tier": 2,
    "tierName": "Tier 2: Capital Equipment & Cleanroom Infrastructure",
    "category": "Factory Utilities & Cleanrooms",
    "description": "Giant water purification systems that produce water a billion times cleaner than tap water, alongside dust-free cleanrooms where air has less than one speck of dust in an entire room.",
    "marketSize": "$12.5 Billion (UPW Plants: ~$3.5B | Cleanrooms: ~$9B)",
    "grossMargin": "24% - 34%",
    "operatingMargin": "10% - 16%",
    "capexModularINR": 200,
    "capexBenchmarkINR": 600,
    "modularCapacityLabel": "Modular Pioneer Scale",
    "commercialCapacityLabel": "Commercial Benchmark Scale",
    "subsidyPercentageISM": 50,
    "subsidyPercentageSPECS": 20,
    "targetClusters": [
      "Dholera SIR, Gujarat",
      "Sanand GIDC, Gujarat"
    ],
    "keyMachinery": [
      "Czochralski Crystal Pullers",
      "Diamond Wire Saws",
      "Chemical Mechanical Planarization (CMP)"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "PVDF (Polyvinylidene Fluoride) High-Purity Piping & Valves",
      "High-Flux Polyamide Reverse Osmosis (RO) Membranes",
      "185nm & 254nm Ultraviolet Quartz Lamps",
      "Nuclear-Grade Ion Exchange Resins",
      "ULPA (Ultra-Low Particulate Air) Borosilicate Glass Fiber Filter Media"
    ],
    "offtakeBuyers": [
      "Tata Electronics Dholera",
      "Micron Sanand",
      "TSMC, Samsung, Intel"
    ],
    "topSuppliers": [
      "Kurita Water Industries",
      "Organo Corporation",
      "Veolia Water Technologies",
      "Ovivo",
      "Exyte"
    ],
    "ebitdaMarginExpected": "24% - 34%",
    "paybackPeriodYears": 4.2,
    "techReadinessLevel": 8,
    "sovereignMoat": "Mandatory utility system without which no semiconductor cleanroom can turn on for a single minute.",
    "clearances": [
      "Environmental Clearance (Category B - Industrial Infrastructure & Water Treatment)",
      "Consent to Establish (CTE) & Consent to Operate (CTO)",
      "Central Ground Water Authority (CGWA) NOC / Canal Allocation",
      "Industrial Single Window Clearance & Dholera DICDL Allotment"
    ]
  },
  {
    "id": "etch-deposition-chambers",
    "nodeNumber": 11,
    "name": "Etch, ALD & CVD Process Equipment (Lam, TEL, AMAT)",
    "tier": 2,
    "tierName": "Tier 2: Capital Equipment & Cleanroom Infrastructure",
    "category": "Cleanroom Machinery",
    "description": "Room-sized robotic machines that spray microscopic metallic layers onto wafers and carve vertical circuit grooves that are thousands of times thinner than a human hair.",
    "marketSize": "$52 Billion (Deposition: ~$28B | Etch: ~$24B)",
    "grossMargin": "46% - 50%",
    "operatingMargin": "28% - 33%",
    "capexModularINR": 200,
    "capexBenchmarkINR": 600,
    "modularCapacityLabel": "Modular Pioneer Scale",
    "commercialCapacityLabel": "Commercial Benchmark Scale",
    "subsidyPercentageISM": 50,
    "subsidyPercentageSPECS": 20,
    "targetClusters": [
      "Dholera SIR, Gujarat",
      "Bengaluru, Karnataka"
    ],
    "keyMachinery": [
      "Czochralski Crystal Pullers",
      "Diamond Wire Saws",
      "Chemical Mechanical Planarization (CMP)"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "High-Vacuum Chamber Aluminum (6061-T6 with specialized anodization)",
      "High-Purity Quartz & Silicon Carbide Plasma Rings",
      "Yttrium Oxide (Y2O3) Plasma-Resistant Ceramic Coatings",
      "Turbo-Molecular Vacuum Pumps (Edwards, Pfeiffer)",
      "Mass Flow Controllers (Horiba, Brooks Instrument)"
    ],
    "offtakeBuyers": [
      "TSMC",
      "Samsung Electronics",
      "Intel",
      "Micron & SK Hynix",
      "Tata Electronics Dholera"
    ],
    "topSuppliers": [
      "Applied Materials (AMAT)",
      "Lam Research",
      "Tokyo Electron (TEL)",
      "ASM International",
      "Kokusai Electric"
    ],
    "ebitdaMarginExpected": "46% - 50%",
    "paybackPeriodYears": 4.2,
    "techReadinessLevel": 8,
    "sovereignMoat": "Core manufacturing workhorse machines for etching microscopic nanometer circuits.",
    "clearances": [
      "Environmental Clearance (Category B - Electronics Machinery Manufacturing)",
      "Consent to Establish (CTE) & Consent to Operate (CTO)",
      "PESO Specialty Toxic & Fluorinated Gas Storage License",
      "KIADB Industrial Land Allotment"
    ]
  },
  {
    "id": "ion-implantation-systems",
    "nodeNumber": 12,
    "name": "Ion Implantation Equipment",
    "tier": 2,
    "tierName": "Tier 2: Capital Equipment & Cleanroom Infrastructure",
    "category": "Cleanroom Machinery",
    "description": "Miniature particle accelerators that shoot electrical atoms deep into silicon plates. This gives silicon its magical ability to turn electricity on and off like a computer switch.",
    "marketSize": "$3.2 Billion",
    "grossMargin": "43% - 47%",
    "operatingMargin": "21% - 26%",
    "capexModularINR": 200,
    "capexBenchmarkINR": 600,
    "modularCapacityLabel": "Modular Pioneer Scale",
    "commercialCapacityLabel": "Commercial Benchmark Scale",
    "subsidyPercentageISM": 50,
    "subsidyPercentageSPECS": 20,
    "targetClusters": [
      "Dholera SIR, Gujarat",
      "Sriperumbudur, Tamil Nadu"
    ],
    "keyMachinery": [
      "Czochralski Crystal Pullers",
      "Diamond Wire Saws",
      "Chemical Mechanical Planarization (CMP)"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "Sub-Atmospheric SDS Cylinders (AsH3, PH3, BF3, GeF4)",
      "High-Purity Tungsten & Molybdenum Arc Chamber Parts",
      "Superconducting or Rare-Earth Analyzing Magnets",
      "High-Voltage Ceramic Insulators (Alumina Al2O3)",
      "Cryogenic Vacuum Pumps"
    ],
    "offtakeBuyers": [
      "TSMC & Samsung",
      "Wolfspeed, STMicro, Onsemi",
      "Tata Electronics Dholera"
    ],
    "topSuppliers": [
      "Applied Materials (Varian)",
      "Axcelis Technologies",
      "Sumitomo Heavy Industries Ion Technology"
    ],
    "ebitdaMarginExpected": "43% - 47%",
    "paybackPeriodYears": 4.2,
    "techReadinessLevel": 8,
    "sovereignMoat": "Essential machinery that gives raw silicon its electronic computing properties.",
    "clearances": [
      "Atomic Energy Regulatory Board (AERB) Particle Accelerator License",
      "Environmental Clearance (Category B - Electronics Capital Goods)",
      "PESO Toxic Gas & SF6 Insulating Gas Storage License",
      "TSIIC Industrial Land Allotment"
    ]
  },
  {
    "id": "metrology-and-wafer-inspection",
    "nodeNumber": 13,
    "name": "Metrology & Wafer Defect Inspection Equipment",
    "tier": 2,
    "tierName": "Tier 2: Capital Equipment & Cleanroom Infrastructure",
    "category": "Testing & Laser Scanners",
    "description": "Super-fast laser cameras that scan billions of microscopic circuits in seconds to catch nanometer-sized errors before an entire batch of expensive chips is ruined.",
    "marketSize": "$14.5 Billion",
    "grossMargin": "60% - 63% (KLA Corporation - Industry Record)",
    "operatingMargin": "38% - 42%",
    "capexModularINR": 200,
    "capexBenchmarkINR": 600,
    "modularCapacityLabel": "Modular Pioneer Scale",
    "commercialCapacityLabel": "Commercial Benchmark Scale",
    "subsidyPercentageISM": 50,
    "subsidyPercentageSPECS": 20,
    "targetClusters": [
      "Dholera SIR, Gujarat",
      "Chennai, Tamil Nadu / Bengaluru, Karnataka"
    ],
    "keyMachinery": [
      "Czochralski Crystal Pullers",
      "Diamond Wire Saws",
      "Chemical Mechanical Planarization (CMP)"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "Laser-Pumped Xenon Plasma Light Sources (Energetiq)",
      "Ultra-Flat Fused Silica Objective Optics",
      "Time Delay and Integration (TDI) High-Speed CCD/CMOS Sensors",
      "Schottky Field Emission Electron Sources",
      "Interferometric Laser Positioning Stages"
    ],
    "offtakeBuyers": [
      "TSMC",
      "Samsung Electronics",
      "Intel",
      "Tata Electronics Dholera"
    ],
    "topSuppliers": [
      "KLA Corporation",
      "Applied Materials (AMAT)",
      "Hitachi High-Tech",
      "ASML (Hermes Microvision - HMI)",
      "Nova Ltd & Onto Innovation"
    ],
    "ebitdaMarginExpected": "60% - 63% (KLA Corporation - Industry Record)",
    "paybackPeriodYears": 4.2,
    "techReadinessLevel": 8,
    "sovereignMoat": "Saves factories hundreds of millions of dollars by catching defective chips early.",
    "clearances": [
      "Environmental Clearance (Category B - Electronics Assembly)",
      "Consent to Establish (CTE) & Consent to Operate (CTO)",
      "Atomic Energy Regulatory Board (AERB) Low-Energy X-Ray / SEM NOC",
      "KIADB Industrial Land Allotment"
    ]
  },
  {
    "id": "photolithography-scanners",
    "nodeNumber": 14,
    "name": "Photolithography Systems (EUV & DUV Steppers/Scanners)",
    "tier": 2,
    "tierName": "Tier 2: Capital Equipment & Cleanroom Infrastructure",
    "category": "Chip-Printing Machines",
    "description": "The most advanced printing presses on earth. They use ultra-violet light lasers to print billions of microscopic electrical switches onto silicon plates using optical stencils.",
    "marketSize": "$28 Billion (ASML alone represents ~$23B)",
    "grossMargin": "51% - 53% (ASML) | Canon/Nikon: 38% - 45%",
    "operatingMargin": "31% - 35%",
    "capexModularINR": 200,
    "capexBenchmarkINR": 600,
    "modularCapacityLabel": "Modular Pioneer Scale",
    "commercialCapacityLabel": "Commercial Benchmark Scale",
    "subsidyPercentageISM": 50,
    "subsidyPercentageSPECS": 20,
    "targetClusters": [
      "Dholera SIR, Gujarat",
      "SCL Mohali, Punjab"
    ],
    "keyMachinery": [
      "Czochralski Crystal Pullers",
      "Diamond Wire Saws",
      "Chemical Mechanical Planarization (CMP)"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "Carl Zeiss Mo/Si Ultra-Smooth Extreme UV Mirrors",
      "TRUMPF / Cymer High-Power 30kW Pulsed CO2 Lasers",
      "High-Purity Molten Tin (Sn 99.999%)",
      "Synthetic Fused Silica & Calcium Fluoride (CaF2) Optical Glass",
      "Ultra-High Vacuum (UHV) Turbomolecular Pumps"
    ],
    "offtakeBuyers": [
      "TSMC",
      "Samsung Electronics",
      "Intel",
      "SK Hynix & Micron",
      "Tata Electronics Dholera"
    ],
    "topSuppliers": [
      "ASML Holding",
      "Nikon Corporation",
      "Canon Inc."
    ],
    "ebitdaMarginExpected": "51% - 53% (ASML)",
    "paybackPeriodYears": 4.2,
    "techReadinessLevel": 8,
    "sovereignMoat": "The most strategically protected machinery in modern geopolitics and manufacturing.",
    "clearances": [
      "Atomic Energy Regulatory Board (AERB) High-Power Laser License",
      "Environmental Clearance (Category B - Electronics Assembly)",
      "Consent to Establish (CTE) & Consent to Operate (CTO)",
      "PESO Fluorine Laser Gas Storage Approval"
    ]
  },
  {
    "id": "ald-cvd-precursors",
    "nodeNumber": 15,
    "name": "Atomic Layer Deposition (ALD) & CVD Precursors",
    "tier": 3,
    "tierName": "Tier 3: Front-End Silicon Die Fabrication Materials",
    "category": "Chemical Coating Sprays",
    "description": "Liquid chemicals vaporized into gas clouds inside vacuum chambers to coat silicon chips with atomic layers of insulating and conducting materials.",
    "marketSize": "$3.9 Billion",
    "grossMargin": "45% - 60%",
    "operatingMargin": "25% - 35%",
    "capexModularINR": 200,
    "capexBenchmarkINR": 600,
    "modularCapacityLabel": "Modular Pioneer Scale",
    "commercialCapacityLabel": "Commercial Benchmark Scale",
    "subsidyPercentageISM": 50,
    "subsidyPercentageSPECS": 20,
    "targetClusters": [
      "Dahej PCPIR, Gujarat",
      "Dholera SIR, Gujarat"
    ],
    "keyMachinery": [
      "DUV/EUV Photolithography Scanners",
      "Plasma Etchers",
      "Ion Implantation Tools",
      "Diffusion Furnaces"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "Hafnium Tetrachloride (HfCl4)",
      "Tungsten Concentrates & Fluorine Gas",
      "Silicon Tetrachloride (SiCl4)",
      "Trialkylaluminum & Metal Chlorides",
      "Electropolished Stainless Steel 316L Ampoules"
    ],
    "offtakeBuyers": [
      "TSMC",
      "Samsung & SK Hynix",
      "Intel",
      "Tata Electronics Dholera"
    ],
    "topSuppliers": [
      "Entegris",
      "Merck KGaA (EMD Electronics)",
      "Air Liquide Electronics (Adeka JV)",
      "SK Materials",
      "SoulBrain"
    ],
    "ebitdaMarginExpected": "45% - 60%",
    "paybackPeriodYears": 5.8,
    "techReadinessLevel": 9,
    "sovereignMoat": "High-margin chemical vapor coatings required for modern nanometer-scale chips.",
    "clearances": [
      "Environmental Clearance (Category A - Organometallic Chemical Synthesis)",
      "Consent to Establish & Operate (CTE/CTO)",
      "PESO Pyrophoric Substance & High-Pressure Vessel License",
      "DISH Factory License & Major Accident Hazard (MAH) Clearance"
    ]
  },
  {
    "id": "bare-silicon-wafer",
    "nodeNumber": 16,
    "name": "Bare Monocrystalline Silicon Wafers (300mm & 200mm Prime)",
    "tier": 3,
    "tierName": "Tier 3: Front-End Silicon Die Fabrication Materials",
    "category": "Silicon Wafers & Plates",
    "description": "Shiny, mirror-smooth round plates made of pure crystallized silicon. These round plates serve as the blank digital canvas where chip factories print thousands of chips.",
    "marketSize": "$14.2 Billion",
    "grossMargin": "30% - 40%",
    "operatingMargin": "20% - 30%",
    "capexModularINR": 200,
    "capexBenchmarkINR": 600,
    "modularCapacityLabel": "Modular Pioneer Scale",
    "commercialCapacityLabel": "Commercial Benchmark Scale",
    "subsidyPercentageISM": 50,
    "subsidyPercentageSPECS": 20,
    "targetClusters": [
      "Dholera SIR (Semicon City), Gujarat",
      "Jewar / YEIDA Corridor, Uttar Pradesh"
    ],
    "keyMachinery": [
      "DUV/EUV Photolithography Scanners",
      "Plasma Etchers",
      "Ion Implantation Tools",
      "Diffusion Furnaces"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "11N Electronic-Grade Polysilicon (EG-Si)",
      "Ultra-High Purity Synthetic Fused Quartz Crucibles",
      "High-purity Graphite Heaters & Thermal Shields",
      "Diamond Plated Slicing Wire",
      "CMP Slurry & Polyurethane Polishing Pads"
    ],
    "offtakeBuyers": [
      "TSMC",
      "Samsung Electronics",
      "Intel",
      "Micron & SK Hynix",
      "Tata Electronics Dholera"
    ],
    "topSuppliers": [
      "Shin-Etsu Handotai (SEH)",
      "SUMCO Corporation",
      "GlobalWafers",
      "Siltronic AG",
      "SK Siltron"
    ],
    "ebitdaMarginExpected": "30% - 40%",
    "paybackPeriodYears": 5.8,
    "techReadinessLevel": 9,
    "sovereignMoat": "The blank canvas for all semiconductor chips; required by every fab in India and globally.",
    "clearances": [
      "Environmental Clearance (Category A - Semiconductor Wafer Complex)",
      "Consent to Establish (CTE) & Consent to Operate (CTO)",
      "PESO Cryogenic Argon & Nitrogen Storage License",
      "Factory License & High-Temperature Induction Furnace Approval"
    ]
  },
  {
    "id": "cmp-slurries-and-polishing-pads",
    "nodeNumber": 17,
    "name": "Chemical Mechanical Planarization (CMP) Slurries & Pads",
    "tier": 3,
    "tierName": "Tier 3: Front-End Silicon Die Fabrication Materials",
    "category": "Polishing Liquids & Pads",
    "description": "Microscopic liquid sandpaper and soft rotating pads used to buff silicon wafers completely flat after each layer of electrical circuits is etched.",
    "marketSize": "$3.8 Billion",
    "grossMargin": "Slurries: 45% - 55% | Pads: 55% - 65% (DuPont)",
    "operatingMargin": "24% - 35%",
    "capexModularINR": 200,
    "capexBenchmarkINR": 600,
    "modularCapacityLabel": "Modular Pioneer Scale",
    "commercialCapacityLabel": "Commercial Benchmark Scale",
    "subsidyPercentageISM": 50,
    "subsidyPercentageSPECS": 20,
    "targetClusters": [
      "Sanand GIDC / Dholera SIR, Gujarat",
      "Sriperumbudur, Tamil Nadu"
    ],
    "keyMachinery": [
      "DUV/EUV Photolithography Scanners",
      "Plasma Etchers",
      "Ion Implantation Tools",
      "Diffusion Furnaces"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "Colloidal Silica Nanoparticles (High-purity aqueous sol)",
      "Rare Earth Cerium Oxide (CeO2) Powder",
      "Prepolymer Isocyanates & Polyols (for polyurethane pads)",
      "High-Purity Hydrogen Peroxide (H2O2 31%)",
      "Corrosion Inhibitors (Benzotriazole BTA)"
    ],
    "offtakeBuyers": [
      "TSMC",
      "Intel",
      "Samsung Electronics",
      "Micron & SK Hynix",
      "Tata Electronics Dholera"
    ],
    "topSuppliers": [
      "Entegris (formerly Cabot Microelectronics)",
      "DuPont Electronic Solutions",
      "Resonac (formerly Showa Denko)",
      "Fujimi Incorporated",
      "Merck KGaA (Versum Materials)"
    ],
    "ebitdaMarginExpected": "Slurries: 45% - 55%",
    "paybackPeriodYears": 5.8,
    "techReadinessLevel": 9,
    "sovereignMoat": "Consumable polishing chemical that factories must repurchase every week of production.",
    "clearances": [
      "Environmental Clearance (Category A - Chemical Blending & Polymer Processing)",
      "Consent to Establish & Operate (CTE/CTO)",
      "PESO Chemical Storage License (Isocyanates & Flammable Solvents)",
      "DISH Factory License & Cleanroom Workplace Safety Review"
    ]
  },
  {
    "id": "dry-etch-specialty-gases",
    "nodeNumber": 18,
    "name": "Dry Etch & Chamber Cleaning Specialty Gases (NF3, SF6, CF4, C4F8, Cl2)",
    "tier": 3,
    "tierName": "Tier 3: Front-End Silicon Die Fabrication Materials",
    "category": "Ultra-Clean Industrial Gases",
    "description": "Special gases electrified into glowing plasma inside vacuum chambers to carve microscopic trenches into silicon and blast clean the machinery.",
    "marketSize": "$4.8 Billion",
    "grossMargin": "32% - 44%",
    "operatingMargin": "18% - 28%",
    "capexModularINR": 200,
    "capexBenchmarkINR": 600,
    "modularCapacityLabel": "Modular Pioneer Scale",
    "commercialCapacityLabel": "Commercial Benchmark Scale",
    "subsidyPercentageISM": 50,
    "subsidyPercentageSPECS": 20,
    "targetClusters": [
      "Dholera SIR (Onsite Gas Park), Gujarat",
      "Dahej PCPIR, Gujarat"
    ],
    "keyMachinery": [
      "DUV/EUV Photolithography Scanners",
      "Plasma Etchers",
      "Ion Implantation Tools",
      "Diffusion Furnaces"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "Anhydrous Hydrogen Fluoride (AHF)",
      "Anhydrous Ammonia (NH3)",
      "High-Purity Chlorine Gas (Cl2)",
      "Sulfur & Methane Precursors",
      "Electropolished Stainless Steel / Hastelloy Cylinders"
    ],
    "offtakeBuyers": [
      "Samsung Electronics",
      "TSMC",
      "Micron & SK Hynix",
      "Intel",
      "Tata Electronics Dholera"
    ],
    "topSuppliers": [
      "SK Materials",
      "Resonac (formerly Showa Denko)",
      "Air Liquide",
      "Linde Electronics",
      "Kanto Denka Kogyo"
    ],
    "ebitdaMarginExpected": "32% - 44%",
    "paybackPeriodYears": 5.8,
    "techReadinessLevel": 9,
    "sovereignMoat": "Continuous consumable gases needed for etching and chamber cleanliness.",
    "clearances": [
      "Environmental Clearance (Category A - Specialty Toxic & Hazardous Gases)",
      "Consent to Establish & Operate (CTE/CTO)",
      "PESO Gas Cylinder Filling & High-Pressure Storage License",
      "DISH Factory License & Major Accident Hazard (MAH) Compliance"
    ]
  },
  {
    "id": "photolithography-photoresists",
    "nodeNumber": 19,
    "name": "Photolithography Photoresists (EUV, ArFi, KrF & i-Line)",
    "tier": 3,
    "tierName": "Tier 3: Front-End Silicon Die Fabrication Materials",
    "category": "Light-Sensitive Printing Paint",
    "description": "Light-sensitive chemical paint spread onto silicon wafers. When laser light shines on it through a stencil, it hardens to print the circuit pattern—just like developing a photograph.",
    "marketSize": "$3.5 Billion (Advanced EUV/ArFi growing at 12% CAGR)",
    "grossMargin": "45% - 58%",
    "operatingMargin": "25% - 35%",
    "capexModularINR": 200,
    "capexBenchmarkINR": 600,
    "modularCapacityLabel": "Modular Pioneer Scale",
    "commercialCapacityLabel": "Commercial Benchmark Scale",
    "subsidyPercentageISM": 50,
    "subsidyPercentageSPECS": 20,
    "targetClusters": [
      "Dahej PCPIR, Gujarat",
      "Cuddalore PCPIR, Tamil Nadu"
    ],
    "keyMachinery": [
      "DUV/EUV Photolithography Scanners",
      "Plasma Etchers",
      "Ion Implantation Tools",
      "Diffusion Furnaces"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "Purified Specialty Acrylic & Norbornene Monomers",
      "Onium Salt Precursors (Photoacid Generators)",
      "Ultra-High Purity Electronic Solvents (PGMEA < 0.1 ppb metal trace)",
      "Organic Amine Quenchers",
      "Liquid Nitrogen for Temperature Control"
    ],
    "offtakeBuyers": [
      "TSMC",
      "Samsung Electronics",
      "Intel",
      "Micron & SK Hynix",
      "Tata Electronics Dholera"
    ],
    "topSuppliers": [
      "Tokyo Ohka Kogyo (TOK)",
      "JSR Corporation",
      "Shin-Etsu Chemical",
      "Sumitomo Chemical",
      "DuPont (Inpria)"
    ],
    "ebitdaMarginExpected": "45% - 58%",
    "paybackPeriodYears": 5.8,
    "techReadinessLevel": 9,
    "sovereignMoat": "High-margin chemical technology with virtually zero domestic competition in India.",
    "clearances": [
      "Environmental Clearance (Category A - Synthetic Organic Chemicals)",
      "Consent to Establish & Operate (CTE/CTO)",
      "PESO Flammable Solvent Storage & Dispense License",
      "DISH Factory License & Chemical Process Safety Review"
    ]
  },
  {
    "id": "photomasks-and-reticles",
    "nodeNumber": 20,
    "name": "Photomasks & Reticles",
    "tier": 3,
    "tierName": "Tier 3: Front-End Silicon Die Fabrication Materials",
    "category": "Master Circuit Stencils",
    "description": "Ultra-precise glass stencils containing the master blueprint of the microchip. Laser light shines through this stencil to shrink and print circuits onto silicon.",
    "marketSize": "$5.8 Billion",
    "grossMargin": "38% - 48%",
    "operatingMargin": "22% - 30%",
    "capexModularINR": 200,
    "capexBenchmarkINR": 600,
    "modularCapacityLabel": "Modular Pioneer Scale",
    "commercialCapacityLabel": "Commercial Benchmark Scale",
    "subsidyPercentageISM": 50,
    "subsidyPercentageSPECS": 20,
    "targetClusters": [
      "Dholera SIR, Gujarat",
      "Mohali, Punjab / Bengaluru, Karnataka"
    ],
    "keyMachinery": [
      "DUV/EUV Photolithography Scanners",
      "Plasma Etchers",
      "Ion Implantation Tools",
      "Diffusion Furnaces"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "Synthetic Fused Silica Quartz Blanks (Hoya, AGC, Shin-Etsu)",
      "Chromium Sputtering Targets & Molybdenum Silicide Targets",
      "High-Resolution Electron Beam Resists (FEP, ZEP)",
      "Carbon Nanotube (CNT) Pellicles",
      "Chlorine & Oxygen High-Purity Etch Gases"
    ],
    "offtakeBuyers": [
      "Foundries (TSMC, GlobalFoundries, UMC, PSMC)",
      "IDMs (TI, Infineon, NXP, STMicro)",
      "Tata Electronics Dholera"
    ],
    "topSuppliers": [
      "Captive Mask Shops (TSMC, Intel, Samsung)",
      "Dai Nippon Printing (DNP)",
      "Toppan Photomask",
      "Photronics",
      "Hoya Corporation & AGC Inc."
    ],
    "ebitdaMarginExpected": "38% - 48%",
    "paybackPeriodYears": 5.8,
    "techReadinessLevel": 9,
    "sovereignMoat": "Every new chip design requires a custom set of master stencils, creating recurring revenue.",
    "clearances": [
      "Environmental Clearance (Category A - Precision Micro-Fabrication)",
      "Consent to Establish & Operate (CTE/CTO)",
      "PESO Toxic Etch Gas Storage License (Chlorine & SF6)",
      "DISH Factory License & Cleanroom High-Voltage Safety Review"
    ]
  },
  {
    "id": "pvd-sputtering-targets",
    "nodeNumber": 21,
    "name": "PVD Sputtering Targets (Copper, Tantalum, Titanium, Tungsten)",
    "tier": 3,
    "tierName": "Tier 3: Front-End Silicon Die Fabrication Materials",
    "category": "Metal Spray Discs",
    "description": "Solid metal discs made of pure copper, gold, or titanium. Electrified gas knocks atoms off these discs like pool balls, spraying a shiny metallic coat of wiring onto the wafer.",
    "marketSize": "$3.4 Billion",
    "grossMargin": "35% - 48%",
    "operatingMargin": "20% - 28%",
    "capexModularINR": 200,
    "capexBenchmarkINR": 600,
    "modularCapacityLabel": "Modular Pioneer Scale",
    "commercialCapacityLabel": "Commercial Benchmark Scale",
    "subsidyPercentageISM": 50,
    "subsidyPercentageSPECS": 20,
    "targetClusters": [
      "Mundra / Sanand, Gujarat",
      "Sriperumbudur, Tamil Nadu"
    ],
    "keyMachinery": [
      "DUV/EUV Photolithography Scanners",
      "Plasma Etchers",
      "Ion Implantation Tools",
      "Diffusion Furnaces"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "99.99% Grade A Copper Cathodes",
      "Refined Tantalum Metal Powder / K-Salt",
      "High-Purity Titanium Sponge (Kroll process)",
      "Tungsten Concentrate / Ammonium Paratungstate (APT)",
      "Oxygen-Free High-Conductivity (OFHC) Copper Backing Plates"
    ],
    "offtakeBuyers": [
      "TSMC",
      "Intel",
      "Samsung Electronics",
      "GlobalFoundries & UMC",
      "Tata Electronics Dholera"
    ],
    "topSuppliers": [
      "JX Nippon Mining & Metals",
      "Honeywell Electronic Materials",
      "Materion Corporation",
      "Tosoh SMD",
      "KFMI (Konfoong Materials)"
    ],
    "ebitdaMarginExpected": "35% - 48%",
    "paybackPeriodYears": 5.8,
    "techReadinessLevel": 9,
    "sovereignMoat": "High-purity consumable metal discs with constant demand from fabrication cleanrooms.",
    "clearances": [
      "Environmental Clearance (Category A - Metallurgical Smelting & Refining)",
      "Consent to Establish & Operate (CTE/CTO)",
      "PESO High-Pressure Vessel License (Argon HIP Chamber)",
      "DISH Factory License & Heavy Metallurgical Workplace Safety Review"
    ]
  },
  {
    "id": "ultra-pure-wet-cleaning-acids",
    "nodeNumber": 22,
    "name": "Ultra-High Purity Wet Cleaning Acids & Bases (UP-HF, H2SO4, H2O2, IPA)",
    "tier": 3,
    "tierName": "Tier 3: Front-End Silicon Die Fabrication Materials",
    "category": "Cleaning & Washing Acids",
    "description": "Hyper-pure liquid chemical baths used to wash and scrub silicon wafers after every manufacturing step so no dirt or oil ruins the circuits.",
    "marketSize": "$5.2 Billion",
    "grossMargin": "28% - 40%",
    "operatingMargin": "15% - 24%",
    "capexModularINR": 200,
    "capexBenchmarkINR": 600,
    "modularCapacityLabel": "Modular Pioneer Scale",
    "commercialCapacityLabel": "Commercial Benchmark Scale",
    "subsidyPercentageISM": 50,
    "subsidyPercentageSPECS": 20,
    "targetClusters": [
      "Dahej PCPIR, Gujarat",
      "Cuddalore / Ennore, Tamil Nadu"
    ],
    "keyMachinery": [
      "DUV/EUV Photolithography Scanners",
      "Plasma Etchers",
      "Ion Implantation Tools",
      "Diffusion Furnaces"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "Acid-Grade Fluorspar (CaF2 >97% purity)",
      "Industrial Grade Sulfuric Acid (98% H2SO4)",
      "Propylene & Pure Acetone (for UP-IPA synthesis)",
      "Electronic Grade Anhydrous Ammonia Gas",
      "ASTM D5127 Type E-1 Ultra-Pure Water"
    ],
    "offtakeBuyers": [
      "TSMC",
      "Samsung Electronics",
      "Intel",
      "Micron & SK Hynix",
      "Tata Electronics Dholera"
    ],
    "topSuppliers": [
      "Stella Chemifa Corporation",
      "Morita Chemical Industries",
      "Solvay",
      "Formosa Plastics & Chang Chun",
      "BASF Electronic Materials"
    ],
    "ebitdaMarginExpected": "28% - 40%",
    "paybackPeriodYears": 5.8,
    "techReadinessLevel": 9,
    "sovereignMoat": "Massive volume consumable chemical required around the clock by every chip fab.",
    "clearances": [
      "Environmental Clearance (Category A - Bulk Heavy Inorganic Chemicals)",
      "Consent to Establish & Operate (CTE/CTO)",
      "PESO Toxic & Corrosive Chemical Storage License",
      "DISH Factory License & Chemical Major Accident Hazard (MAH) Compliance"
    ]
  },
  {
    "id": "abf-package-substrate",
    "nodeNumber": 23,
    "name": "Ajinomoto Build-up Film (ABF) High-Density Substrates",
    "tier": 4,
    "tierName": "Tier 4: Packaging, Assembly & Interconnects (OSAT / ATMP)",
    "category": "Micro-Wiring Circuit Films",
    "description": "Multi-layered micro-circuit boards that connect tiny computer chips to larger computer motherboards, allowing massive flows of digital data.",
    "marketSize": "$15.8 Billion (Growing rapidly with chiplets & AI GPUs)",
    "grossMargin": "28% - 38% (Substrate makers) | >60% (Ajinomoto for raw film)",
    "operatingMargin": "18% - 26%",
    "capexModularINR": 200,
    "capexBenchmarkINR": 600,
    "modularCapacityLabel": "Modular Pioneer Scale",
    "commercialCapacityLabel": "Commercial Benchmark Scale",
    "subsidyPercentageISM": 50,
    "subsidyPercentageSPECS": 20,
    "targetClusters": [
      "Sriperumbudur, Tamil Nadu",
      "Sanand GIDC, Gujarat"
    ],
    "keyMachinery": [
      "High-Speed Die Attach Tools",
      "Wire Bonders",
      "Molding Presses",
      "ATE Testers"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "Ajinomoto Build-up Film (ABF dielectric resin)",
      "Ultra-thin Electrolytic Copper Foil",
      "Woven Glass Fiber Cloth",
      "ENEPIG Plating Chemicals (Nickel, Palladium, Gold salts)",
      "Dry Film Photoresists (DFR)"
    ],
    "offtakeBuyers": [
      "TSMC",
      "Intel",
      "AMD & NVIDIA",
      "ASE Group & Amkor"
    ],
    "topSuppliers": [
      "Unimicron Technology",
      "Ibiden",
      "Nan Ya PCB",
      "Shinko Electric Industries",
      "AT&S"
    ],
    "ebitdaMarginExpected": "28% - 38% (Substrate makers)",
    "paybackPeriodYears": 3.8,
    "techReadinessLevel": 9,
    "sovereignMoat": "Global monopoly product required for all modern AI chips and computer CPUs.",
    "clearances": [
      "Environmental Clearance (Category A - Electronics & Electroplating Complex)",
      "Consent to Establish & Operate (CTE/CTO)",
      "PESO Hazardous Chemical Storage License (Acids, Cyanide, Oxidizers)",
      "DISH Factory License & Cleanroom Occupational Safety Review"
    ]
  },
  {
    "id": "bonding-wire",
    "nodeNumber": 24,
    "name": "Semiconductor Bonding Wires (Gold, Copper, Silver & PCC Wire)",
    "tier": 4,
    "tierName": "Tier 4: Packaging, Assembly & Interconnects (OSAT / ATMP)",
    "category": "Microscopic Connector Wires",
    "description": "Ultra-thin metallic threads—thinner than a strand of hair—welded between the silicon chip and its metal legs so electrical signals can travel in and out.",
    "marketSize": "$4.6 Billion",
    "grossMargin": "16% - 24% (Higher on Cu/PCC wire than commodity Gold)",
    "operatingMargin": "8% - 14%",
    "capexModularINR": 200,
    "capexBenchmarkINR": 600,
    "modularCapacityLabel": "Modular Pioneer Scale",
    "commercialCapacityLabel": "Commercial Benchmark Scale",
    "subsidyPercentageISM": 50,
    "subsidyPercentageSPECS": 20,
    "targetClusters": [
      "Hosur / Sriperumbudur, Tamil Nadu",
      "Sanand GIDC, Gujarat"
    ],
    "keyMachinery": [
      "High-Speed Die Attach Tools",
      "Wire Bonders",
      "Molding Presses",
      "ATE Testers"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "99.999% 5N Ultra-Pure Copper Rods",
      "99.99% 4N Refined Gold Bullion",
      "High-Purity Palladium Metal Sponge",
      "Precision Diamond Wire Drawing Dies",
      "Forming Gas (Nitrogen-Hydrogen mix)"
    ],
    "offtakeBuyers": [
      "ASE Group",
      "Amkor Technology",
      "JCET Group",
      "Micron Sanand & Tata Morigaon"
    ],
    "topSuppliers": [
      "Heraeus Electronics",
      "Tanaka Kikinzoku Kogyo",
      "MK Electron",
      "Doublink Solders / Kangqiang"
    ],
    "ebitdaMarginExpected": "16% - 24% (Higher on Cu/PCC wire than commodity Gold)",
    "paybackPeriodYears": 3.8,
    "techReadinessLevel": 9,
    "sovereignMoat": "Every packaged chip uses dozens of these micro-wires; huge domestic packaging volume.",
    "clearances": [
      "Environmental Clearance (Category A - Precious Metallurgy & Wire Drawing)",
      "Consent to Establish & Operate (CTE/CTO)",
      "PESO Hydrogen Gas Storage & Tube Furnace License",
      "DISH Factory License & High-Speed Wire Drawing Safety Review"
    ]
  },
  {
    "id": "bt-package-substrate",
    "nodeNumber": 25,
    "name": "Bismaleimide Triazine (BT) Package Substrates",
    "tier": 4,
    "tierName": "Tier 4: Packaging, Assembly & Interconnects (OSAT / ATMP)",
    "category": "Mobile Chip Carriers",
    "description": "Ultra-thin, heat-resistant plastic boards used to hold memory chips and smartphone processors without taking up valuable pocket space.",
    "marketSize": "$9.4 Billion",
    "grossMargin": "20% - 30%",
    "operatingMargin": "12% - 18%",
    "capexModularINR": 200,
    "capexBenchmarkINR": 600,
    "modularCapacityLabel": "Modular Pioneer Scale",
    "commercialCapacityLabel": "Commercial Benchmark Scale",
    "subsidyPercentageISM": 50,
    "subsidyPercentageSPECS": 20,
    "targetClusters": [
      "Sriperumbudur / Oragadam, Tamil Nadu",
      "Sanand GIDC, Gujarat"
    ],
    "keyMachinery": [
      "High-Speed Die Attach Tools",
      "Wire Bonders",
      "Molding Presses",
      "ATE Testers"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "BT Resin (Mitsubishi Gas Chemical supply)",
      "Ultra-Fine Woven Glass Cloth",
      "Electrodeposited Copper Foil",
      "ENIG Gold & Nickel Salts"
    ],
    "offtakeBuyers": [
      "Qualcomm & MediaTek",
      "Samsung Electronics & SK Hynix",
      "Micron Sanand & Tata Morigaon"
    ],
    "topSuppliers": [
      "Unimicron",
      "Nan Ya PCB",
      "Kinsus Interconnect",
      "Daeduck Electronics & Simmtech",
      "LG Innotek"
    ],
    "ebitdaMarginExpected": "20% - 30%",
    "paybackPeriodYears": 3.8,
    "techReadinessLevel": 9,
    "sovereignMoat": "Standard carrier board for smartphones, flash memory, and smart watches.",
    "clearances": [
      "Environmental Clearance (Category A - Electronic PCB & Substrate Fabrication)",
      "Consent to Establish & Operate (CTE/CTO)",
      "PESO Chemical Storage License (Acids & Plating Reagents)",
      "DISH Factory License & High-Speed Tooling Workplace Safety Review"
    ]
  },
  {
    "id": "epoxy-molding-compound-emc",
    "nodeNumber": 26,
    "name": "Epoxy Molding Compound (EMC) & Underfills",
    "tier": 4,
    "tierName": "Tier 4: Packaging, Assembly & Interconnects (OSAT / ATMP)",
    "category": "Protective Black Chip Enclosures",
    "description": "The durable black plastic casing you see on every computer chip. It seals the fragile silicon die safe from water, drops, dust, and heat.",
    "marketSize": "$3.8 Billion",
    "grossMargin": "32% - 42%",
    "operatingMargin": "18% - 25%",
    "capexModularINR": 200,
    "capexBenchmarkINR": 600,
    "modularCapacityLabel": "Modular Pioneer Scale",
    "commercialCapacityLabel": "Commercial Benchmark Scale",
    "subsidyPercentageISM": 50,
    "subsidyPercentageSPECS": 20,
    "targetClusters": [
      "Dahej PCPIR, Gujarat",
      "Sanand GIDC, Gujarat"
    ],
    "keyMachinery": [
      "High-Speed Die Attach Tools",
      "Wire Bonders",
      "Molding Presses",
      "ATE Testers"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "High-Purity Spherical Fused Silica Powder (99.99% SiO2)",
      "Epichlorohydrin & Bisphenol-A / Novolac Feedstocks",
      "Phenolic Curing Agents",
      "Silane Coupling Agents",
      "Natural Carnauba Wax"
    ],
    "offtakeBuyers": [
      "ASE Group & SPIL",
      "Amkor Technology",
      "JCET & Tongfu Microelectronics",
      "Tata OSAT Morigaon & Micron Sanand"
    ],
    "topSuppliers": [
      "Sumitomo Bakelite",
      "Resonac (formerly Showa Denko)",
      "Henkel Adhesive Technologies",
      "Shin-Etsu Chemical"
    ],
    "ebitdaMarginExpected": "32% - 42%",
    "paybackPeriodYears": 3.8,
    "techReadinessLevel": 9,
    "sovereignMoat": "Protects 100% of finished microchips from environmental and mechanical damage.",
    "clearances": [
      "Consent to Establish (CTE) & Operate (CTO) for Specialty Chemical Compounding",
      "Environmental Clearance (EC) - Category B Formulation & Compounding",
      "Petroleum & Explosives Safety Organization (PESO) Solvent & Gas Storage License",
      "Hazardous Waste Handling & Management Authorization"
    ]
  },
  {
    "id": "solder-balls-and-microbumps",
    "nodeNumber": 27,
    "name": "Solder Spheres, Micro-Bumps & Solder Paste",
    "tier": 4,
    "tierName": "Tier 4: Packaging, Assembly & Interconnects (OSAT / ATMP)",
    "category": "Tiny Solder Contact Balls",
    "description": "Microscopic metal spheres placed underneath computer chips that melt when heated, soldering the chip firmly onto circuit boards.",
    "marketSize": "$2.9 Billion",
    "grossMargin": "25% - 35%",
    "operatingMargin": "14% - 20%",
    "capexModularINR": 200,
    "capexBenchmarkINR": 600,
    "modularCapacityLabel": "Modular Pioneer Scale",
    "commercialCapacityLabel": "Commercial Benchmark Scale",
    "subsidyPercentageISM": 50,
    "subsidyPercentageSPECS": 20,
    "targetClusters": [
      "Sanand GIDC, Gujarat",
      "Sri City / Oragadam, Andhra Pradesh / Tamil Nadu"
    ],
    "keyMachinery": [
      "High-Speed Die Attach Tools",
      "Wire Bonders",
      "Molding Presses",
      "ATE Testers"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "99.99% Ultra-Pure Refined Tin (Sn) Ingots",
      "99.99% Refined Silver (Ag) Grain",
      "Ultra-Pure Copper (Cu)",
      "Modified Hydrogenated Rosin / Synthetic Activators",
      "Inert Liquid Nitrogen (N2)"
    ],
    "offtakeBuyers": [
      "ASE Group & Amkor",
      "TSMC",
      "Intel & Micron",
      "Micron Sanand & CG Power"
    ],
    "topSuppliers": [
      "Senju Metal Industry (SMIC)",
      "MacDermid Alpha Electronics Solutions",
      "Indium Corporation",
      "Tamura Corporation"
    ],
    "ebitdaMarginExpected": "25% - 35%",
    "paybackPeriodYears": 3.8,
    "techReadinessLevel": 9,
    "sovereignMoat": "Essential electrical contact beads for attaching chips to motherboards.",
    "clearances": [
      "Environmental Clearance (Category A - Metallurgical Melting & Powder Processing)",
      "Consent to Establish & Operate (CTE/CTO)",
      "PESO Flammable Solvent Storage License (Isopropanol)",
      "DISH Factory License & Molten Metal Workplace Safety Review"
    ]
  },
  {
    "id": "stamped-etched-leadframes",
    "nodeNumber": 28,
    "name": "Precision Leadframes (Etched & Stamped Copper Alloys)",
    "tier": 4,
    "tierName": "Tier 4: Packaging, Assembly & Interconnects (OSAT / ATMP)",
    "category": "Metal Chip Legs & Connector Pins",
    "description": "The shiny metal legs sticking out of computer chips that plug into sockets or solder directly onto green circuit boards.",
    "marketSize": "$4.2 Billion",
    "grossMargin": "18% - 26%",
    "operatingMargin": "9% - 15%",
    "capexModularINR": 200,
    "capexBenchmarkINR": 600,
    "modularCapacityLabel": "Modular Pioneer Scale",
    "commercialCapacityLabel": "Commercial Benchmark Scale",
    "subsidyPercentageISM": 50,
    "subsidyPercentageSPECS": 20,
    "targetClusters": [
      "Sriperumbudur / Hosur, Tamil Nadu",
      "Sanand GIDC, Gujarat / Pune, Maharashtra"
    ],
    "keyMachinery": [
      "High-Speed Die Attach Tools",
      "Wire Bonders",
      "Molding Presses",
      "ATE Testers"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "High-Purity Copper Alloy Strips (C194, C7025)",
      "Ferric Chloride (FeCl3) Etching Acid",
      "Dry Film Photoresist (DFR)",
      "Electroplating Salts (Silver Cyanide or MSA-based silver, Palladium salts, Gold salts)",
      "Nitric Acid for Stripping"
    ],
    "offtakeBuyers": [
      "Texas Instruments",
      "STMicroelectronics & Infineon",
      "NXP & Onsemi",
      "CG Power Sanand & Kaynes Semicon"
    ],
    "topSuppliers": [
      "Mitsui High-tec",
      "Chang Wah Technology (CWTC)",
      "SDI Corporation",
      "Shinko Electric Industries",
      "Possehl Electronics"
    ],
    "ebitdaMarginExpected": "18% - 26%",
    "paybackPeriodYears": 3.8,
    "techReadinessLevel": 9,
    "sovereignMoat": "High-volume stamped metal frames used in automotive and industrial electronics.",
    "clearances": [
      "Environmental Clearance (Category A - Metallurgical Stamping & Electroplating)",
      "Consent to Establish & Operate (CTE/CTO)",
      "PESO Toxic Cyanide Salt & Chemical Storage License",
      "DISH Factory License & High-Speed Punching Press Workplace Safety Review"
    ]
  },
  {
    "id": "thermal-interface-materials-and-lids",
    "nodeNumber": 29,
    "name": "Thermal Interface Materials (TIM) & Heat Spreaders (Lids)",
    "tier": 4,
    "tierName": "Tier 4: Packaging, Assembly & Interconnects (OSAT / ATMP)",
    "category": "Cooling Caps & Heat Pastes",
    "description": "Metal cooling covers and heat paste mounted on top of computer chips to pull away scorching heat so fast processors don't melt or crash.",
    "marketSize": "$3.1 Billion",
    "grossMargin": "30% - 40%",
    "operatingMargin": "15% - 22%",
    "capexModularINR": 200,
    "capexBenchmarkINR": 600,
    "modularCapacityLabel": "Modular Pioneer Scale",
    "commercialCapacityLabel": "Commercial Benchmark Scale",
    "subsidyPercentageISM": 50,
    "subsidyPercentageSPECS": 20,
    "targetClusters": [
      "Noida / Greater Noida (YEIDA), Uttar Pradesh",
      "Bengaluru, Karnataka / Sanand, Gujarat"
    ],
    "keyMachinery": [
      "High-Speed Die Attach Tools",
      "Wire Bonders",
      "Molding Presses",
      "ATE Testers"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "Oxygen-Free Copper Sheets (99.99% Cu)",
      "Refined Indium Metal (In 99.99%)",
      "Nickel Sulfamate Plating Salts",
      "Boron Nitride & Synthetic Diamond Powders"
    ],
    "offtakeBuyers": [
      "Intel",
      "AMD & NVIDIA",
      "TSMC & ASE"
    ],
    "topSuppliers": [
      "Indium Corporation",
      "Henkel Adhesive Technologies",
      "Boyd Corporation",
      "Fujipoly",
      "Foxconn Technology"
    ],
    "ebitdaMarginExpected": "30% - 40%",
    "paybackPeriodYears": 3.8,
    "techReadinessLevel": 9,
    "sovereignMoat": "Mandatory thermal management for all high-performance AI, PC, and automotive chips.",
    "clearances": [
      "Consent to Establish (CTE) & Consent to Operate (CTO) for Metal Finishing",
      "MOEFCC Environmental Clearance (Category B - Electroplating & Secondary Metallurgy)",
      "Factory Directorate Heavy Press Safety & Machinery Operation License",
      "Hazardous Waste Handling & Plating Sludge Disposal Authorization"
    ]
  },
  {
    "id": "advanced-logic-accelerator",
    "nodeNumber": 30,
    "name": "Advanced Logic Accelerators & Microprocessors (AI GPUs / CPUs)",
    "tier": 5,
    "tierName": "Tier 5: Packaged Semiconductor Devices",
    "category": "AI Brains & Processors",
    "description": "The world's most powerful computing chips that run Artificial Intelligence models, data centers, and advanced supercomputers.",
    "marketSize": "$135 Billion (Projected $280B by 2030)",
    "grossMargin": "Foundry: 52% - 55% | Fabless Brand: 65% - 78% (NVIDIA: ~75%)",
    "operatingMargin": "Foundry: 40% - 44% (TSMC) | Fabless: 50% - 62%",
    "capexModularINR": 200,
    "capexBenchmarkINR": 600,
    "modularCapacityLabel": "Modular Pioneer Scale",
    "commercialCapacityLabel": "Commercial Benchmark Scale",
    "subsidyPercentageISM": 25,
    "subsidyPercentageSPECS": 20,
    "targetClusters": [
      "Dholera SIR (Semicon City), Gujarat",
      "Sanand GIDC, Gujarat / Morigaon, Assam"
    ],
    "keyMachinery": [
      "Pick-and-Place SMT Lines",
      "Reflow Ovens",
      "Automated Optical Inspection (AOI)"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "300mm Monocrystalline Prime Silicon Wafers",
      "EUV & ArFi Photoresists & TMAH Developer",
      "Ajinomoto Build-up Film (ABF)",
      "Ultra-High Purity Copper Sputtering Targets & Plating Chemistry",
      "Tungsten Hexafluoride (WF6) & High-k Hafnium ALD Precursors"
    ],
    "offtakeBuyers": [
      "NVIDIA",
      "Apple",
      "AMD",
      "Cloud Hyperscalers (Microsoft, Google, AWS, Meta)"
    ],
    "topSuppliers": [
      "TSMC",
      "Samsung Electronics",
      "Intel Foundry (IFS)"
    ],
    "ebitdaMarginExpected": "Foundry: 52% - 55%",
    "paybackPeriodYears": 3.2,
    "techReadinessLevel": 8,
    "sovereignMoat": "Highest value product in the entire tech ecosystem, driving the AI revolution.",
    "clearances": [
      "Consent to Establish (CTE) & Consent to Operate (CTO) for High-Tech Electronics",
      "Ministry of Electronics & IT (MeitY) Modified SPECS / ISM Project Sanction",
      "Export-Import Dual-Use Technology Authorization (SCOMET License)",
      "Bureau of Indian Standards (BIS) & Electronics Safety Certification (CRS)"
    ]
  },
  {
    "id": "automotive-industrial-mcu",
    "nodeNumber": 31,
    "name": "Automotive & Industrial Microcontrollers (MCUs) & Analog PMICs",
    "tier": 5,
    "tierName": "Tier 5: Packaged Semiconductor Devices",
    "category": "Car & Factory Controller Chips",
    "description": "Small, reliable computer chips that control car steering, airbags, electric motors, medical equipment, and factory robots.",
    "marketSize": "$48 Billion (Automotive MCU: $12B)",
    "grossMargin": "50% - 62% (Texas Instruments: ~65%)",
    "operatingMargin": "35% - 45%",
    "capexModularINR": 200,
    "capexBenchmarkINR": 600,
    "modularCapacityLabel": "Modular Pioneer Scale",
    "commercialCapacityLabel": "Commercial Benchmark Scale",
    "subsidyPercentageISM": 25,
    "subsidyPercentageSPECS": 20,
    "targetClusters": [
      "Dholera SIR, Gujarat",
      "Sanand GIDC, Gujarat / Sriperumbudur, Tamil Nadu"
    ],
    "keyMachinery": [
      "Pick-and-Place SMT Lines",
      "Reflow Ovens",
      "Automated Optical Inspection (AOI)"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "200mm & 300mm Polished Silicon Wafers",
      "Copper Alloy Leadframe Strips (C194)",
      "Palladium-Coated Copper Bonding Wire",
      "Standard DUV / i-line Photoresists",
      "Epoxy Molding Compound (EMC)"
    ],
    "offtakeBuyers": [
      "Tier-1 Auto Systems (Bosch, Continental, Denso, Magna)",
      "Consumer Electronics & Industrial (Apple, Samsung, Foxconn)",
      "Indian Automotive OEMs (Maruti Suzuki, Tata Motors, Mahindra)"
    ],
    "topSuppliers": [
      "Texas Instruments",
      "NXP Semiconductors",
      "Renesas Electronics",
      "Infineon Technologies",
      "STMicroelectronics"
    ],
    "ebitdaMarginExpected": "50% - 62% (Texas Instruments: ~65%)",
    "paybackPeriodYears": 3.2,
    "techReadinessLevel": 8,
    "sovereignMoat": "Every electric vehicle uses over 1,000 of these controller chips; huge domestic demand.",
    "clearances": [
      "Consent to Establish (CTE) & Consent to Operate (CTO) for Semiconductor Packaging",
      "IATF 16949 Automotive Quality Management System Certification",
      "AEC-Q100 Automotive IC Stress Test Reliability Qualification",
      "ISO 26262 ASIL-D Functional Safety Certification"
    ]
  },
  {
    "id": "hbm-dram-memory",
    "nodeNumber": 32,
    "name": "High Bandwidth Memory (HBM3e / HBM4) & DRAM",
    "tier": 5,
    "tierName": "Tier 5: Packaged Semiconductor Devices",
    "category": "Ultra-Fast Memory",
    "description": "Ultra-fast computer memory stacked like skyscraper floors to feed billions of pieces of data per second into artificial intelligence processors.",
    "marketSize": "$92 Billion (HBM segment: $18B growing at 45% CAGR)",
    "grossMargin": "HBM: 55% - 65% | Commodity DRAM: 35% - 50% (Cyclical)",
    "operatingMargin": "HBM: 40% - 50% | Commodity DRAM: 15% - 35%",
    "capexModularINR": 200,
    "capexBenchmarkINR": 600,
    "modularCapacityLabel": "Modular Pioneer Scale",
    "commercialCapacityLabel": "Commercial Benchmark Scale",
    "subsidyPercentageISM": 25,
    "subsidyPercentageSPECS": 20,
    "targetClusters": [
      "Sanand GIDC, Gujarat"
    ],
    "keyMachinery": [
      "Pick-and-Place SMT Lines",
      "Reflow Ovens",
      "Automated Optical Inspection (AOI)"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "12-inch 300mm Prime Silicon Wafers",
      "EUV Photoresist & Developer",
      "Micro-bump Electroplating Chemicals (Cu, Sn, Ag)",
      "Advanced Liquid Epoxy Resins / Non-Conductive Film (NCF)",
      "Diamond Dicing Blades & Stealth Laser Slicing systems"
    ],
    "offtakeBuyers": [
      "NVIDIA",
      "AMD",
      "Google & Amazon",
      "Server OEMs (Dell, HPE, Supermicro)"
    ],
    "topSuppliers": [
      "SK Hynix",
      "Samsung Electronics",
      "Micron Technology"
    ],
    "ebitdaMarginExpected": "HBM: 55% - 65%",
    "paybackPeriodYears": 3.2,
    "techReadinessLevel": 8,
    "sovereignMoat": "Essential companion chip for every AI accelerator in modern data centers.",
    "clearances": [
      "Consent to Establish (CTE) & Consent to Operate (CTO) for Memory Packaging",
      "Ministry of Electronics & IT (MeitY) India Semiconductor Mission (ISM) Sanction",
      "JEDEC Solid State Technology Association Memory Compliance Certification",
      "Hazardous Chemicals & Pressurized Gas Storage License"
    ]
  },
  {
    "id": "nand-flash-memory",
    "nodeNumber": 33,
    "name": "3D NAND Flash Memory",
    "tier": 5,
    "tierName": "Tier 5: Packaged Semiconductor Devices",
    "category": "Solid State Storage Chips",
    "description": "Storage chips built with hundreds of microscopic storage rooms stacked on top of each other. Used in smartphones, laptops, and cloud servers to save photos, videos, and files.",
    "marketSize": "$65 Billion",
    "grossMargin": "25% - 45% (Cyclical)",
    "operatingMargin": "10% - 30%",
    "capexModularINR": 200,
    "capexBenchmarkINR": 600,
    "modularCapacityLabel": "Modular Pioneer Scale",
    "commercialCapacityLabel": "Commercial Benchmark Scale",
    "subsidyPercentageISM": 25,
    "subsidyPercentageSPECS": 20,
    "targetClusters": [
      "Sanand GIDC, Gujarat"
    ],
    "keyMachinery": [
      "Pick-and-Place SMT Lines",
      "Reflow Ovens",
      "Automated Optical Inspection (AOI)"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "300mm Prime Silicon Wafers",
      "Nitrogen Trifluoride (NF3) & Xenon (Xe) Etch Gases",
      "Tungsten Hexafluoride (WF6) Precursor",
      "BT Substrates & Gold/Cu Wire Bonds"
    ],
    "offtakeBuyers": [
      "Cloud Hyperscalers (Amazon AWS, Microsoft Azure, Google)",
      "Apple & Smartphone OEMs",
      "PC & Server OEMs (Dell, HP, Lenovo)"
    ],
    "topSuppliers": [
      "Samsung Electronics",
      "SK Hynix (including Solidigm)",
      "Kioxia",
      "Western Digital / SanDisk",
      "Micron Technology"
    ],
    "ebitdaMarginExpected": "25% - 45% (Cyclical)",
    "paybackPeriodYears": 3.2,
    "techReadinessLevel": 8,
    "sovereignMoat": "Replaces spinning hard drives with ultra-fast solid-state digital storage.",
    "clearances": [
      "Consent to Establish (CTE) & Consent to Operate (CTO) for Electronics Assembly",
      "Ministry of Electronics & IT (MeitY) Modified PLI / SPECS Scheme Sanction",
      "Bureau of Indian Standards (BIS) Compulsory Registration Scheme (CRS)",
      "Federal Information Processing Standards (FIPS 140-3) Cryptographic Security"
    ]
  },
  {
    "id": "power-sic-gan-semiconductors",
    "nodeNumber": 34,
    "name": "Power Semiconductors (Silicon Carbide SiC, GaN HEMTs & IGBTs)",
    "tier": 5,
    "tierName": "Tier 5: Packaged Semiconductor Devices",
    "category": "High-Power EV & Solar Chips",
    "description": "Heavy-duty microchips built to handle thousands of volts of raw electricity. Crucial for electric cars to drive further, fast EV chargers, and solar power converters.",
    "marketSize": "$28 Billion (SiC/GaN growing at 32% CAGR to $12B by 2030)",
    "grossMargin": "45% - 55%",
    "operatingMargin": "22% - 32%",
    "capexModularINR": 200,
    "capexBenchmarkINR": 600,
    "modularCapacityLabel": "Modular Pioneer Scale",
    "commercialCapacityLabel": "Commercial Benchmark Scale",
    "subsidyPercentageISM": 25,
    "subsidyPercentageSPECS": 20,
    "targetClusters": [
      "Sriperumbudur / Oragadam Auto Corridor, Tamil Nadu",
      "Sanand / Dholera, Gujarat"
    ],
    "keyMachinery": [
      "Pick-and-Place SMT Lines",
      "Reflow Ovens",
      "Automated Optical Inspection (AOI)"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "Single-Crystal Silicon Carbide (4H-SiC) Wafers",
      "High-purity Silane (SiH4) and Propane (C3H8) for Epitaxy",
      "Direct Bonded Copper (DBC) Silicon Nitride Ceramic Substrates",
      "Nano-Silver Sintering Pastes",
      "High-purity Aluminum & Copper Wire Rods"
    ],
    "offtakeBuyers": [
      "Tesla & BYD",
      "Tata Motors & Mahindra & Mahindra",
      "Solar & Industrial (Siemens, ABB, Enphase, Sungrow)"
    ],
    "topSuppliers": [
      "STMicroelectronics",
      "Infineon Technologies",
      "Onsemi",
      "Wolfspeed"
    ],
    "ebitdaMarginExpected": "45% - 55%",
    "paybackPeriodYears": 3.2,
    "techReadinessLevel": 8,
    "sovereignMoat": "Non-negotiable power switch chips for electric vehicles, renewable grids, and high-speed trains.",
    "clearances": [
      "Consent to Establish (CTE) & Consent to Operate (CTO) for Power Electronics",
      "IATF 16949 Automotive Quality Management System Certification",
      "AQG 324 Automotive Power Module Reliability Qualification",
      "Central Electricity Authority (CEA) / RDSO Railway Traction Certification"
    ]
  }
];

export const SCINT_CLUSTERS: SCIntCluster[] = [
  {
    "id": "dholera-sir",
    "name": "Dholera Special Investment Region (SIR) - Semicon City",
    "state": "Gujarat",
    "category": "Mega-Scale Front-End Fabs & Compound Semis",
    "readinessScore": "96/100",
    "overview": "India's premier planned greenfield industrial smart city, covering 920 sq km with dedicated 'Semicon City' zoning for mega-fabs and supply chain ancillaries.",
    "anchorTenants": [
      "Tata Electronics & PSMC (₹91,526 Cr 300mm Fab)",
      "Crystal Matrix (GaN Fab & ATMP)"
    ],
    "waterInfrastructure": {
      "source": "Dedicated canal pipeline from Narmada River basin; 100+ MLD dedicated industrial water treatment plant.",
      "adequacy": "Ultra-high. Fabs require 3-5 MGD (Million Gallons/Day) of raw water to generate ASTM D5127 Type E-1 Ultra-Pure Water (UPW). Dholera provides guaranteed water at ₹12/m3 for 5 years.",
      "effluentHandling": "Central Effluent Treatment Plant (CETP) with Zero Liquid Discharge (ZLD) pipeline to Gulf of Khambhat deep sea discharge."
    },
    "powerInfrastructure": {
      "grid": "Dual 400kV and 220kV GIS substations fed by GETCO with dedicated underground utility ducts.",
      "reliability": "99.999% uptime with sub-cycle dynamic voltage restorer (DVR) integration to eliminate micro-voltage sags lethal to lithography steppers.",
      "tariff": "₹2/unit subsidy for 10 years; direct access to world's largest 30GW Khavda Hybrid Renewable Park."
    },
    "logisticsConnectivity": {
      "airCargo": "Dholera International Cargo Airport (operational 2025-2026, 4,000m runway) located 15 km away with dedicated cold-chain perishables handling for photoresists.",
      "ports": "Pipavav Port (200km), Mundra Port (350km), and Hazira Port (280km) for bulk chemical and tool shipping.",
      "expressways": "Ahmedabad-Dholera 4-lane expressway and semi-high-speed regional rail."
    },
    "recommendedComponents": [
      "300mm & 200mm Front-End Silicon Wafers & Ingot Pulling",
      "Advanced Logic Fabs (28nm/55nm/91nm)",
      "Compound Semiconductor Fabs (SiC & GaN)",
      "Photomask / Reticle Fabrication Lines",
      "Bulk Specialty Gas Delivery & Abatement Skids"
    ]
  },
  {
    "id": "sanand-gidc",
    "name": "Sanand GIDC Industrial Cluster",
    "state": "Gujarat",
    "category": "High-Volume OSAT / ATMP Packaging & Precision Consumables",
    "readinessScore": "95/100",
    "overview": "Established mature automotive and electronics manufacturing hub 30km west of Ahmedabad, rapidly emerging as India's OSAT capital.",
    "anchorTenants": [
      "Micron Technology (₹22,500 Cr ATMP)",
      "CG Power + Renesas + Stars Micro (₹7,600 Cr OSAT)",
      "Kaynes Semicon (₹3,300 Cr OSAT)"
    ],
    "waterInfrastructure": {
      "source": "Sardar Sarovar Narmada canal network pipeline with dedicated tertiary treatment.",
      "adequacy": "ATMP/OSAT requires 0.5-1.5 MGD. Sanand has ready plug-and-play water pipelines with automated metering.",
      "effluentHandling": "Modern CETP with direct industrial hazardous waste collection networks."
    },
    "powerInfrastructure": {
      "grid": "Torrent Power & UGVCL multi-source 220kV feeders.",
      "reliability": "High industrial reliability, automated SCADA fault detection.",
      "tariff": "Eligible for Gujarat Semiconductor Policy ₹2/unit power tariff subsidy."
    },
    "logisticsConnectivity": {
      "airCargo": "Sardar Vallabhbhai Patel International Airport (Ahmedabad - AMD) 35 km away via 6-lane highway (under 45 min transit for air freight).",
      "ports": "Major sea port within 200km.",
      "expressways": "National highway access corridor."
    },
    "recommendedComponents": [
      "OSAT / ATMP Memory & Logic Packaging",
      "Package Substrates (BT & ABF Substrates)",
      "Bonding Wires (Gold, Copper, Silver)",
      "Solder Spheres & Micro-Bumps",
      "Leadframes (Etched & Stamped Copper Alloys)"
    ]
  },
  {
    "id": "yeida-jewar",
    "name": "Yamuna Expressway Industrial Development Authority (YEIDA) / Jewar Corridor",
    "state": "Uttar Pradesh",
    "category": "Mega Fabs, Compound Semis & Display Fabs",
    "readinessScore": "91/100",
    "overview": "Massive planned industrial and logistics belt adjacent to the upcoming Noida International Airport (Jewar), backed by UP's aggressive 50% matching subsidy policy.",
    "anchorTenants": [
      "Multiple mega-fab proposals under ISM review; Hiranandani/Yotta & foreign consortium bids"
    ],
    "waterInfrastructure": {
      "source": "Upper Ganga Canal and Yamuna river basin pipelines; dedicated 50 MLD industrial water treatment plant.",
      "adequacy": "High. Planned infrastructure designed for mega-scale fab UPW requirements with ZLD mandate.",
      "effluentHandling": "Dedicated multi-stage CETP with tertiary filtration."
    },
    "powerInfrastructure": {
      "grid": "UPPTCL 400kV substation at Jewar with dual 220kV dedicated feeds.",
      "reliability": "Uninterrupted heavy industrial grade power with express feeder allocation.",
      "tariff": "100% electricity duty exemption for 10 years under UP Semiconductor Policy 2024."
    },
    "logisticsConnectivity": {
      "airCargo": "Noida International Airport (Jewar) directly adjacent (<10km) featuring a multi-modal cargo hub with dedicated perishables and cleanroom air transit.",
      "ports": "Major sea port within 200km.",
      "expressways": "Yamuna Expressway, Eastern Peripheral Expressway, and DFC Dadri junction."
    },
    "recommendedComponents": [
      "Silicon Semiconductor Fabs",
      "Display Fabs (OLED & TFT-LCD)",
      "Compound Semiconductor Fabs (SiC/GaN)",
      "Automotive Microcontrollers & PMIC Packaging",
      "Thermal Interface Materials (TIM) & Lids"
    ]
  },
  {
    "id": "sriperumbudur-oragadam",
    "name": "Sriperumbudur - Oragadam Electronics Corridor",
    "state": "Tamil Nadu",
    "category": "Automotive Compound Semis, Leadframes & Packaging Materials",
    "readinessScore": "93/100",
    "overview": "India's undisputed automotive and hardware electronics export capital, hosting Apple contract manufacturers (Foxconn, Pegatron), auto OEMs (Hyundai, Renault, Daimler), and component giants.",
    "anchorTenants": [
      "SIPCOT Semiconductor & Component Parks; Proposed SiC Fab & Murugappa/Zoho projects"
    ],
    "waterInfrastructure": {
      "source": "Chembarambakkam reservoir, Nemmeli & Minjur Desalination plants, and tertiary treated TTRO industrial supply (45 MLD).",
      "adequacy": "High desalination integration eliminates drought risks.",
      "effluentHandling": "SIPCOT industrial CETPs with strict coastal ZLD norms."
    },
    "powerInfrastructure": {
      "grid": "TANGEDCO 400kV Sriperumbudur substation with redundant feeds.",
      "reliability": "High reliability with green power wheeling from southern wind and solar corridors.",
      "tariff": "Tailored concessional tariff under TN Advanced Electronics Policy."
    },
    "logisticsConnectivity": {
      "airCargo": "Chennai International Airport (MAA) 32 km away with extensive global semiconductor cold-chain flights.",
      "ports": "Chennai Port & Ennore Port (45-55 km) offering rapid sea freight to Southeast Asia and East Asia.",
      "expressways": "National highway access corridor."
    },
    "recommendedComponents": [
      "Power Semiconductors (SiC MOSFETs, GaN HEMTs, IGBTs)",
      "Etched & Stamped Leadframes (C194/C7025 alloys)",
      "Multi-Layer Ceramic Capacitors (MLCCs)",
      "Direct Bonded Copper (DBC) Ceramic Substrates",
      "Automotive & Industrial OSAT Facilities"
    ]
  },
  {
    "id": "bengaluru-mysuru",
    "name": "Bengaluru - Mysuru ESDM & Fabless Innovation Corridor",
    "state": "Karnataka",
    "category": "Chip Design (VLSI), R&D, Compound Semi & Specialty Test Sockets",
    "readinessScore": "92/100",
    "overview": "The Silicon Valley of India, housing over 70% of India's 120,000+ chip design engineers, global design centers (Intel, AMD, NVIDIA, Qualcomm, TI, ARM), and premier research institutions (IISc, IIT Dharwad).",
    "anchorTenants": [
      "Every major global fabless & IDM design center; Kaynes Technology; Applied Materials India R&D Center"
    ],
    "waterInfrastructure": {
      "source": "Cauvery water pipeline supply for Mysuru ESDM cluster; treated industrial water.",
      "adequacy": "Moderate in Bengaluru urban; High in Mysuru KIADB industrial area.",
      "effluentHandling": "Modern CETP infrastructure in KIADB industrial zones."
    },
    "powerInfrastructure": {
      "grid": "KPTCL 400kV multi-loop substation grid with abundant solar power wheeling from Pavagada.",
      "reliability": "Very high in designated aerospace and electronics parks.",
      "tariff": "₹1.50/unit rebate under Karnataka ESDM Policy."
    },
    "logisticsConnectivity": {
      "airCargo": "Kempegowda International Airport (BLR) with dedicated coolport facilities and direct semiconductor freighters.",
      "ports": "Major sea port within 200km.",
      "expressways": "Bengaluru-Mysuru 10-lane expressway (transit time ~75 mins)."
    },
    "recommendedComponents": [
      "Fabless Chip Architecture & ASIC Design Centers",
      "MEMS Sensors & Silicon Photonics R&D",
      "Probe Cards & Test Sockets Manufacturing",
      "EDA Software & Post-Silicon Validation Labs",
      "Compound Semiconductor Pilot Fabs (IISc CeNSE model)"
    ]
  },
  {
    "id": "morigaon-assam",
    "name": "Morigaon Semiconductor Park",
    "state": "Assam",
    "category": "Large-Scale Advanced OSAT / ATMP Assembly & Test",
    "readinessScore": "88/100",
    "overview": "Pioneering eastern India semiconductor manufacturing base being developed by Tata Electronics, turning Assam into a strategic high-tech packaging gateway to ASEAN.",
    "anchorTenants": [
      "Tata Electronics OSAT Facility (₹27,000 Cr investment, 48 million chips/day)"
    ],
    "waterInfrastructure": {
      "source": "Abundant perennial groundwater and Brahmaputra river basin supply.",
      "adequacy": "Exceptional natural water availability; specialized multi-stage filtration to manage silt and minerals.",
      "effluentHandling": "State-of-the-art closed-loop ZLD CETP built by Tata Projects."
    },
    "powerInfrastructure": {
      "grid": "Dedicated high-voltage grid lines connected to Assam Power Distribution and northeastern hydro power grids.",
      "reliability": "Zero-trip express feeder corridor engineered specifically for Tata OSAT.",
      "tariff": "Highly subsidized green power tariff package."
    },
    "logisticsConnectivity": {
      "airCargo": "Lokpriya Gopinath Bordoloi International Airport (Guwahati - GAU) 65 km away, undergoing cargo terminal expansion for direct semiconductor exports.",
      "ports": "Major sea port within 200km.",
      "expressways": "National highway access corridor."
    },
    "recommendedComponents": [
      "High-Volume OSAT / ATMP Packaging (Automotive, Mobile, AI)",
      "Wire-Bonding & Flip-Chip BGA Lines",
      "Test & Burn-In Facilities",
      "Passive Component Integration"
    ]
  },
  {
    "id": "dahej-pcpir",
    "name": "Dahej PCPIR Specialty Chemical Hub",
    "state": "Gujarat",
    "category": "Ultra-Pure Electronic Acids, Specialty Gases & Raw Precursors",
    "readinessScore": "94/100",
    "overview": "India's leading Petroleum, Chemicals and Petrochemicals Investment Region, housing the nation's dense fluorochemical, chlor-alkali, and specialty gas production base.",
    "anchorTenants": [
      "Gujarat Fluorochemicals (GFL)",
      "Navin Fluorine International",
      "SRF Limited",
      "Adani Copper Smelter (Mundra nearby)"
    ],
    "waterInfrastructure": {
      "source": "Narmada industrial water pipeline and sea water desalination plants.",
      "adequacy": "Massive chemical-grade water volume capacity.",
      "effluentHandling": "Deep-sea marine effluent discharge pipeline (30+ km offshore) approved by Central Pollution Control Board (CPCB)."
    },
    "powerInfrastructure": {
      "grid": "Heavy industrial high-capacity grid with dedicated captive power plants.",
      "reliability": "Continuously powered heavy industrial standard.",
      "tariff": "Competitive chemical industrial power rates."
    },
    "logisticsConnectivity": {
      "airCargo": "Surat International Airport (130 km) and Vadodara Airport (140 km) with domestic and international air cargo transit.",
      "ports": "Dahej Sea Port with dedicated chemical and gas import berths; Ro-Pax ferry to Saurashtra.",
      "expressways": "National highway access corridor."
    },
    "recommendedComponents": [
      "Ultra-Pure Hydrofluoric Acid (UP-HF 49% < 10 ppt)",
      "Electronic Grade Sulfuric Acid & Hydrogen Peroxide",
      "Dry Etch Gases (NF3, SF6, CF4, C4F8)",
      "High-Purity Solvents (PGMEA, UP-IPA)",
      "Epoxy Molding Resins & Phenolic Hardeners"
    ]
  }
];

export const SCINT_STATE_POLICIES: SCIntStatePolicy[] = [
  {
    "id": "gujarat",
    "state": "Gujarat",
    "capexTopUpPercent": 20,
    "landRebate": "75% subsidy on land procurement in Dholera SIR / 50% in Sanand",
    "powerSubsidy": "₹2 per unit electricity tariff subsidy for 10 years + 100% duty exemption",
    "stampDuty": "100% reimbursement of stamp duty and registration fees",
    "waterRebate": "Potable water at ₹12/m³ for 5 years with Narmada canal pipeline",
    "description": "Gujarat Semiconductor Policy (2022-2027) providing 40% top-up of Central grant (effective 70% total capex subsidy) with world-class plug-and-play ecosystems at Dholera SIR and Sanand GIDC."
  },
  {
    "id": "uttar-pradesh",
    "state": "Uttar Pradesh",
    "capexTopUpPercent": 25,
    "landRebate": "75% rebate on land purchase in Yamuna Expressway (YEIDA) Semicon Park",
    "powerSubsidy": "100% electricity duty exemption for 10 years + dual feeder supply",
    "stampDuty": "100% stamp duty exemption on industrial land allotment",
    "waterRebate": "50% subsidy on water charges for 5 years from commission date",
    "description": "UP Semiconductor Policy 2024 providing 50% top-up of Central grant (effective 75% total capex subsidy) targeting Jewar International Airport cluster."
  },
  {
    "id": "tamil-nadu",
    "state": "Tamil Nadu",
    "capexTopUpPercent": 20,
    "landRebate": "50% land subsidy in SIPCOT industrial estates (Sriperumbudur/Oragadam)",
    "powerSubsidy": "Uninterrupted dedicated 230kV substation link + green power access",
    "stampDuty": "100% stamp duty waiver for A and B category industrial projects",
    "waterRebate": "Tertiary treated reverse osmosis (TTRO) water supply agreements",
    "description": "Tamil Nadu Semiconductor & Advanced Electronics Policy offering up to 20% capex assistance, structured PLI matching, and automotive OEM offtake."
  },
  {
    "id": "karnataka",
    "state": "Karnataka",
    "capexTopUpPercent": 20,
    "landRebate": "Concessional land lease in KIADB parks (Bengaluru Aerospace/Mysuru)",
    "powerSubsidy": "₹1.5 per unit power subsidy for 5 years + priority transmission",
    "stampDuty": "100% exemption on loan agreements and mortgage deeds",
    "waterRebate": "Assured bulk industrial allocation from Cauvery basin skids",
    "description": "Karnataka ESDM Policy offering 20% capex support, premier fabless talent pool, and close proximity to defense and aerospace clusters."
  },
  {
    "id": "assam",
    "state": "Assam",
    "capexTopUpPercent": 20,
    "landRebate": "100% free land allotment for anchor OSAT semiconductor packaging parks",
    "powerSubsidy": "100% power transmission rebate + renewable captive wheeling",
    "stampDuty": "100% exemption on industrial land title transfers",
    "waterRebate": "Dedicated Brahmaputra water pipeline with ZLD effluent treatment",
    "description": "Assam Semiconductor Incentive Framework backed by ₹27,000 Cr Tata Electronics greenfield OSAT at Morigaon."
  },
  {
    "id": "odisha",
    "state": "Odisha",
    "capexTopUpPercent": 20,
    "landRebate": "100% ground rent exemption in Infovalley 2 (Bhubaneswar/Gopalpur)",
    "powerSubsidy": "₹2 per unit industrial power tariff rebate for 7 years",
    "stampDuty": "100% stamp duty exemption on initial land registry",
    "waterRebate": "Dedicated industrial water reservation at subsidized tariffs",
    "description": "Odisha Semiconductor & Fabless Policy providing 20% capex top-up, port logistics via Paradip/Gopalpur, and compound semi incentives."
  }
];

export const SCINT_INDUSTRY_PRESETS: SCIntIndustryPreset[] = [
  {
    "id": "silicon-fab",
    "name": "Commercial Silicon Fab",
    "defaultCapexINR": 20000,
    "centralSubsidyPercent": 50,
    "categoryLabel": "Mega-Scale 300mm Fab",
    "description": "Commercial front-end fab producing 28nm-65nm logic and power management microchips."
  },
  {
    "id": "compound-fab",
    "name": "Compound Semi (SiC / GaN)",
    "defaultCapexINR": 1800,
    "centralSubsidyPercent": 50,
    "categoryLabel": "Wide Bandgap Fab",
    "description": "High-power Silicon Carbide and Gallium Nitride fab for electric vehicles and fast-chargers."
  },
  {
    "id": "osat-packaging",
    "name": "OSAT / ATMP Packaging Facility",
    "defaultCapexINR": 3500,
    "centralSubsidyPercent": 50,
    "categoryLabel": "High-Reliability Packaging",
    "description": "Outsourced assembly and test facility certified to IATF 16949 with automated optical inspection."
  },
  {
    "id": "chemical-specs",
    "name": "Consumable / Chemical Plant",
    "defaultCapexINR": 400,
    "centralSubsidyPercent": 25,
    "categoryLabel": "SPECS 2.0 Consumable",
    "description": "Electronic-grade wet chemical synthesis, ultra-pure HF acid, or specialized precursor gases."
  }
];
