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
    "name": "Fluorite Mineral Rock (Acid-Grade Fluorspar / CaF2)",
    "tier": 0,
    "tierName": "Tier 0: Mined Raw Minerals & Foundational Commodities",
    "category": "Mined Earth Minerals",
    "description": "A naturally occurring crystalline mineral mined from rocky hills that provides natural fluorine. When mixed with sulfuric acid, it creates the essential chemical liquid used by every microchip factory on earth to wash, polish, and etch microscopic circuits into silicon plates. Without this mineral, not a single computer chip or electric car battery can be manufactured.\n\nInside this processing factory, large boulders of mined rock are fed into industrial crushers and ground into a powder as fine as baking flour. The powder is mixed into bubbling chemical tanks where frothy foam lifts the pure mineral crystals to the surface while waste dirt sinks to the bottom. The purified mineral powder is dried and packed into sealed industrial shipping containers.\n\nIndia currently imports nearly 100% of its high-purity fluorite from foreign countries. Setting up a domestic mineral processing plant in Gujarat guarantees an immediate, uninterrupted supply to India's upcoming mega chip fabs in Dholera and Sanand.",
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
      "Heavy Industrial Rock Crusher (crushes large mined boulders into gravel)",
      "Ball Mill Pulverizer (grinds rock gravel into powder as fine as flour)",
      "Froth Flotation Separation Tanks (uses bubbling chemical foam to float pure minerals away from dirt)",
      "Continuous Flash Dryer (dries wet purified mineral powder with hot air)"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "Raw Mined Fluorite Ore (natural stone containing 30% to 60% calcium fluoride)",
      "Concentrated Industrial Sulfuric Acid (reacts with rock powder to separate pure minerals)",
      "Biodegradable Froth Reagents (specialty foaming agents that float pure mineral particles)",
      "Clean Industrial Natural Gas (clean-burning fuel to heat drying ovens)"
    ],
    "offtakeBuyers": [
      "Gujarat Fluorochemicals (India's premier chemical manufacturer supplying chip and battery makers)",
      "Stella Chemifa & Morita Chemical (Global chemical giants making ultra-pure chip cleaning acids)",
      "Solvay & Chemours (International suppliers producing battery electrolytes and fluoropolymers)",
      "Tata Electronics (India's premier chip fab requiring thousands of tons of cleaning chemicals)"
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
    "sovereignMoat": "Guaranteed domestic market monopoly with zero local competition. The Government of India provides a 50% central grant under the India Semiconductor Mission (ISM) plus an additional 20% state capital subsidy, paying up to 70% of the entire factory setup cost. Operating profit margins average 28% to 38% with a rapid 3.2-year investment recovery.",
    "clearances": [
      "Central Ministry Environmental Clearance (MoEFCC - certifies safe groundwater and air standards)",
      "State Pollution Control Board Operating Permit (CTE/CTO - validates closed-loop water recycling)",
      "State Mining Department Quarry Concession (legal rights to source stone from approved mineral zones)",
      "Factory Safety & Heavy Machinery License (approves industrial processing operations)"
    ]
  },
  {
    "id": "compound-semi-precursor-minerals",
    "nodeNumber": 2,
    "name": "Specialty 5G & Radar Metals: Gallium, Germanium & Indium (Compound Semiconductor Precursors)",
    "tier": 0,
    "tierName": "Tier 0: Mined Raw Minerals & Foundational Commodities",
    "category": "Strategic Mined Metals",
    "description": "Ultra-rare strategic metals extracted as natural byproducts from domestic aluminum and zinc refining. Unlike standard silicon, these special metals allow electricity to travel at near light-speed with almost zero heat buildup. They are the irreplaceable foundation of 5G cellular towers, military radar systems, electric vehicle fast-chargers, and satellite communications.\n\nIn this factory, chemical byproduct liquids from aluminum smelters are passed through specialized molecular filters that trap individual gallium and germanium atoms. The captured metals are melted under ultra-high vacuum heaters that sweep impurities out of the metal bar, producing crystalline ingots that are 99.9999% pure.\n\nBecause global supplies are tightly controlled by foreign export bans, establishing a domestic extraction refinery gives India total defense self-reliance and guarantees raw materials for upcoming domestic compound semiconductor fabs.",
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
      "Chemical Leaching Extraction Reactor (dissolves metal traces out of aluminum refinery liquids)",
      "Ion-Exchange Separation Columns (molecular resin filters that capture gallium and germanium atoms)",
      "High-Vacuum Thermal Zone Refiner (sweeps an electric heater across the metal ingot to push out every last impurity)",
      "Hermetic Argon Packaging Gloveboxes (airtight glass chambers that pack pure metal under protective gas)"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "Alumina Refinery Byproduct Liquid (waste stream from domestic aluminum plants like Hindalco and NALCO)",
      "Zinc Smelter Mineral Residue (heavy mineral residues from domestic zinc smelters like Hindustan Zinc)",
      "High-Purity Hydrochloric Acid (chemical acid to extract dissolved metals)",
      "Specialty Chelating Polymer Resins (advanced beads that bind specifically to gallium atoms)"
    ],
    "offtakeBuyers": [
      "Indian Compound Semiconductor Fabs (Zoho & Silex Microsystems compound fabs)",
      "Wolfspeed & STMicroelectronics (Global manufacturers of electric car power chips)",
      "Sumitomo Electric & Freiberger (World leaders in 5G and satellite radio wafers)",
      "DRDO & ISRO Strategic Laboratories (Indian defense and space research facilities)"
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
    "sovereignMoat": "Critical national security asset with high global scarcity. India already produces millions of tons of raw aluminum and zinc, meaning 100% of the raw mineral feedstocks are already inside the country waiting to be refined. Backed by up to 70% government capital co-funding, the facility commands high operating margins of 35% to 50% with rapid 3.2-year payback.",
    "clearances": [
      "Central Ministry Environmental Clearance (MoEFCC Category B - byproduct recovery and eco-friendly processing)",
      "State Pollution Control Board Operating Permit (CTE/CTO - validates closed-loop chemical handling)",
      "Host Smelter Long-Term Supply & Site Agreement (contracts connecting factory to aluminum/zinc plants)",
      "PESO Industrial Gas & Hydrogen Storage Permit (certified storage of protective atmospheric gases)"
    ]
  },
  {
    "id": "high-purity-copper-cathode",
    "nodeNumber": 3,
    "name": "Ultra-Pure Electronic Copper Wires & Rods (6N High-Purity Copper)",
    "tier": 0,
    "tierName": "Tier 0: Mined Raw Minerals & Foundational Commodities",
    "category": "Refined Pure Metals",
    "description": "Copper refined to 99.9999% purity—meaning fewer than one foreign atom in a million. Used to manufacture microscopic electrical connecting wires, leadframe pins, and metallic traces inside microprocessors and smartphones. Standard electrical wire copper is not pure enough for microchips, where even a microscopic impurity can cause an entire microchip to short-circuit.\n\nThis plant takes commercial copper plates and places them into electrified chemical tanks. When electric currents pass through the tanks, copper atoms dissolve into the liquid and redeposit onto clean plates, leaving every trace of dirt and foreign metal behind. The pure copper is melted in a vacuum furnace and stretched into mirror-smooth rods and hair-thin wires.\n\nIndia is already one of the world's largest copper smelters. Upgrading domestic copper into electronic-grade purity captures high-margin domestic manufacturing profits instead of importing wiring from abroad.",
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
      "Multi-Stage Electrolytic Refining Cells (electrified liquid tanks that dissolve copper and redeposit only pure atoms)",
      "Vacuum Induction Melting Furnace (melts copper rods inside an airtight vacuum chamber without oxygen)",
      "Precision Continuous Wire Drawing Line (stretches copper rods into smooth, ultra-thin round wires)",
      "Atomic Emission Spectroscopy Scanner (laser sensor checking purity down to parts-per-billion)"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "Standard Refined Copper Cathode (99.99% commercial copper from Adani or Hindalco smelters)",
      "Ultra-Pure Copper Sulfate Solution (purified liquid electrolyte for electric refining)",
      "Demineralized Cleanroom Water (purified water free of dissolved minerals)",
      "Protective Nitrogen Gas (blankets molten copper so oxygen cannot react with it)"
    ],
    "offtakeBuyers": [
      "Semiconductor Bonding Wire Manufacturers (Heraeus, Tanaka, Indian packaging wire plants)",
      "Precision Leadframe Stampers (Mitsu, Shinko, domestic stamping houses)",
      "Tata Electronics & CG Semi (India's upcoming chip packaging and ATMP plants)",
      "Foxconn India & Dixon Technologies (Large-scale electronics contract manufacturers)"
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
    "sovereignMoat": "Enormous domestic electronics pull. Every smartphone, laptop, and electronic module assembled in India requires electronic copper pins and wires. With up to 70% government capex co-funding and local port proximity in Gujarat, this plant captures margins up to 42% on electronic grades (compared to just 8% on commodity copper) and enjoys immediate purchase orders from domestic packaging and wiring facilities.",
    "clearances": [
      "State Pollution Control Board Consent to Operate (CTE/CTO - validates zero-liquid-discharge water systems)",
      "Central Environment Clearance for Metallurgical Processing (certifies eco-friendly smelting controls)",
      "Factory Inspectorate Electrical & High-Voltage Permit (authorizes industrial electric refining tanks)",
      "Port Logistics & Cargo Handling License (enables direct coastal shipping from Mundra or Dahej)"
    ]
  },
  {
    "id": "high-purity-quartzite",
    "nodeNumber": 4,
    "name": "Ultra-Pure Quartz Sand & Silica Rock (High-Purity Quartzite / SiO2)",
    "tier": 0,
    "tierName": "Tier 0: Mined Raw Minerals & Foundational Commodities",
    "category": "Industrial Quartz & Glass",
    "description": "Natural quartz rock containing over 99.99% pure silicon dioxide. This is the ultimate starting ingredient for all silicon computer chips and solar cells on Earth. The rock is crushed, acid-washed, and refined to remove all iron, aluminum, and titanium impurities. The resulting ultra-white silica sand is melted into pure silicon metal or fused into heat-resistant quartz melting pots used inside 1,400°C silicon chip furnaces.\n\nInside the plant, raw mined quartzite rocks pass under optical laser cameras that spot and discard dirty rock fragments at high speeds. The white quartz is crushed into fine sand, soaked in hot acid baths to strip surface minerals, and passed through giant electromagnets that pull out every microscopic speck of magnetic dirt.\n\nIndia possesses rich natural quartzite deposits in Rajasthan and Andhra Pradesh that can be refined domestically rather than exported as cheap raw rock.",
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
      "Optical Color & Laser Ore Sorter (high-speed cameras that blow dirty rock fragments off conveyor belts)",
      "High-Pressure Autoclave Acid Leacher (steams quartz sand in hot acid to dissolve surface minerals)",
      "Thermal Shock Calcining Furnace (heats quartz to 900°C and plunges it into ice water to crack open trapped minerals)",
      "High-Intensity Magnetic Separator (giant electromagnets that pull out every speck of iron dirt)"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "Natural Mined Quartzite Lumps (naturally clear quartz rock mined in Rajasthan or Andhra Pradesh)",
      "Hydrofluoric & Hydrochloric Acid (chemical bath used to dissolve microscopic surface dirt)",
      "Demineralized Rinse Water (washed multiple times to leave zero chemical residue)",
      "Industrial Electrical Power (powers heavy crushing and electromagnetic separation lines)"
    ],
    "offtakeBuyers": [
      "Polysilicon & Solar Ingot Manufacturers (Adani Solar, Reliance New Energy, Tata Power Solar)",
      "Quartz Crucible Makers (producers of melting pots for silicon crystal pulling)",
      "Electronic Specialty Glass Refiners (producers of optical glass for photolithography lenses)",
      "Silicon Metal Smelters (furnaces producing raw silicon metal for export and domestic use)"
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
    "sovereignMoat": "Total foundation of India's silicon sovereignty. Without ultra-pure quartz sand, no polysilicon or wafer manufacturing can ever begin. Domestic processing eliminates dependence on a single global monopoly mine in Spruce Pine, USA. With 70% government grants under ISM and long-term contracts from solar and semiconductor ingot producers, this plant achieves high EBITDA margins of 32% to 44%.",
    "clearances": [
      "Central Ministry Mining & Environmental Clearance (approves sustainable quartz quarrying)",
      "State Pollution Control Board Operating Permit (authorizes closed-loop acid leaching systems)",
      "Forest Conservation Stage-I/II Approval (ensures quarrying respects forest buffer regulations)",
      "Explosives & Blasting Safety Concession (authorizes controlled quarry extraction)"
    ]
  },
  {
    "id": "petrochemical-epoxies-and-polymers",
    "nodeNumber": 5,
    "name": "Protective Black Resins & Packaging Plastics (Novolac Epoxies & Polymers)",
    "tier": 0,
    "tierName": "Tier 0: Mined Raw Minerals & Foundational Commodities",
    "category": "Protective Resins & Plastics",
    "description": "Specialized chemical resins and polymers synthesized from petroleum refining. In microchips, these resins form the hard black plastic casing that protects the silicon chip from moisture, vibration, and dust, as well as the ultra-thin insulating plastic layers inside computer motherboards. Because standard plastics expand and contract with temperature changes, electronic resins are engineered to withstand temperatures up to 250°C without warping or releasing gases.\n\nIn this factory, petrochemical feedstocks are piped into continuous heated reactors where chemical catalysts link them into long polymer chains. The liquid resin is stripped of volatile solvents under vacuum, mixed with fine silica powder to prevent heat expansion, and extruded into solid black plastic pellets ready for chip molders.\n\nIndia's vast petrochemical refineries in Gujarat provide the exact base chemicals needed to manufacture these high-value electronic resins locally.",
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
      "Continuous Chemical Polymerization Reactor (heated pressure vessel where raw chemicals link into resin molecules)",
      "High-Vacuum Thin-Film Evaporator (removes residual solvents and volatile smells from the resin)",
      "Twin-Screw Compounding Extruder (mixes melted resin with fine silica powder to create moldable pellets)",
      "Cryogenic Pellet Pulverizer (chills resin with liquid nitrogen and grinds it into ultra-fine black powder)"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "Cresol & Phenol Petrochemical Feedstocks (produced locally by Indian Oil, Reliance, and BPCL refineries)",
      "Formaldehyde & Epichlorohydrin (essential chemical cross-linkers that make resin hard)",
      "Ultra-Fine Spherical Silica Filler (microscopic glass balls mixed in to prevent heat expansion)",
      "Carbon Black Colorant (gives electronic chips their signature matte-black appearance)"
    ],
    "offtakeBuyers": [
      "Chip Packaging & Testing Fabs (Tata Electronics, Micron Sanand, CG Semi)",
      "Printed Circuit Board Fabricators (AT&S India, Shogini, Epitome Components)",
      "Automotive Electronics Assemblers (Bosch India, Uno Minda, Motherson Sumi)",
      "Consumer Electronics Assemblers (Foxconn, Dixon Technologies, Pegatron)"
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
    "sovereignMoat": "Enormous captive domestic demand. India's booming electronics assembly and upcoming ATMP chip packaging facilities require thousands of tons of protective resins every month, currently 100% imported from Japan and Taiwan. With 50% central plus 20% state capital subsidies, this plant achieves 30%+ operating margins and secures guaranteed purchase contracts from domestic chip packaging factories.",
    "clearances": [
      "State Pollution Board Chemical Manufacturing License (CTE/CTO for synthetic organic chemicals)",
      "Central Ministry Environmental Clearance for Petrochemical Derivatives (MoEFCC Category A)",
      "PESO License for Flammable Solvent Storage (authorizes safe underground tank storage)",
      "Fire & Industrial Hazardous Materials Safety Certification (certified automated deluge systems)"
    ]
  },
  {
    "id": "refractory-critical-metals",
    "nodeNumber": 6,
    "name": "Super-Hard Heat-Resistant Metals (Tungsten, Tantalum, Cobalt & Titanium)",
    "tier": 0,
    "tierName": "Tier 0: Mined Raw Minerals & Foundational Commodities",
    "category": "Super-Hard Industrial Metals",
    "description": "Ultra-dense, heat-resistant metals capable of withstanding temperatures exceeding 3,000°C. Inside modern microchips, these metals form microscopic electrical barriers that prevent copper atoms from migrating into the delicate silicon, and serve as microscopic electrical contacts that connect billions of transistors. They are also essential in high-temperature cleanroom furnace heating elements and defense avionics.\n\nThis factory takes mined ore concentrates or secondary recycled scrap and refines them into ultra-pure metal powders. The powders are baked in hydrogen furnaces to strip out oxygen and compacted under thousands of atmospheres of pressure into dense metal bars ready for chip factories.\n\nEstablishing domestic refining protects India from global export restrictions on critical defense and semiconductor metals.",
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
      "High-Temperature Hydrogen Reduction Furnace (bakes metal oxides under hydrogen gas to strip out oxygen)",
      "Vacuum Arc Remelting (VAR) Furnace (melts metal bars under high-current electric arcs in vacuum)",
      "Hot Isostatic Press (HIP) Chamber (crushes metal powder under 2,000 atmospheres of pressure into solid blocks)",
      "Wire Electrical Discharge (EDM) Cutter (uses electric sparks to cut super-hard metal into precision plates)"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "Mined Ore Concentrates (wolframite for tungsten, tantalite for tantalum, cobalt matte)",
      "Ultra-Pure Hydrogen Gas (used to react with metal oxides and leave pure metal behind)",
      "High-Purity Argon Shield Gas (creates an inert protective atmosphere inside melting furnaces)",
      "Nitric & Hydrofluoric Chemical Acids (cleans metal surfaces before melting)"
    ],
    "offtakeBuyers": [
      "Microchip Sputtering Target Fabricators (Plansee, Materion, domestic sputtering plants)",
      "Semiconductor Wafer Fabs (Tata Electronics Dholera, SCL Mohali, international fabs)",
      "Defense & Aerospace Manufacturers (DRDO, ISRO, HAL, Bharat Electronics)",
      "Precision Cutting Tool Manufacturers (Sandvik, Kennametal, Widia India)"
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
    "sovereignMoat": "Indispensable defense and semiconductor priority. These metals cannot be substituted by any cheaper alternative. Under the India Semiconductor Mission and Critical Minerals Scheme, the factory receives up to 70% capital subsidies, enjoys 32% to 48% operating margins, and secures guaranteed long-term offtake agreements from chip fabs, defense laboratories (DRDO), and aerospace component manufacturers.",
    "clearances": [
      "Central Ministry Environmental Clearance for Non-Ferrous Metallurgy (MoEFCC Category A)",
      "State Pollution Control Board Factory Operating License (validates fume filtration and water recovery)",
      "PESO High-Pressure Hydrogen System Certification (certifies safe storage of reduction hydrogen)",
      "Defense & Strategic Material Production Authorization (authorizes handling of strategic critical metals)"
    ]
  },
  {
    "id": "electronic-grade-polysilicon",
    "nodeNumber": 7,
    "name": "Hyper-Pure Silicon Rocks (Electronic-Grade Polysilicon / 11N Purity 99.999999999%)",
    "tier": 1,
    "tierName": "Tier 1: Refined Chemical Intermediates & Purified Specialty Gases",
    "category": "Hyper-Pure Silicon Feedstocks",
    "description": "Silicon refined to 99.999999999% purity—commonly known as eleven-nines electronic polysilicon. This is the master feedstock melted to create every computer silicon wafer on Earth. Standard solar-panel silicon is only 99.9999% pure, which is 100,000 times too dirty for computer microprocessors.\n\nIn this facility, raw silicon metal is reacted with hydrochloric acid to form trichlorosilane gas. The gas is distilled through towering fractionating columns that separate silicon molecules from every other element. The purified gas is pumped into sealed reactors where heated silicon rods glow at 1,100°C, causing atom-by-atom silicon vapor deposition until thick, gleaming silicon logs form.\n\nSetting up an electronic polysilicon plant in India unlocks complete self-reliance from mined rock to finished microchip.",
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
      "Direct Chlorination Reactors (precision cleanroom machine used in factory operations)",
      "Fractional Distillation Columns (precision cleanroom machine used in factory operations)",
      "Decomposition Chambers (precision cleanroom machine used in factory operations)"
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
    "sovereignMoat": "Monopolistic high-barrier business. Requires massive scale and deep chemical expertise. The Government of India co-funds up to 70% of capex under ISM 2.0. With global prices commanding high premiums over solar grades, this facility yields EBITDA margins of 38% to 52% with guaranteed purchases from wafer slicing plants.",
    "clearances": [
      "Environmental Clearance (Category A - Chemical & Metallurgical Complex)",
      "Consent to Establish (CTE) & Consent to Operate (CTO)",
      "PESO Hydrogen & Chlorosilane Storage License (government environmental & operating permit)",
      "Industrial Development Corporation Land Allotment (government environmental & operating permit)"
    ]
  },
  {
    "id": "specialty-rare-noble-gases",
    "nodeNumber": 8,
    "name": "Laser & Cleanroom Atmospheric Gases (Neon, Krypton, Xenon & Helium)",
    "tier": 1,
    "tierName": "Tier 1: Refined Chemical Intermediates & Purified Specialty Gases",
    "category": "Cleanroom Atmospheric Gases",
    "description": "Ultra-rare noble gases extracted from atmospheric air or steel mill exhaust streams. Neon and krypton are the exact gases used inside deep ultraviolet (DUV) photolithography lasers that print microscopic circuits onto silicon. Helium and xenon are used to cool silicon wafers and create plasma etching atmospheres.\n\nThis plant connects to large industrial steel mill oxygen plants. Atmospheric air is chilled down to minus 190°C until it turns into liquid air. The liquid air is boiled at micro-controlled temperatures so neon, krypton, and xenon boil off into separate collection tanks. The gases are further scrubbed through catalytic purifiers to achieve 99.99999% electronic purity.\n\nWar and supply bottlenecks in Eastern Europe previously froze global chip factories due to neon shortages. An Indian noble gas separation plant secures domestic chip fabs and commands high-value global export orders.",
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
      "Direct Chlorination Reactors (precision cleanroom machine used in factory operations)",
      "Fractional Distillation Columns (precision cleanroom machine used in factory operations)",
      "Decomposition Chambers (precision cleanroom machine used in factory operations)"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "Atmospheric Air (Processed through 50,000+ Nm3/hr Steel Mill ASUs)",
      "Crude Neon-Helium Gas Concentrate (high-purity factory ingredient)",
      "Helium-bearing Natural Gas Wells (Qatar, US, Algeria)",
      "Cryogenic Liquid Nitrogen Refrigeration (high-purity factory ingredient)",
      "Ultra-High Vacuum Dual-Valved Cylinders (high-purity factory ingredient)"
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
    "sovereignMoat": "High-margin strategic asset. Raw gas feedstocks are obtained at near-zero cost as side streams from existing Indian steel mills (like SAIL, Tata Steel, and JSW). ISM co-funding of up to 70% yields rapid capital payback in 2.8 years and EBITDA margins above 45%.",
    "clearances": [
      "Environmental Clearance (Category B - Industrial Gases & Cryogenics)",
      "Consent to Establish (CTE) & Consent to Operate (CTO)",
      "PESO High-Pressure Gas Cylinder Filling & Storage License (government environmental & operating permit)",
      "Host Steel Mill Co-Location & Off-Take Concession Agreement (government environmental & operating permit)"
    ]
  },
  {
    "id": "synthetic-fused-silica-quartz",
    "nodeNumber": 9,
    "name": "High-Heat Melting Pots & Factory Glass Tubes (Synthetic Fused Silica Quartz)",
    "tier": 1,
    "tierName": "Tier 1: Refined Chemical Intermediates & Purified Specialty Gases",
    "category": "High-Heat Factory Quartz Glass",
    "description": "Synthetic quartz glass manufactured from vaporized silicon chemicals rather than mined sand. It is used to manufacture giant melting crucibles (pots) and chemical furnace tubes used inside semiconductor fabs. When growing single-crystal silicon logs at 1,420°C, the molten silicon must sit in a container that will not dissolve, crack, or release even a single stray atom into the liquid.\n\nInside this factory, pure silicon tetrachloride chemical liquid is sprayed into intense hydrogen-oxygen flames burning at 2,000°C. The silicon vaporizes and condenses into large, crystal-clear glass cylinders called boules. These boules are heated and shaped into large cylindrical crucibles and seamless furnace process tubes.\n\nEvery silicon crystal pulled in a wafer factory destroys one quartz crucible. This creates constant recurring monthly revenue with zero cyclical downturns.",
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
      "Direct Chlorination Reactors (precision cleanroom machine used in factory operations)",
      "Fractional Distillation Columns (precision cleanroom machine used in factory operations)",
      "Decomposition Chambers (precision cleanroom machine used in factory operations)"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "Silicon Tetrachloride (SiCl4) High-Purity Liquid",
      "High-Purity Natural Quartz Sand (Spruce Pine IOTA standard)",
      "Industrial Hydrogen and Oxygen Gases (high-purity factory ingredient)",
      "Hydrofluoric & Nitric Acids for Quartz Etch Cleaning (high-purity factory ingredient)"
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
    "sovereignMoat": "Continuous consumable business model. Every wafer factory on earth consumes dozens of quartz crucibles weekly. With 70% government capex grants and captive demand from upcoming Indian wafer fabs, operating margins stand at 35% to 48% with reliable recurring cash flow.",
    "clearances": [
      "Environmental Clearance (Category B - Glass & Ceramic Manufacturing)",
      "Consent to Establish (CTE) & Consent to Operate (CTO)",
      "High-Voltage Power Connection & Substation Sanction (15 MVA)",
      "Industrial Land Allotment (government environmental & operating permit)"
    ]
  },
  {
    "id": "cleanroom-upw-infrastructure",
    "nodeNumber": 10,
    "name": "Hospital-Grade Spotless Cleanrooms & Ultra-Pure Water Plants (UPW Systems & Cleanrooms)",
    "tier": 2,
    "tierName": "Tier 2: Capital Equipment & Cleanroom Infrastructure",
    "category": "Cleanroom & Water Infrastructure",
    "description": "The specialized environmental infrastructure that keeps microchip factories functioning. A semiconductor fab requires cleanrooms where air is filtered so thoroughly that there is fewer than one microscopic dust speck per cubic foot of air. It also requires millions of liters of Ultra-Pure Water (UPW)—water stripped of every mineral, dissolved gas, and bacteria cell—to wash silicon wafers between circuit printing steps.\n\nIn this facility, city or river water undergoes 16 stages of reverse osmosis, ultraviolet radiation, and ion-exchange resin polishing until its electrical resistance reaches 18.2 Megaohm-centimeters (the theoretical limit of pure water). Air filtration systems circulate air through ceiling-wide fan filter units that catch particles smaller than 10 nanometers.\n\nBuilding domestic engineering capability in cleanroom air and water systems is the essential prerequisite before any chip factory can turn on its machines.",
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
      "Czochralski Crystal Pullers (precision cleanroom machine used in factory operations)",
      "Diamond Wire Saws (precision cleanroom machine used in factory operations)",
      "Chemical Mechanical Planarization (CMP)"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "PVDF (Polyvinylidene Fluoride) High-Purity Piping & Valves",
      "High-Flux Polyamide Reverse Osmosis (RO) Membranes",
      "185nm & 254nm Ultraviolet Quartz Lamps (high-purity factory ingredient)",
      "Nuclear-Grade Ion Exchange Resins (high-purity factory ingredient)",
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
    "sovereignMoat": "Essential turnkey infrastructure project. Fabs cannot operate for a single minute without uninterrupted UPW and air filtration. Supported by 50% central and 20% state subsidies, this venture achieves stable 22% to 32% operating margins with long-term maintenance contracts spanning 15+ years.",
    "clearances": [
      "Environmental Clearance (Category B - Industrial Infrastructure & Water Treatment)",
      "Consent to Establish (CTE) & Consent to Operate (CTO)",
      "Central Ground Water Authority (CGWA) NOC / Canal Allocation",
      "Industrial Single Window Clearance & Dholera DICDL Allotment (government environmental & operating permit)"
    ]
  },
  {
    "id": "etch-deposition-chambers",
    "nodeNumber": 11,
    "name": "Circuit-Carving Vacuum Ovens & Chemical Vapor Chambers (Etch, ALD & CVD Process Equipment)",
    "tier": 2,
    "tierName": "Tier 2: Capital Equipment & Cleanroom Infrastructure",
    "category": "Precision Circuit-Carving Machinery",
    "description": "Room-sized stainless steel vacuum machines that carve vertical circuit ditches into silicon disks and spray atomic layers of insulating glass and metal onto the wafer surface. In an etching chamber, energized chemical gas plasma dissolves tiny grooves into the silicon. In a chemical vapor deposition (CVD) chamber, gases react to lay down flawless microscopic wires and insulator layers.\n\nThis manufacturing plant produces high-vacuum robotic process chambers, magnetic levitation turbomolecular pumps, radio-frequency (RF) plasma generators, and automated robotic wafer transfer arms that move silicon disks between vacuum chambers without human touch.\n\nDeveloping domestic manufacturing of cleanroom vacuum chambers and plasma tools establishes India's independent machine-building sovereignty.",
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
      "Czochralski Crystal Pullers (precision cleanroom machine used in factory operations)",
      "Diamond Wire Saws (precision cleanroom machine used in factory operations)",
      "Chemical Mechanical Planarization (CMP)"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "High-Vacuum Chamber Aluminum (6061-T6 with specialized anodization)",
      "High-Purity Quartz & Silicon Carbide Plasma Rings (high-purity factory ingredient)",
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
    "sovereignMoat": "Highest-value equipment segment in semiconductor manufacturing, representing over 40% of total fab machinery expenditure. ISM 2.0 provides up to 50% central plus 20% state capex support, yielding 25% to 35% operating margins and high recurring spare-parts revenue.",
    "clearances": [
      "Environmental Clearance (Category B - Electronics Machinery Manufacturing)",
      "Consent to Establish (CTE) & Consent to Operate (CTO)",
      "PESO Specialty Toxic & Fluorinated Gas Storage License (government environmental & operating permit)",
      "KIADB Industrial Land Allotment (government environmental & operating permit)"
    ]
  },
  {
    "id": "ion-implantation-systems",
    "nodeNumber": 12,
    "name": "Microscopic Atomic Injectors (Ion Implantation Equipment)",
    "tier": 2,
    "tierName": "Tier 2: Capital Equipment & Cleanroom Infrastructure",
    "category": "Atomic Injection Machinery",
    "description": "High-voltage particle accelerators used in semiconductor fabs to turn pure silicon into active electrical switches. By shooting accelerated atoms of boron, phosphorus, or arsenic directly into the silicon crystal, the machine creates the positive (P) and negative (N) gates that form microscopic transistors.\n\nInside this equipment manufacturing facility, engineers assemble vacuum arc ion sources, 500,000-volt acceleration tubes, magnetic beam steerers that filter out incorrect atoms, and electrostatic scanning chucks that hold silicon wafers flat while the atomic beam scans across them.\n\nIon implanters are among the most technologically guarded machines on Earth. Building them in India guarantees access for automotive and power chip fabs.",
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
      "Czochralski Crystal Pullers (precision cleanroom machine used in factory operations)",
      "Diamond Wire Saws (precision cleanroom machine used in factory operations)",
      "Chemical Mechanical Planarization (CMP)"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "Sub-Atmospheric SDS Cylinders (AsH3, PH3, BF3, GeF4)",
      "High-Purity Tungsten & Molybdenum Arc Chamber Parts (high-purity factory ingredient)",
      "Superconducting or Rare-Earth Analyzing Magnets (high-purity factory ingredient)",
      "High-Voltage Ceramic Insulators (Alumina Al2O3)",
      "Cryogenic Vacuum Pumps (high-purity factory ingredient)"
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
    "sovereignMoat": "Strategic technology monopoly. Few companies worldwide possess ion beam engineering capabilities. Supported by government R&D and manufacturing capital grants of up to 70%, this venture commands operating margins of 30% to 45%.",
    "clearances": [
      "Atomic Energy Regulatory Board (AERB) Particle Accelerator License",
      "Environmental Clearance (Category B - Electronics Capital Goods)",
      "PESO Toxic Gas & SF6 Insulating Gas Storage License (government environmental & operating permit)",
      "TSIIC Industrial Land Allotment (government environmental & operating permit)"
    ]
  },
  {
    "id": "metrology-and-wafer-inspection",
    "nodeNumber": 13,
    "name": "Atomic-Scale Defect Scanners & Laser Microscopes (Wafer Metrology & Inspection Equipment)",
    "tier": 2,
    "tierName": "Tier 2: Capital Equipment & Cleanroom Infrastructure",
    "category": "Laser Defect Inspection Tools",
    "description": "High-speed laser inspection tools and electron microscopes that scan billions of microscopic circuits on silicon wafers to detect defects smaller than a virus. If a single dust speck or broken circuit wire goes unnoticed, an entire batch of microchips worth millions of dollars could be ruined.\n\nThis manufacturing plant builds high-precision laser scatterometers, automated deep-ultraviolet optical microscopes, and scanning electron microscope (SEM) columns. These tools use artificial intelligence image algorithms to inspect thousands of wafers daily in real time.\n\nEvery chip fab in India requires dozens of metrology tools to maintain high factory yields and prevent catastrophic production waste.",
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
      "Czochralski Crystal Pullers (precision cleanroom machine used in factory operations)",
      "Diamond Wire Saws (precision cleanroom machine used in factory operations)",
      "Chemical Mechanical Planarization (CMP)"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "Laser-Pumped Xenon Plasma Light Sources (Energetiq)",
      "Ultra-Flat Fused Silica Objective Optics (high-purity factory ingredient)",
      "Time Delay and Integration (TDI) High-Speed CCD/CMOS Sensors",
      "Schottky Field Emission Electron Sources (high-purity factory ingredient)",
      "Interferometric Laser Positioning Stages (high-purity factory ingredient)"
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
    "sovereignMoat": "Yield-critical fab equipment. Fabs willingly pay premium prices for tools that prevent multi-million-dollar wafer scrappage. ISM grants cover up to 70% of capex, providing 30% to 42% operating margins.",
    "clearances": [
      "Environmental Clearance (Category B - Electronics Assembly)",
      "Consent to Establish (CTE) & Consent to Operate (CTO)",
      "Atomic Energy Regulatory Board (AERB) Low-Energy X-Ray / SEM NOC",
      "KIADB Industrial Land Allotment (government environmental & operating permit)"
    ]
  },
  {
    "id": "photolithography-scanners",
    "nodeNumber": 14,
    "name": "Ultra-Precision Circuit Stencil Printers (Laser Photolithography Scanners & Steppers)",
    "tier": 2,
    "tierName": "Tier 2: Capital Equipment & Cleanroom Infrastructure",
    "category": "Circuit Stencil Printing Machines",
    "description": "The single most complex machine ever built by humans. Photolithography scanners project circuit blueprints onto light-sensitive silicon wafers using ultraviolet laser beams. The laser shines through a glass stencil (photomask), and a system of flawless mirrors and quartz lenses shrinks the circuit image down to nanometer scale onto the wafer surface.\n\nThis plant focuses on manufacturing high-precision trailing-edge (i-line, KrF, and ArF) lithography steppers, high-speed magnetic levitation wafer stages moving with nanometer accuracy, and laser projection optics.\n\nEstablishing domestic lithography tool manufacturing is the ultimate milestone of India's semiconductor equipment independence.",
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
      "Czochralski Crystal Pullers (precision cleanroom machine used in factory operations)",
      "Diamond Wire Saws (precision cleanroom machine used in factory operations)",
      "Chemical Mechanical Planarization (CMP)"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "Carl Zeiss Mo/Si Ultra-Smooth Extreme UV Mirrors (high-purity factory ingredient)",
      "TRUMPF / Cymer High-Power 30kW Pulsed CO2 Lasers (high-purity factory ingredient)",
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
    "sovereignMoat": "The ultimate technological pinnacle of electronics. Global supply is tightly constrained by Dutch and Japanese firms. ISM 2.0 provides up to 70% capex grants, yielding premier operating margins of 35% to 50%.",
    "clearances": [
      "Atomic Energy Regulatory Board (AERB) High-Power Laser License",
      "Environmental Clearance (Category B - Electronics Assembly)",
      "Consent to Establish (CTE) & Consent to Operate (CTO)",
      "PESO Fluorine Laser Gas Storage Approval (government environmental & operating permit)"
    ]
  },
  {
    "id": "ald-cvd-precursors",
    "nodeNumber": 15,
    "name": "Atomic Coating Chemical Gases (Atomic Layer Deposition & CVD Precursor Chemicals)",
    "tier": 3,
    "tierName": "Tier 3: Front-End Silicon Die Fabrication Materials",
    "category": "Specialty Chemical Coating Gases",
    "description": "Volatile liquid chemicals and gases synthesized to atom-level purity. When sprayed into vacuum ovens, these chemicals break down and deposit uniform films of silicon oxide, hafnium, titanium nitride, and tungsten onto silicon wafers.\n\nIn this specialty chemical synthesis plant, chemical reactions take place inside sealed stainless steel glovebox reactors under dry argon gas. The chemicals undergo multi-stage fractional vacuum distillation until metallic impurities fall below parts-per-trillion levels. The purified liquid is filled into electropolished stainless steel bubbler canisters.\n\nIndian fabs require continuous deliveries of precursor canisters every single month to keep their deposition ovens running.",
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
      "DUV/EUV Photolithography Scanners (precision cleanroom machine used in factory operations)",
      "Plasma Etchers (precision cleanroom machine used in factory operations)",
      "Ion Implantation Tools (precision cleanroom machine used in factory operations)",
      "Diffusion Furnaces (precision cleanroom machine used in factory operations)"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "Hafnium Tetrachloride (HfCl4)",
      "Tungsten Concentrates & Fluorine Gas (high-purity factory ingredient)",
      "Silicon Tetrachloride (SiCl4)",
      "Trialkylaluminum & Metal Chlorides (high-purity factory ingredient)",
      "Electropolished Stainless Steel 316L Ampoules (high-purity factory ingredient)"
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
    "sovereignMoat": "High-value recurring consumables. Fabs never switch chemical suppliers once qualified due to qualification risks. Capital co-funding of up to 70% under ISM yields 35% to 45% operating margins.",
    "clearances": [
      "Environmental Clearance (Category A - Organometallic Chemical Synthesis)",
      "Consent to Establish & Operate (CTE/CTO)",
      "PESO Pyrophoric Substance & High-Pressure Vessel License (government environmental & operating permit)",
      "DISH Factory License & Major Accident Hazard (MAH) Clearance"
    ]
  },
  {
    "id": "bare-silicon-wafer",
    "nodeNumber": 16,
    "name": "Mirror-Smooth Blank Silicon Disks (300mm & 200mm Silicon Wafers)",
    "tier": 3,
    "tierName": "Tier 3: Front-End Silicon Die Fabrication Materials",
    "category": "Mirror-Smooth Silicon Disks",
    "description": "Round circular silicon plates sliced from giant grown crystals and polished to atomic flatness. These blank disks are the physical foundation upon which every computer chip in the world is fabricated.\n\nIn this factory, hyper-pure polysilicon rocks are melted in quartz crucibles at 1,420°C. A tiny seed crystal is dipped into the melt and slowly pulled upward while spinning, growing a solid cylindrical silicon log weighing hundreds of kilograms. Diamond wire saws slice the log into thin round disks, which are laser-inspected and polished with diamond liquids until they are as reflective as mirrors.\n\nIndia currently imports 100% of its silicon wafers. A domestic wafer slicing and polishing plant provides the essential raw plates for Tata's Dholera fab and other upcoming Indian chipmakers.",
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
      "DUV/EUV Photolithography Scanners (precision cleanroom machine used in factory operations)",
      "Plasma Etchers (precision cleanroom machine used in factory operations)",
      "Ion Implantation Tools (precision cleanroom machine used in factory operations)",
      "Diffusion Furnaces (precision cleanroom machine used in factory operations)"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "11N Electronic-Grade Polysilicon (EG-Si)",
      "Ultra-High Purity Synthetic Fused Quartz Crucibles (high-purity factory ingredient)",
      "High-purity Graphite Heaters & Thermal Shields (high-purity factory ingredient)",
      "Diamond Plated Slicing Wire (high-purity factory ingredient)",
      "CMP Slurry & Polyurethane Polishing Pads (high-purity factory ingredient)"
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
    "sovereignMoat": "Massive captive market with guaranteed long-term offtake. Every chip factory in India requires tens of thousands of blank wafers each month. Supported by 70% government subsidies, operating margins average 25% to 35%.",
    "clearances": [
      "Environmental Clearance (Category A - Semiconductor Wafer Complex)",
      "Consent to Establish (CTE) & Consent to Operate (CTO)",
      "PESO Cryogenic Argon & Nitrogen Storage License (government environmental & operating permit)",
      "Factory License & High-Temperature Induction Furnace Approval (government environmental & operating permit)"
    ]
  },
  {
    "id": "cmp-slurries-and-polishing-pads",
    "nodeNumber": 17,
    "name": "Nanoscale Liquid Sandpaper & Polishing Pads (Chemical Mechanical Planarization / CMP Slurries)",
    "tier": 3,
    "tierName": "Tier 3: Front-End Silicon Die Fabrication Materials",
    "category": "Nanoscale Polishing Liquids",
    "description": "Chemical polishing liquids containing microscopic nanoparticles of silica, alumina, and cerium oxide suspended in ultra-clean water. During chip manufacturing, layers of metal wires and glass insulation create uneven microscopic hills. CMP slurry is poured over rotating polishing pads to buff the wafer completely flat before the next circuit layer is printed.\n\nThis chemical formulation plant blends high-purity chemical oxidizers and pH stabilizers with perfectly uniform ceramic nanoparticles. The liquid is filtered through sub-micron membranes and packaged into sealed chemical drums to ensure no particles clump together.\n\nWithout CMP polishing slurries, no modern multi-layer microchip can be built. This consumable product delivers high recurring sales every single day.",
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
      "DUV/EUV Photolithography Scanners (precision cleanroom machine used in factory operations)",
      "Plasma Etchers (precision cleanroom machine used in factory operations)",
      "Ion Implantation Tools (precision cleanroom machine used in factory operations)",
      "Diffusion Furnaces (precision cleanroom machine used in factory operations)"
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
    "sovereignMoat": "Pure recurring consumable business. Fabs consume dozens of barrels of slurry daily. Backed by 70% ISM grants and zero domestic manufacturing competitors, EBITDA margins reach 30% to 42%.",
    "clearances": [
      "Environmental Clearance (Category A - Chemical Blending & Polymer Processing)",
      "Consent to Establish & Operate (CTE/CTO)",
      "PESO Chemical Storage License (Isocyanates & Flammable Solvents)",
      "DISH Factory License & Cleanroom Workplace Safety Review (government environmental & operating permit)"
    ]
  },
  {
    "id": "dry-etch-specialty-gases",
    "nodeNumber": 18,
    "name": "Chamber-Cleaning & Circuit-Carving Dry Gases (NF3, SF6, CF4, C4F8 & Cl2)",
    "tier": 3,
    "tierName": "Tier 3: Front-End Silicon Die Fabrication Materials",
    "category": "Chamber-Cleaning Dry Gases",
    "description": "Compressed industrial gases engineered to carve microscopic electrical lines and clean vacuum oven chambers. Nitrogen trifluoride (NF3) is broken down by electric plasma into fluorine radicals that wash away stubborn silicon residue from chamber walls. Fluorocarbon gases (CF4, C4F8) carve sharp, deep trenches for transistor gates.\n\nIn this chemical plant, anhydrous hydrogen fluoride reacts with ammonia or chlorine to synthesize raw etching gases. The gases are cooled into liquids, distilled through multiple purification columns to remove moisture and trace air, and compressed into electropolished gas cylinders with dual-valved safety heads.\n\nSupplying these gases locally eliminates dangerous international sea shipments and secures India's chip manufacturing supply lines.",
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
      "DUV/EUV Photolithography Scanners (precision cleanroom machine used in factory operations)",
      "Plasma Etchers (precision cleanroom machine used in factory operations)",
      "Ion Implantation Tools (precision cleanroom machine used in factory operations)",
      "Diffusion Furnaces (precision cleanroom machine used in factory operations)"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "Anhydrous Hydrogen Fluoride (AHF)",
      "Anhydrous Ammonia (NH3)",
      "High-Purity Chlorine Gas (Cl2)",
      "Sulfur & Methane Precursors (high-purity factory ingredient)",
      "Electropolished Stainless Steel / Hastelloy Cylinders (high-purity factory ingredient)"
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
    "sovereignMoat": "Essential fab consumable. Fabs cannot run for a single day without cleaning and etching gases. With 70% government subsidies and local chemical cluster integration in Dahej, operating margins exceed 32%.",
    "clearances": [
      "Environmental Clearance (Category A - Specialty Toxic & Hazardous Gases)",
      "Consent to Establish & Operate (CTE/CTO)",
      "PESO Gas Cylinder Filling & High-Pressure Storage License (government environmental & operating permit)",
      "DISH Factory License & Major Accident Hazard (MAH) Compliance"
    ]
  },
  {
    "id": "photolithography-photoresists",
    "nodeNumber": 19,
    "name": "Light-Sensitive Circuit Paint & Resins (EUV, ArFi & KrF Photoresists)",
    "tier": 3,
    "tierName": "Tier 3: Front-End Silicon Die Fabrication Materials",
    "category": "Light-Sensitive Printing Resins",
    "description": "Light-sensitive chemical solutions painted across silicon wafers before laser printing. When the photolithography laser shines through the master stencil, the light changes the chemical structure of the photoresist paint, allowing chemical developers to wash away unexposed areas and leave behind microscopic stencil lines.\n\nThis specialty chemical formulation plant synthesizes specialized acrylic and phenolic polymers, dissolves photo-acid generator (PAG) molecules into ultra-pure organic solvents, and filters the liquid through 1-nanometer membranes in an amber-lit cleanroom where no ultraviolet light can cause premature reactions.\n\nPhotoresist is one of the highest-margin chemical products in the world, historically dominated by Japanese chemical firms.",
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
      "DUV/EUV Photolithography Scanners (precision cleanroom machine used in factory operations)",
      "Plasma Etchers (precision cleanroom machine used in factory operations)",
      "Ion Implantation Tools (precision cleanroom machine used in factory operations)",
      "Diffusion Furnaces (precision cleanroom machine used in factory operations)"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "Purified Specialty Acrylic & Norbornene Monomers (high-purity factory ingredient)",
      "Onium Salt Precursors (Photoacid Generators)",
      "Ultra-High Purity Electronic Solvents (PGMEA < 0.1 ppb metal trace)",
      "Organic Amine Quenchers (high-purity factory ingredient)",
      "Liquid Nitrogen for Temperature Control (high-purity factory ingredient)"
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
    "sovereignMoat": "Extremely high barrier to entry and massive profit margins (35% to 50%). Central and state subsidies cover up to 70% of capex. Guaranteed long-term customer lock-in once qualified by fabs.",
    "clearances": [
      "Environmental Clearance (Category A - Synthetic Organic Chemicals)",
      "Consent to Establish & Operate (CTE/CTO)",
      "PESO Flammable Solvent Storage & Dispense License (government environmental & operating permit)",
      "DISH Factory License & Chemical Process Safety Review (government environmental & operating permit)"
    ]
  },
  {
    "id": "photomasks-and-reticles",
    "nodeNumber": 20,
    "name": "Master Circuit Stencil Glass Plates (Photomasks & Lithography Reticles)",
    "tier": 3,
    "tierName": "Tier 3: Front-End Silicon Die Fabrication Materials",
    "category": "Master Glass Stencil Plates",
    "description": "Precision quartz glass plates coated with an ultra-thin layer of opaque chromium metal. Microscopic circuit blueprints are carved into the metal using high-energy electron beams. In the chip factory, laser light shines through this glass stencil to project the circuit image onto millions of silicon wafers.\n\nIn this photomask manufacturing facility, synthetic quartz plates are loaded into electron-beam pattern generators that write circuit lines for 24 continuous hours. The plate is chemically etched, washed with ultra-pure water, and inspected by lasers to verify that not a single dust speck or line error exists.\n\nEvery new microchip design created by Indian chip design engineers (like Qualcomm India or MediaTek India) requires a set of photomasks to enter production.",
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
      "DUV/EUV Photolithography Scanners (precision cleanroom machine used in factory operations)",
      "Plasma Etchers (precision cleanroom machine used in factory operations)",
      "Ion Implantation Tools (precision cleanroom machine used in factory operations)",
      "Diffusion Furnaces (precision cleanroom machine used in factory operations)"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "Synthetic Fused Silica Quartz Blanks (Hoya, AGC, Shin-Etsu)",
      "Chromium Sputtering Targets & Molybdenum Silicide Targets (high-purity factory ingredient)",
      "High-Resolution Electron Beam Resists (FEP, ZEP)",
      "Carbon Nanotube (CNT) Pellicles",
      "Chlorine & Oxygen High-Purity Etch Gases (high-purity factory ingredient)"
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
    "sovereignMoat": "Every chip design needs unique photomasks. With India hosting over 20% of the world's chip design engineers, a domestic photomask merchant shop has a massive captive local customer base, enjoying 35% to 45% operating margins.",
    "clearances": [
      "Environmental Clearance (Category A - Precision Micro-Fabrication)",
      "Consent to Establish & Operate (CTE/CTO)",
      "PESO Toxic Etch Gas Storage License (Chlorine & SF6)",
      "DISH Factory License & Cleanroom High-Voltage Safety Review (government environmental & operating permit)"
    ]
  },
  {
    "id": "pvd-sputtering-targets",
    "nodeNumber": 21,
    "name": "Microscopic Metal Spray Disks (PVD Sputtering Targets: Copper, Titanium & Tungsten)",
    "tier": 3,
    "tierName": "Tier 3: Front-End Silicon Die Fabrication Materials",
    "category": "Metal Vapor Coating Plates",
    "description": "High-density circular metal plates made of ultra-pure copper, titanium, tantalum, and aluminum. Inside vacuum sputtering machines, high-voltage electric plasma blasts atoms off the metal plate, spraying a uniform metallic coat over silicon wafers to create the microscopic electrical wiring that connects transistors.\n\nIn this metallurgical processing plant, ultra-pure metal ingots are forged, rolled, and vacuum-bonded onto copper backing plates. The target disks are machined on high-precision CNC lathes to exact tolerances, ultrasonically inspected for internal voids, and vacuum-sealed in foil packages.\n\nEvery chip fab and packaging plant consumes dozens of sputtering target disks every month as the metal is gradually consumed.",
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
      "DUV/EUV Photolithography Scanners (precision cleanroom machine used in factory operations)",
      "Plasma Etchers (precision cleanroom machine used in factory operations)",
      "Ion Implantation Tools (precision cleanroom machine used in factory operations)",
      "Diffusion Furnaces (precision cleanroom machine used in factory operations)"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "99.99% Grade A Copper Cathodes (high-purity factory ingredient)",
      "Refined Tantalum Metal Powder / K-Salt (high-purity factory ingredient)",
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
    "sovereignMoat": "High-margin recurring consumable. Sputtering targets must be replaced regularly. Backed by up to 70% capex co-funding, the venture captures 28% to 38% operating margins with strong domestic demand.",
    "clearances": [
      "Environmental Clearance (Category A - Metallurgical Smelting & Refining)",
      "Consent to Establish & Operate (CTE/CTO)",
      "PESO High-Pressure Vessel License (Argon HIP Chamber)",
      "DISH Factory License & Heavy Metallurgical Workplace Safety Review (government environmental & operating permit)"
    ]
  },
  {
    "id": "ultra-pure-wet-cleaning-acids",
    "nodeNumber": 22,
    "name": "Ultra-Clean Acid & Solvent Cleaners (Wet Cleaning Chemicals: UP-HF, H2SO4, H2O2 & IPA)",
    "tier": 3,
    "tierName": "Tier 3: Front-End Silicon Die Fabrication Materials",
    "category": "Ultra-Pure Cleaning Acids",
    "description": "Electronic-grade liquid acids and solvents including hydrofluoric acid (HF), sulfuric acid (H2SO4), hydrogen peroxide (H2O2), and isopropyl alcohol (IPA). These liquids clean silicon wafers between manufacturing steps, stripping away unwanted chemical residues and microscopic particles.\n\nIn this chemical purification plant, commercial acids are distilled through fluoropolymer columns, passed through multi-stage sub-micron filters, and filled into high-density polyethylene drums inside spotless cleanroom filling booths. Purity is maintained at parts-per-trillion levels.\n\nBecause liquid acids are bulky and dangerous to transport over long sea voyages, fabs strongly prefer buying from reliable local suppliers located near industrial chip corridors.",
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
      "DUV/EUV Photolithography Scanners (precision cleanroom machine used in factory operations)",
      "Plasma Etchers (precision cleanroom machine used in factory operations)",
      "Ion Implantation Tools (precision cleanroom machine used in factory operations)",
      "Diffusion Furnaces (precision cleanroom machine used in factory operations)"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "Acid-Grade Fluorspar (CaF2 >97% purity)",
      "Industrial Grade Sulfuric Acid (98% H2SO4)",
      "Propylene & Pure Acetone (for UP-IPA synthesis)",
      "Electronic Grade Anhydrous Ammonia Gas (high-purity factory ingredient)",
      "ASTM D5127 Type E-1 Ultra-Pure Water (high-purity factory ingredient)"
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
    "sovereignMoat": "Massive physical volume demand. Fabs consume tank-truck loads of cleaning chemicals every week. With 70% capex subsidies and close proximity to Gujarat and Assam chip hubs, margins range from 24% to 35%.",
    "clearances": [
      "Environmental Clearance (Category A - Bulk Heavy Inorganic Chemicals)",
      "Consent to Establish & Operate (CTE/CTO)",
      "PESO Toxic & Corrosive Chemical Storage License (government environmental & operating permit)",
      "DISH Factory License & Chemical Major Accident Hazard (MAH) Compliance"
    ]
  },
  {
    "id": "abf-package-substrate",
    "nodeNumber": 23,
    "name": "Multi-Layer Microscopic Circuit Boards (Ajinomoto Build-up Film / ABF High-Density Substrates)",
    "tier": 4,
    "tierName": "Tier 4: Packaging, Assembly & Interconnects (OSAT / ATMP)",
    "category": "Multi-Story Microscopic Circuit Substrates",
    "description": "High-density multi-layer organic circuit boards that sit directly underneath advanced computer chips like AI processors and smartphone CPUs. The silicon chip has thousands of microscopic electrical pads spaced nanometers apart; the ABF substrate spreads these tiny connections out into larger ball pins that can solder onto a computer motherboard.\n\nIn this advanced manufacturing plant, ultra-thin insulating resin films (ABF) are laminated over copper cores. Laser drillers burn millions of microscopic holes (micro-vias) through the film, and automated plating lines fill the holes with copper to create 16 to 24 stacked layers of high-speed wiring.\n\nGlobal shortages of ABF substrates previously halted worldwide automotive and game console manufacturing. Setting up a substrate factory in India secures the packaging foundation for domestic chip fabs.",
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
      "High-Speed Die Attach Tools (precision cleanroom machine used in factory operations)",
      "Wire Bonders (precision cleanroom machine used in factory operations)",
      "Molding Presses (precision cleanroom machine used in factory operations)",
      "ATE Testers (precision cleanroom machine used in factory operations)"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "Ajinomoto Build-up Film (ABF dielectric resin)",
      "Ultra-thin Electrolytic Copper Foil (high-purity factory ingredient)",
      "Woven Glass Fiber Cloth (high-purity factory ingredient)",
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
    "sovereignMoat": "Extreme technological barrier with critical global supply shortages. Supported by 50% central plus 20% state capex subsidies under ISM 2.0, this plant commands operating margins of 32% to 45%.",
    "clearances": [
      "Environmental Clearance (Category A - Electronics & Electroplating Complex)",
      "Consent to Establish & Operate (CTE/CTO)",
      "PESO Hazardous Chemical Storage License (Acids, Cyanide, Oxidizers)",
      "DISH Factory License & Cleanroom Occupational Safety Review (government environmental & operating permit)"
    ]
  },
  {
    "id": "bonding-wire",
    "nodeNumber": 24,
    "name": "Microscopic Golden & Copper Connector Wires (Semiconductor Bonding Wires)",
    "tier": 4,
    "tierName": "Tier 4: Packaging, Assembly & Interconnects (OSAT / ATMP)",
    "category": "Microscopic Golden Wiring",
    "description": "Ultra-thin wires drawn from pure gold, copper, silver, and palladium-coated copper. When microchips are assembled, high-speed robotic wire-bonding machines weld these microscopic threads between the electrical pads on the silicon chip and the external metal pins of the package, firing 20 wire welds every single second.\n\nInside this precision manufacturing plant, pure precious metal bars are continuously cast into thin rods and drawn through a sequence of natural diamond dies until the wire diameter shrinks down to 15 microns (five times thinner than a human hair). The wire is annealed in protective gas and spooled onto precision cleanroom spools.\n\nEvery chip packaging factory in India consumes hundreds of kilometers of bonding wire every day.",
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
      "High-Speed Die Attach Tools (precision cleanroom machine used in factory operations)",
      "Wire Bonders (precision cleanroom machine used in factory operations)",
      "Molding Presses (precision cleanroom machine used in factory operations)",
      "ATE Testers (precision cleanroom machine used in factory operations)"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "99.999% 5N Ultra-Pure Copper Rods (high-purity factory ingredient)",
      "99.99% 4N Refined Gold Bullion (high-purity factory ingredient)",
      "High-Purity Palladium Metal Sponge (high-purity factory ingredient)",
      "Precision Diamond Wire Drawing Dies (high-purity factory ingredient)",
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
    "sovereignMoat": "High-turnover consumable directly tied to India's rapidly growing ATMP factories (Micron, Tata, CG Semi). Subsidized up to 70% by government grants, the plant achieves 25% to 35% operating margins.",
    "clearances": [
      "Environmental Clearance (Category A - Precious Metallurgy & Wire Drawing)",
      "Consent to Establish & Operate (CTE/CTO)",
      "PESO Hydrogen Gas Storage & Tube Furnace License (government environmental & operating permit)",
      "DISH Factory License & High-Speed Wire Drawing Safety Review (government environmental & operating permit)"
    ]
  },
  {
    "id": "bt-package-substrate",
    "nodeNumber": 25,
    "name": "Rigid Memory Chip Mounting Boards (Bismaleimide Triazine / BT Substrates)",
    "tier": 4,
    "tierName": "Tier 4: Packaging, Assembly & Interconnects (OSAT / ATMP)",
    "category": "Rigid Chip Mounting Substrates",
    "description": "High-heat, rigid fiberglass circuit boards made with specialized bismaleimide-triazine resin. They are the universal standard mounting board for mobile DRAM memory chips, flash storage chips, and automotive microcontrollers.\n\nInside this factory, fiberglass sheets impregnated with BT resin are laminated under high-pressure heated hydraulic presses. Precision mechanical drill bits drill thousands of tiny holes, and chemical plating baths deposit copper traces. The boards are coated with solder mask paint and gold-plated on surface contact pads.\n\nAs India ramps up smartphone and automotive electronics assembly, domestic packaging plants need millions of BT substrate strips every month.",
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
      "High-Speed Die Attach Tools (precision cleanroom machine used in factory operations)",
      "Wire Bonders (precision cleanroom machine used in factory operations)",
      "Molding Presses (precision cleanroom machine used in factory operations)",
      "ATE Testers (precision cleanroom machine used in factory operations)"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "BT Resin (Mitsubishi Gas Chemical supply)",
      "Ultra-Fine Woven Glass Cloth (high-purity factory ingredient)",
      "Electrodeposited Copper Foil (high-purity factory ingredient)",
      "ENIG Gold & Nickel Salts (high-purity factory ingredient)"
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
    "sovereignMoat": "High-volume captive demand from memory packaging and microcontroller OSAT plants. 70% capex co-funding yields attractive 26% to 36% EBITDA margins and fast 3.2-year payback.",
    "clearances": [
      "Environmental Clearance (Category A - Electronic PCB & Substrate Fabrication)",
      "Consent to Establish & Operate (CTE/CTO)",
      "PESO Chemical Storage License (Acids & Plating Reagents)",
      "DISH Factory License & High-Speed Tooling Workplace Safety Review (government environmental & operating permit)"
    ]
  },
  {
    "id": "epoxy-molding-compound-emc",
    "nodeNumber": 26,
    "name": "Protective Black Plastic Casings (Epoxy Molding Compound / EMC & Underfills)",
    "tier": 4,
    "tierName": "Tier 4: Packaging, Assembly & Interconnects (OSAT / ATMP)",
    "category": "Protective Black Plastic Sealing",
    "description": "Solid black epoxy plastic pellets melted over computer chips during packaging. The plastic encapsulates the delicate silicon chip and microscopic golden wires, hardening into a rock-solid protective block that seals out moisture, stops vibrations, and pulls heat away from the chip during operation.\n\nIn this compounding plant, solid epoxy resin flakes, phenolic hardeners, flame retardants, and microscopic spherical silica powder are blended in high-speed mixers. The mixture is heated and kneaded in continuous extruders, cooled into solid sheets, and stamped into hard circular pellets.\n\nEvery single semiconductor chip packaged in India requires epoxy molding compound to seal and finish the product.",
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
      "High-Speed Die Attach Tools (precision cleanroom machine used in factory operations)",
      "Wire Bonders (precision cleanroom machine used in factory operations)",
      "Molding Presses (precision cleanroom machine used in factory operations)",
      "ATE Testers (precision cleanroom machine used in factory operations)"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "High-Purity Spherical Fused Silica Powder (99.99% SiO2)",
      "Epichlorohydrin & Bisphenol-A / Novolac Feedstocks (high-purity factory ingredient)",
      "Phenolic Curing Agents (high-purity factory ingredient)",
      "Silane Coupling Agents (high-purity factory ingredient)",
      "Natural Carnauba Wax (high-purity factory ingredient)"
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
    "sovereignMoat": "Universal packaging consumable. 100% of packaged chips require molding compound. Supported by 70% government grants, this facility achieves 28% to 38% operating margins with steady recurring cash flows.",
    "clearances": [
      "Consent to Establish (CTE) & Operate (CTO) for Specialty Chemical Compounding",
      "Environmental Clearance (EC) - Category B Formulation & Compounding",
      "Petroleum & Explosives Safety Organization (PESO) Solvent & Gas Storage License",
      "Hazardous Waste Handling & Management Authorization (government environmental & operating permit)"
    ]
  },
  {
    "id": "solder-balls-and-microbumps",
    "nodeNumber": 27,
    "name": "Microscopic Solder Balls & Connector Paste (Solder Spheres & Micro-Bumps)",
    "tier": 4,
    "tierName": "Tier 4: Packaging, Assembly & Interconnects (OSAT / ATMP)",
    "category": "Microscopic Soldering Balls",
    "description": "Perfectly spherical metal alloy balls measuring less than half a millimeter in diameter, made from lead-free alloys of tin, silver, and copper. In modern flip-chip packaging, hundreds of these microscopic beads are placed on the bottom of the chip. When heated in an oven, the balls melt and solder the chip onto circuit boards.\n\nInside this precision manufacturing plant, molten solder alloy is dropped through high-speed vibrating ultrasonic nozzles into a cooling oil column. Surface tension pulls each liquid droplet into a perfect sphere as it freezes. The spheres are sorted by size through precision air-classifiers and inspected under digital microscopes.\n\nSupplying solder spheres and solder pastes locally feeds the entire Indian electronics assembly ecosystem.",
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
      "High-Speed Die Attach Tools (precision cleanroom machine used in factory operations)",
      "Wire Bonders (precision cleanroom machine used in factory operations)",
      "Molding Presses (precision cleanroom machine used in factory operations)",
      "ATE Testers (precision cleanroom machine used in factory operations)"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "99.99% Ultra-Pure Refined Tin (Sn) Ingots",
      "99.99% Refined Silver (Ag) Grain",
      "Ultra-Pure Copper (Cu)",
      "Modified Hydrogenated Rosin / Synthetic Activators (high-purity factory ingredient)",
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
    "sovereignMoat": "High-volume recurring electronics consumable. With 70% capex grants and local proximity to major assembly corridors in Noida and Chennai, the plant achieves 25% to 34% EBITDA margins.",
    "clearances": [
      "Environmental Clearance (Category A - Metallurgical Melting & Powder Processing)",
      "Consent to Establish & Operate (CTE/CTO)",
      "PESO Flammable Solvent Storage License (Isopropanol)",
      "DISH Factory License & Molten Metal Workplace Safety Review (government environmental & operating permit)"
    ]
  },
  {
    "id": "stamped-etched-leadframes",
    "nodeNumber": 28,
    "name": "Precision Metal Connector Frames (Stamped & Etched Copper Alloy Leadframes)",
    "tier": 4,
    "tierName": "Tier 4: Packaging, Assembly & Interconnects (OSAT / ATMP)",
    "category": "Metal Connector Frames",
    "description": "Thin metallic frames stamped or chemically etched from copper alloys. The leadframe holds the silicon chip during assembly and provides the external metal legs or pins that solder directly onto gadget circuit boards.\n\nIn this precision manufacturing facility, high-speed stamping presses punch thousands of intricate leadframe patterns per minute from continuous copper strips. Alternatively, chemical etching lines spray acid through photo-stencils to dissolve metal gaps with micron precision. The contact pads are plated with silver or nickel to ensure reliable electrical bonding.\n\nLeadframes are the most widely used packaging format in automotive electronics, power converters, and consumer home appliances.",
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
      "High-Speed Die Attach Tools (precision cleanroom machine used in factory operations)",
      "Wire Bonders (precision cleanroom machine used in factory operations)",
      "Molding Presses (precision cleanroom machine used in factory operations)",
      "ATE Testers (precision cleanroom machine used in factory operations)"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "High-Purity Copper Alloy Strips (C194, C7025)",
      "Ferric Chloride (FeCl3) Etching Acid",
      "Dry Film Photoresist (DFR)",
      "Electroplating Salts (Silver Cyanide or MSA-based silver, Palladium salts, Gold salts)",
      "Nitric Acid for Stripping (high-purity factory ingredient)"
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
    "sovereignMoat": "High-volume automotive and industrial market demand. Supported by 70% government co-funding, this venture captures 22% to 32% operating margins with long-term contracts from domestic packaging plants.",
    "clearances": [
      "Environmental Clearance (Category A - Metallurgical Stamping & Electroplating)",
      "Consent to Establish & Operate (CTE/CTO)",
      "PESO Toxic Cyanide Salt & Chemical Storage License (government environmental & operating permit)",
      "DISH Factory License & High-Speed Punching Press Workplace Safety Review (government environmental & operating permit)"
    ]
  },
  {
    "id": "thermal-interface-materials-and-lids",
    "nodeNumber": 29,
    "name": "Chip Cooling Radiators & Heat-Dispersing Pastes (Thermal Interface Materials / TIM & Lids)",
    "tier": 4,
    "tierName": "Tier 4: Packaging, Assembly & Interconnects (OSAT / ATMP)",
    "category": "Chip Heat Sinks & Cooling Pastes",
    "description": "Heat-conducting metal lids and specialty thermal pastes placed on top of high-performance microchips. Fast processors generate intense heat that would destroy the silicon if not instantly carried away into a cooling radiator.\n\nThis manufacturing plant produces nickel-plated copper heat spreaders (lids) stamped to sub-micron flatness, as well as thermal gap pads and liquid thermal greases filled with microscopic diamond and silver particles that conduct heat 100 times better than air.\n\nEvery AI server chip, electric vehicle motor computer, and gaming processor requires a thermal lid and heat interface material.",
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
      "High-Speed Die Attach Tools (precision cleanroom machine used in factory operations)",
      "Wire Bonders (precision cleanroom machine used in factory operations)",
      "Molding Presses (precision cleanroom machine used in factory operations)",
      "ATE Testers (precision cleanroom machine used in factory operations)"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "Oxygen-Free Copper Sheets (99.99% Cu)",
      "Refined Indium Metal (In 99.99%)",
      "Nickel Sulfamate Plating Salts (high-purity factory ingredient)",
      "Boron Nitride & Synthetic Diamond Powders (high-purity factory ingredient)"
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
    "sovereignMoat": "Critical thermal management market driven by high-power AI accelerators and electric vehicle electronics. 70% government subsidies yield 28% to 38% operating margins with fast 3.2-year payback.",
    "clearances": [
      "Consent to Establish (CTE) & Consent to Operate (CTO) for Metal Finishing",
      "MOEFCC Environmental Clearance (Category B - Electroplating & Secondary Metallurgy)",
      "Factory Directorate Heavy Press Safety & Machinery Operation License (government environmental & operating permit)",
      "Hazardous Waste Handling & Plating Sludge Disposal Authorization (government environmental & operating permit)"
    ]
  },
  {
    "id": "advanced-logic-accelerator",
    "nodeNumber": 30,
    "name": "Brain Chips for AI Supercomputers & Cloud Servers (AI GPUs & Microprocessor Accelerators)",
    "tier": 5,
    "tierName": "Tier 5: Packaged Semiconductor Devices",
    "category": "Supercomputing Brain Chips",
    "description": "Massive microprocessor silicon chips containing tens of billions of microscopic transistors. Designed to process complex artificial intelligence models, cloud data center workloads, and neural network simulations at incredible speeds.\n\nThis venture partners with leading global foundries and Indian ATMP packaging plants to fabricate and assemble high-performance AI accelerator chips. Multiple silicon dies—including computing processor logic and high-bandwidth memory chips—are mounted side-by-side on silicon interposers inside a single powerful package.\n\nIndia currently spends billions of dollars importing foreign AI chips. Developing sovereign Indian AI processors powers the nation's data centers, military defense systems, and public AI infrastructure.",
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
      "Pick-and-Place SMT Lines (precision cleanroom machine used in factory operations)",
      "Reflow Ovens (precision cleanroom machine used in factory operations)",
      "Automated Optical Inspection (AOI)"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "300mm Monocrystalline Prime Silicon Wafers (high-purity factory ingredient)",
      "EUV & ArFi Photoresists & TMAH Developer (high-purity factory ingredient)",
      "Ajinomoto Build-up Film (ABF)",
      "Ultra-High Purity Copper Sputtering Targets & Plating Chemistry (high-purity factory ingredient)",
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
    "sovereignMoat": "Highest-value product in the global technology ecosystem. Backed by the IndiaAI Mission and ISM 2.0 with up to 70% capital co-funding, this business captures 40% to 55% gross margins and commands long-term sovereign cloud contracts.",
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
    "name": "Car & Industrial Control Chips (Automotive Microcontrollers & Power Regulators)",
    "tier": 5,
    "tierName": "Tier 5: Packaged Semiconductor Devices",
    "category": "Automotive & Gadget Brain Chips",
    "description": "Rugged, ultra-reliable microcontrollers and power management chips engineered to operate in freezing cold, blistering engine heat, and severe electrical noise without ever crashing or glitching.\n\nFabricated on proven 28nm and 40nm manufacturing processes, these chips combine computer processing cores, flash program memory, and analog sensors onto a single silicon chip. They are packaged in rugged heat-resistant casings and tested under strict automotive temperature extremes (-40°C to +150°C).\n\nIndia is one of the world's largest automobile and electric two-wheeler manufacturers. Every car requires over 1,000 microcontrollers to operate.",
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
      "Pick-and-Place SMT Lines (precision cleanroom machine used in factory operations)",
      "Reflow Ovens (precision cleanroom machine used in factory operations)",
      "Automated Optical Inspection (AOI)"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "200mm & 300mm Polished Silicon Wafers (high-purity factory ingredient)",
      "Copper Alloy Leadframe Strips (C194)",
      "Palladium-Coated Copper Bonding Wire (high-purity factory ingredient)",
      "Standard DUV / i-line Photoresists (high-purity factory ingredient)",
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
    "sovereignMoat": "Massive guaranteed domestic automotive demand (Tata Motors, Mahindra, Maruti, Bajaj). Automotive chips have long product lifecycles of 10 to 15 years with zero consumer tech obsolescence. ISM 70% capex co-funding yields 30% to 42% operating margins.",
    "clearances": [
      "Consent to Establish (CTE) & Consent to Operate (CTO) for Semiconductor Packaging",
      "IATF 16949 Automotive Quality Management System Certification (government environmental & operating permit)",
      "AEC-Q100 Automotive IC Stress Test Reliability Qualification (government environmental & operating permit)",
      "ISO 26262 ASIL-D Functional Safety Certification (government environmental & operating permit)"
    ]
  },
  {
    "id": "hbm-dram-memory",
    "nodeNumber": 32,
    "name": "Ultra-Fast Stacked Memory for AI Chips (High-Bandwidth Memory / HBM & DRAM)",
    "tier": 5,
    "tierName": "Tier 5: Packaged Semiconductor Devices",
    "category": "Ultra-Fast High-Bandwidth Memory",
    "description": "High-speed dynamic memory chips stacked on top of one another like a multi-story building. By connecting memory dies vertically using thousands of microscopic copper pillars (Through-Silicon Vias), data travels between memory and AI processors with near-zero latency and massive bandwidth.\n\nIn this advanced packaging facility, thin DRAM memory wafers are sliced and vertically stacked up to 12 layers high. Automated thermo-compression bonders align and weld thousands of microscopic solder micro-bumps simultaneously, creating a single compact 3D memory cube.\n\nHBM memory is the single biggest bottleneck in building AI servers worldwide. Packaging HBM memory locally makes India an essential hub for global AI hardware.",
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
      "Pick-and-Place SMT Lines (precision cleanroom machine used in factory operations)",
      "Reflow Ovens (precision cleanroom machine used in factory operations)",
      "Automated Optical Inspection (AOI)"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "12-inch 300mm Prime Silicon Wafers (high-purity factory ingredient)",
      "EUV Photoresist & Developer (high-purity factory ingredient)",
      "Micro-bump Electroplating Chemicals (Cu, Sn, Ag)",
      "Advanced Liquid Epoxy Resins / Non-Conductive Film (NCF)",
      "Diamond Dicing Blades & Stealth Laser Slicing systems (high-purity factory ingredient)"
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
    "sovereignMoat": "Extreme global demand driven by the worldwide artificial intelligence boom. Supported by 70% government subsidies, this facility commands premier operating margins of 35% to 50%.",
    "clearances": [
      "Consent to Establish (CTE) & Consent to Operate (CTO) for Memory Packaging",
      "Ministry of Electronics & IT (MeitY) India Semiconductor Mission (ISM) Sanction",
      "JEDEC Solid State Technology Association Memory Compliance Certification (government environmental & operating permit)",
      "Hazardous Chemicals & Pressurized Gas Storage License (government environmental & operating permit)"
    ]
  },
  {
    "id": "nand-flash-memory",
    "nodeNumber": 33,
    "name": "Mass Storage Memory for Phones & USBs (3D NAND Flash Memory)",
    "tier": 5,
    "tierName": "Tier 5: Packaged Semiconductor Devices",
    "category": "Phone & Gadget Mass Storage Memory",
    "description": "Non-volatile flash memory chips that store gigabytes and terabytes of photos, operating systems, and applications inside smartphones, solid-state drives (SSDs), and digital cameras.\n\nInside this high-volume fab, hundreds of microscopic memory cells are stacked vertically on top of silicon wafers like microscopic skyscrapers reaching over 200 layers tall. This vertical architecture packs immense storage capacity into a chip smaller than a postage stamp.\n\nIndia is the world's second-largest smartphone market, consuming billions of gigabytes of flash storage every single year.",
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
      "Pick-and-Place SMT Lines (precision cleanroom machine used in factory operations)",
      "Reflow Ovens (precision cleanroom machine used in factory operations)",
      "Automated Optical Inspection (AOI)"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "300mm Prime Silicon Wafers (high-purity factory ingredient)",
      "Nitrogen Trifluoride (NF3) & Xenon (Xe) Etch Gases",
      "Tungsten Hexafluoride (WF6) Precursor",
      "BT Substrates & Gold/Cu Wire Bonds (high-purity factory ingredient)"
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
    "sovereignMoat": "Universal high-volume domestic commodity with non-stop consumer demand. Backed by 70% government capex grants, this plant achieves high economies of scale, 26% to 36% operating margins, and rapid payback.",
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
    "name": "Electric Car & Solar Power Switch Chips (Silicon Carbide SiC & GaN Power Semiconductors)",
    "tier": 5,
    "tierName": "Tier 5: Packaged Semiconductor Devices",
    "category": "Electric Car & Grid Power Chips",
    "description": "Rugged wide-bandgap semiconductor chips made from silicon carbide (SiC) and gallium nitride (GaN). Unlike standard silicon chips that overheat and break down at high voltages, these power chips operate efficiently at thousands of volts, increasing electric vehicle driving range by 10% and slashing charging times in half.\n\nInside this dedicated power fab, compound semiconductor wafers are processed to build high-voltage MOSFET switches and Schottky diodes. The chips are mounted onto ceramic direct-bonded-copper (DBC) plates that transfer heat directly into car radiator cooling systems.\n\nIndia's massive transition to electric buses, electric scooters, solar farms, and high-speed electric trains creates guaranteed multi-year purchase orders for power chips.",
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
      "Pick-and-Place SMT Lines (precision cleanroom machine used in factory operations)",
      "Reflow Ovens (precision cleanroom machine used in factory operations)",
      "Automated Optical Inspection (AOI)"
    ],
    "keyMachineryImported": [],
    "keyMachineryDomestic": [],
    "primaryRawMaterials": [
      "Single-Crystal Silicon Carbide (4H-SiC) Wafers",
      "High-purity Silane (SiH4) and Propane (C3H8) for Epitaxy",
      "Direct Bonded Copper (DBC) Silicon Nitride Ceramic Substrates",
      "Nano-Silver Sintering Pastes (high-purity factory ingredient)",
      "High-purity Aluminum & Copper Wire Rods (high-purity factory ingredient)"
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
    "sovereignMoat": "The fastest-growing semiconductor market worldwide. Supported by 70% central and state capital grants under ISM, operating profit margins reach 32% to 45% with guaranteed long-term offtake from electric vehicle and solar inverter manufacturers.",
    "clearances": [
      "Consent to Establish (CTE) & Consent to Operate (CTO) for Power Electronics",
      "IATF 16949 Automotive Quality Management System Certification (government environmental & operating permit)",
      "AQG 324 Automotive Power Module Reliability Qualification (government environmental & operating permit)",
      "Central Electricity Authority (CEA) / RDSO Railway Traction Certification"
    ]
  }
]
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
