import type { IndiaPolicies } from "../types/index";

export const INDIA_POLICIES: IndiaPolicies = {
  "nationalOverview": {
    "title": "India Semiconductor Mission (ISM) & National Incentive Framework",
    "totalOutlay": "₹76,000 Crore (Semicon 1.0) expanded to ₹1,27,500 Crore (Semicon 2.0)",
    "nodalAgency": "Digital India Corporation / Ministry of Electronics and Information Technology (MeitY)",
    "centralVision": "Positioning India as a premier global hub for semiconductor design, fabrication, and advanced packaging through fiscal support of up to 50% of project cost on a pari-passu basis."
  },
  "centralSchemes": [
    {
      "id": "ism-silicon-fab",
      "name": "Modified Scheme for Setting Up Silicon Semiconductor Fabs in India",
      "fiscalSupport": "50% of Project Cost (Capital Expenditure) on pari-passu basis",
      "targetNodes": "All technology nodes (advanced <28nm, mature 28nm-65nm, and legacy >65nm)",
      "eligibility": "Consortiums or companies with demonstrated technical capability (operating fab for 2+ years) and minimum capital commitment (typically ₹20,000+ Cr).",
      "pariPassuRelease": "Funds disbursed alongside investor equity and debt milestones during construction.",
      "keyApprovedProjects": [
        {
          "company": "Tata Electronics Pvt Ltd (TEPL) in partnership with Powerchip Semiconductor Manufacturing Corp (PSMC, Taiwan)",
          "location": "Dholera SIR, Gujarat",
          "investment": "₹91,526 Crore ($11 Billion)",
          "capacity": "50,000 wafer starts per month (WSPM)",
          "nodes": "28nm, 55nm, 91nm logic, power management, display drivers"
        }
      ]
    },
    {
      "id": "ism-compound-atmp",
      "name": "Modified Scheme for Compound Semiconductors / Silicon Photonics / Sensors Fab & OSAT / ATMP",
      "fiscalSupport": "50% of Capital Expenditure on pari-passu basis",
      "targetNodes": "Silicon Carbide (SiC), Gallium Nitride (GaN), RF devices, MEMS sensors, Silicon Photonics, and Advanced Packaging (Flip-chip, CoWoS, Wire-bond, 2.5D/3D)",
      "eligibility": "Minimum investment of ₹100 Crore for Compound Semi/Sensors and ₹50 Crore for ATMP/OSAT.",
      "keyApprovedProjects": [
        {
          "company": "Micron Technology",
          "location": "Sanand GIDC, Gujarat",
          "investment": "₹22,500+ Crore ($2.75 Billion)",
          "type": "ATMP / Memory Packaging (DRAM & NAND Flash for global markets)"
        },
        {
          "company": "Tata Electronics Pvt Ltd",
          "location": "Morigaon, Assam",
          "investment": "₹27,000 Crore ($3.25 Billion)",
          "type": "Greenfield OSAT / ATMP (Capacity: 48 million chips/day for automotive, mobile, AI)"
        },
        {
          "company": "CG Power & Industrial Solutions (with Renesas Electronics & Stars Micro)",
          "location": "Sanand GIDC, Gujarat",
          "investment": "₹7,600 Crore",
          "type": "OSAT Facility (Capacity: 15 million chips/day, legacy & automotive QFN/BGA)"
        },
        {
          "company": "Kaynes Semicon",
          "location": "Sanand GIDC, Gujarat",
          "investment": "₹3,300 Crore",
          "type": "OSAT / ATMP Facility (Capacity: 6.3 million chips/day)"
        },
        {
          "company": "Crystal Matrix Limited",
          "location": "Dholera SIR, Gujarat",
          "investment": "₹1,800+ Crore",
          "type": "Integrated Compound Semiconductor (GaN foundry) & Mini/Micro-LED ATMP"
        }
      ]
    },
    {
      "id": "specs-scheme",
      "name": "Scheme for Promotion of Manufacturing of Electronic Components and Semiconductors (SPECS)",
      "fiscalSupport": "25% financial incentive on Capital Expenditure for plant, machinery, equipment, and utility infrastructure",
      "targetNodes": "Packaging substrates (ABF/BT), leadframes, bonding wire, EMC molding compounds, silicon wafers, high-purity chemicals, passives (MLCC), and cleanroom systems.",
      "eligibility": "Threshold investments between ₹5 Crore to ₹1,000 Crore depending on component category."
    },
    {
      "id": "dli-scheme",
      "name": "Design Linked Incentive (DLI) Scheme",
      "fiscalSupport": "Up to 50% eligible financial support (capped at ₹15-30 Cr per application) + Deployment linked incentive of 4% to 6% of net sales turnover over 5 years",
      "targetNodes": "Fabless chip design, IP core development, ASICs, SoCs, and system-level design by domestic startups and MSMEs.",
      "eligibility": "Indian domestic companies (>51% resident Indian shareholding)."
    },
    {
      "id": "critical-minerals-mission",
      "name": "National Critical Minerals Mission",
      "fiscalSupport": "Capital grants, royalty concessions, overseas acquisition support (KABIL), and zero-customs duty on 25 critical minerals",
      "targetNodes": "Lithium, Gallium, Germanium, Tantalum, Tungsten, Rare Earth Elements, Quartzite beneficiation, Fluorspar.",
      "impact": "Zero import duty on Gallium, Germanium, Silicon grade quartz; direct support for domestic refining (Hindalco Gallium, GMDC Fluorspar)."
    }
  ],
  "statePolicies": [
    {
      "state": "Gujarat",
      "policyName": "Gujarat Semiconductor Policy (2022–2027)",
      "capexSupport": "Additional 40% of the Capital Assistance provided by Government of India (Effectively 70% total capex subsidy!)",
      "landSubsidy": "75% subsidy on land procurement for first 200 acres in Dholera SIR; 50% subsidy for additional land / Sanand",
      "powerSubsidy": "₹2 per unit electricity tariff subsidy for 10 years; 100% exemption from electricity duty",
      "waterSubsidy": "Potable water at ₹12 per cubic meter for 5 years; guaranteed supply from Narmada canal",
      "stampDuty": "100% reimbursement of stamp duty and registration fees on land purchase/lease",
      "flagshipHubs": [
        "Dholera SIR (Semicon City - Mega Fabs)",
        "Sanand GIDC (OSAT/ATMP Cluster)",
        "Dahej PCPIR (Specialty Chemicals & UP-HF)"
      ]
    },
    {
      "state": "Uttar Pradesh",
      "policyName": "UP Semiconductor Policy (2024)",
      "capexSupport": "50% top-up on capital assistance provided by Central GoI",
      "landSubsidy": "75% rebate on land cost in Yamuna Expressway Industrial Development Authority (YEIDA) / Jewar Airport Corridor",
      "powerSubsidy": "100% electricity duty exemption for 10 years; dual-grid 400kV dedicated feed",
      "waterSubsidy": "Subsidized water rates; dedicated Ganga Water pipeline supply",
      "stampDuty": "100% stamp duty exemption",
      "flagshipHubs": [
        "YEIDA / Jewar Airport Corridor (Greater Noida - Planned Mega Fab & Compound Semi)"
      ]
    },
    {
      "state": "Tamil Nadu",
      "policyName": "Tamil Nadu Semiconductor & Advanced Electronics Policy",
      "capexSupport": "Tailor-made capital subsidy packages covering up to 50% of state portion; structured incentives for tier-1 auto electronics",
      "landSubsidy": "Up to 50% concessional allotment in SIPCOT industrial parks",
      "powerSubsidy": "High-reliability green power corridor with zero transmission surcharge on captive renewables",
      "waterSubsidy": "Dedicated water supply via tertiary treated reverse osmosis (TTRO) plants & desalination",
      "stampDuty": "100% stamp duty waiver",
      "flagshipHubs": [
        "Sriperumbudur / Oragadam (Packaging, Leadframes, Auto SiC)",
        "Hosur (Precision substrates & passives)"
      ]
    },
    {
      "state": "Karnataka",
      "policyName": "Karnataka ESDM & Semiconductor Policy",
      "capexSupport": "20% - 25% capital subsidy on project cost; specialized R&D matching grants up to 50%",
      "landSubsidy": "Concessional land in KIADB industrial areas (Mysuru, Bengaluru Aerospace Park, Hubballi)",
      "powerSubsidy": "Power tariff rebate of ₹1.50 per unit for 5 years; dedicated semiconductor feeders",
      "waterSubsidy": "Subsidized industrial water allocation",
      "stampDuty": "100% exemption on stamp duty and conversion fees",
      "flagshipHubs": [
        "Mysuru ESDM Cluster (ATMP & Display)",
        "Bengaluru Whitefield/Electronic City (VLSI Chip Design & R&D)"
      ]
    },
    {
      "state": "Assam",
      "policyName": "Assam Electronics & Semiconductor Incentive Package",
      "capexSupport": "Customized mega-project capex grant matching central outlay for pioneering investments",
      "landSubsidy": "Land provided at nominal lease rates with complete road, power, and civil infrastructure",
      "powerSubsidy": "Dedicated green hydro-electric power allocation with subsidized industrial rates",
      "waterSubsidy": "Abundant perennial water from Brahmaputra basin with specialized industrial treatment",
      "stampDuty": "100% exemption on stamp duty and land conversion charges",
      "flagshipHubs": [
        "Morigaon Semiconductor Park (Tata Electronics ₹27,000 Cr OSAT)"
      ]
    }
  ]
};
