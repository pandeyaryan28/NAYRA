import type { LocationHub } from "../types/index";

export const INDIA_LOCATIONS: LocationHub[] = [
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
    "vibrationSeismic": {
      "seismicZone": "Zone III (Moderate). Deep pile bedrock engineering utilized for heavy fab floor isolation.",
      "vibrationGrade": "Engineered to satisfy Vibration Criterion VC-E (3.12 µm/s) and VC-F for sub-3nm EUV/DUV steppers. Isolated from heavy freight rail corridors by 3km green buffers."
    },
    "logisticsConnectivity": {
      "airCargo": "Dholera International Cargo Airport (operational 2025-2026, 4,000m runway) located 15 km away with dedicated cold-chain perishables handling for photoresists.",
      "ports": "Pipavav Port (200km), Mundra Port (350km), and Hazira Port (280km) for bulk chemical and tool shipping.",
      "expressways": "Ahmedabad-Dholera 4-lane expressway and semi-high-speed regional rail."
    },
    "chemicalEcosystem": {
      "proximity": "Direct access to Dahej Petroleum, Chemicals and Petrochemicals Investment Region (PCPIR) 120km away — seamless sourcing of UP-HF, sulfuric acid, solvents, and specialty gases."
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
    "vibrationSeismic": {
      "seismicZone": "Zone III.",
      "vibrationGrade": "Meets VC-C and VC-D criteria, ideal for high-speed wire bonders, flip-chip pick-and-place, and wafer dicing saws."
    },
    "logisticsConnectivity": {
      "airCargo": "Sardar Vallabhbhai Patel International Airport (Ahmedabad - AMD) 35 km away via 6-lane highway (under 45 min transit for air freight).",
      "highways": "NH-47 & Western Dedicated Freight Corridor (DFC) link."
    },
    "chemicalEcosystem": {
      "proximity": "Vibrant plastics, resins, and metallurgy ecosystem in Ahmedabad-Vadodara industrial belt."
    },
    "recommendedComponents": [
      "OSAT / ATMP Memory & Logic Packaging",
      "Package Substrates (BT & ABF Substrates)",
      "Bonding Wires (Gold, Copper, Silver)",
      "Solder Spheres & Micro-Bumps",
      "Leadframes (Etched & Stamped Copper Alloys)",
      "Epoxy Molding Compound (EMC) & Underfills"
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
    "vibrationSeismic": {
      "seismicZone": "Zone IV (Requires deep seismic dampers and raft foundations for sub-10nm lithography tools).",
      "vibrationGrade": "VC-D compliant; requires vibration isolation trenches near highway corridors."
    },
    "logisticsConnectivity": {
      "airCargo": "Noida International Airport (Jewar) directly adjacent (<10km) featuring a multi-modal cargo hub with dedicated perishables and cleanroom air transit.",
      "expressways": "Yamuna Expressway, Eastern Peripheral Expressway, and DFC Dadri junction."
    },
    "chemicalEcosystem": {
      "proximity": "Proximity to Mathura refinery and northern chemical industrial clusters."
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
    "vibrationSeismic": {
      "seismicZone": "Zone II (Lowest seismic risk in India!). Stable peninsular crystalline shield bedrock provides world-class vibration damping.",
      "vibrationGrade": "Exceptional natural geological stability meeting VC-E criteria with minimal sub-surface dampening needed."
    },
    "logisticsConnectivity": {
      "airCargo": "Chennai International Airport (MAA) 32 km away with extensive global semiconductor cold-chain flights.",
      "ports": "Chennai Port & Ennore Port (45-55 km) offering rapid sea freight to Southeast Asia and East Asia."
    },
    "chemicalEcosystem": {
      "proximity": "Manali petrochemical complex and Cuddalore chemical zone within 100-150 km."
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
    "vibrationSeismic": {
      "seismicZone": "Zone II (Extremely stable Deccan Archean granite bedrock). Superb vibration stability.",
      "vibrationGrade": "Natural VC-E compliance."
    },
    "logisticsConnectivity": {
      "airCargo": "Kempegowda International Airport (BLR) with dedicated coolport facilities and direct semiconductor freighters.",
      "expressways": "Bengaluru-Mysuru 10-lane expressway (transit time ~75 mins)."
    },
    "chemicalEcosystem": {
      "proximity": "Specialized cleanroom chemical distributors and testing laboratories."
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
    "vibrationSeismic": {
      "seismicZone": "Zone V (High seismic activity). Requires world-class base-isolation structural bearings, deep raft piles, and active vibration dampeners for packaging equipment.",
      "vibrationGrade": "Achieved through specialized structural civil engineering base isolators."
    },
    "logisticsConnectivity": {
      "airCargo": "Lokpriya Gopinath Bordoloi International Airport (Guwahati - GAU) 65 km away, undergoing cargo terminal expansion for direct semiconductor exports.",
      "railways": "Direct rail siding and Asian Highway 1 (AH1) connectivity."
    },
    "chemicalEcosystem": {
      "proximity": "Proximity to Assam Petrochemicals (Namrup) and Numaligarh Refinery for petrochemical feedstocks."
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
    "vibrationSeismic": {
      "seismicZone": "Zone III.",
      "vibrationGrade": "Not applicable (Chemical reactors and distillation columns are vibration-tolerant)."
    },
    "logisticsConnectivity": {
      "airCargo": "Surat International Airport (130 km) and Vadodara Airport (140 km) with domestic and international air cargo transit.",
      "ports": "Dahej Sea Port with dedicated chemical and gas import berths; Ro-Pax ferry to Saurashtra.",
      "highways": "Direct 6-lane access to Dholera SIR (120 km) and Sanand (160 km) via Vadodara expressway corridor."
    },
    "chemicalEcosystem": {
      "proximity": "World-class fluorine chemistry, sulfur chemistry, chlor-alkali plants, and industrial gas separation units in immediate vicinity."
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
