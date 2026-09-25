import React from 'react';

interface SourcingMapSvgProps {
  importedEquipment: any[];
  indigenousEquipment: any[];
  plantLocation: string;
  blueprintTitle: string;
}

export const SourcingMapSvg: React.FC<SourcingMapSvgProps> = ({
  importedEquipment,
  indigenousEquipment,
  plantLocation,
  blueprintTitle
}) => {
  const impList = (importedEquipment || []).slice(0, 5);
  const indList = (indigenousEquipment || []).slice(0, 5);
  const bpTitle = blueprintTitle.replace(/\s*Venture Blueprint$/i, '');
  const plantLoc = plantLocation || 'Dholera SIR / Sanand, Gujarat';

  return (
    <div className="w-full overflow-x-auto">
      <svg 
        viewBox="0 0 1000 400" 
        className="w-full min-w-[750px] h-auto text-slate-800 dark:text-zinc-200 select-none font-sans"
      >
        <defs>
          <marker id="scint-arrow-imp" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <polygon points="0 0, 8 4, 0 8" fill="#f43f5e" />
          </marker>
          <marker id="scint-arrow-ind" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <polygon points="0 0, 8 4, 0 8" fill="#10b981" />
          </marker>
        </defs>

        {/* Central Domestic Plant Node */}
        <rect 
          x="380" 
          y="110" 
          width="240" 
          height="170" 
          rx="8" 
          fill="#0284c7" 
          fillOpacity="0.2" 
          stroke="#0284c7" 
          strokeWidth="2" 
        />
        <text x="500" y="142" textAnchor="middle" fontSize="13" fontWeight="bold" fill="currentColor">
          DOMESTIC PLANT SITE
        </text>
        <text x="500" y="166" textAnchor="middle" fontSize="11" fontFamily="monospace" fill="#0284c7">
          {plantLoc.slice(0, 26)}
        </text>
        <text x="500" y="196" textAnchor="middle" fontSize="11" fill="currentColor">
          {bpTitle.slice(0, 30)}
        </text>
        <text x="500" y="220" textAnchor="middle" fontSize="11" fontFamily="monospace" fill="#10b981">
          Semiconductor Spec Unit
        </text>
        <text x="500" y="246" textAnchor="middle" fontSize="10.5" fill="#64748b">
          India Localization Facility
        </text>

        {/* Left: Global Imports */}
        {impList.map((m, i) => {
          const country = ((m.countryOfOrigin || m.country || 'Import').split('/')[0].split(',')[0]).trim();
          const maker = (m.topGlobalSuppliers?.[0]?.name || m.recommendedManufacturers?.[0]?.name || m.machineName || 'Foreign Toolmaker').slice(0, 24);
          const rawName = m.machineName || 'Precision Tool';
          const mName = rawName.length > 28 ? rawName.slice(0, 26) + '...' : rawName;
          const y = 20 + i * 72;

          return (
            <g key={`imp-${i}`} transform={`translate(30, ${y})`}>
              <rect 
                width="280" 
                height="58" 
                rx="6" 
                fill="#f43f5e" 
                fillOpacity="0.15" 
                stroke="#f43f5e" 
                strokeWidth="1.5" 
              />
              <text x="14" y="24" fontSize="12" fontWeight="bold" fill="currentColor">
                {country}: {maker}
              </text>
              <text x="14" y="44" fontSize="11" fill="#f43f5e" fontFamily="monospace">
                {mName}
              </text>
              <path 
                d={`M 280 29 L 380 ${135 + i * 24}`} 
                stroke="#f43f5e" 
                strokeWidth="1.5" 
                strokeDasharray="4 3" 
                markerEnd="url(#scint-arrow-imp)" 
              />
            </g>
          );
        })}

        {/* Right: Indigenous Equipment */}
        {indList.map((m, i) => {
          const maker = (m.topIndianSuppliers?.[0]?.name || m.suggestedIndianFabricators?.[0] || m.suppliers?.[0]?.name || 'Indian Engineering OEM').slice(0, 24);
          const rawName = m.machineName || m.equipmentType || 'Fabrication Skid';
          const mName = rawName.length > 28 ? rawName.slice(0, 26) + '...' : rawName;
          const y = 20 + i * 72;

          return (
            <g key={`ind-${i}`} transform={`translate(690, ${y})`}>
              <rect 
                width="280" 
                height="58" 
                rx="6" 
                fill="#10b981" 
                fillOpacity="0.15" 
                stroke="#10b981" 
                strokeWidth="1.5" 
              />
              <text x="14" y="24" fontSize="12" fontWeight="bold" fill="currentColor">
                India: {maker}
              </text>
              <text x="14" y="44" fontSize="11" fill="#10b981" fontFamily="monospace">
                {mName}
              </text>
              <path 
                d={`M 0 29 L -80 ${135 + i * 24}`} 
                stroke="#10b981" 
                strokeWidth="1.5" 
                strokeDasharray="4 3" 
                markerEnd="url(#scint-arrow-ind)" 
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};
