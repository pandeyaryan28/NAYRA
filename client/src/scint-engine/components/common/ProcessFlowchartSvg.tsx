import React from 'react';
import type { ProcessStep } from '../../types/index';

interface ProcessFlowchartSvgProps {
  steps: ProcessStep[];
  blueprintTitle: string;
}

export const ProcessFlowchartSvg: React.FC<ProcessFlowchartSvgProps> = ({ steps, blueprintTitle }) => {
  const shortTitle = blueprintTitle.replace(/\s*Venture Blueprint$/i, '');

  return (
    <div className="w-full overflow-x-auto pb-2">
      <svg 
        viewBox="0 0 1140 370" 
        className="w-full min-w-[950px] h-auto text-slate-800 dark:text-zinc-200 select-none font-sans"
      >
        <defs>
          <marker id="scint-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <polygon points="0 0, 8 4, 0 8" fill="#0284c7" />
          </marker>
          <marker id="scint-arrow-green" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <polygon points="0 0, 8 4, 0 8" fill="#10b981" />
          </marker>
          <marker id="scint-arrow-amber" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <polygon points="0 0, 8 4, 0 8" fill="#f59e0b" />
          </marker>
        </defs>

        {/* Process Steps (1 to 6) */}
        {steps.map((step, idx) => {
          const x = 30 + idx * 180;
          const nameWords = step.stepName.split(' ');
          const nameShort = (nameWords[0] + ' ' + (nameWords[1] || '')).slice(0, 15);
          const machineShort = (step.keyEquipmentRequired || '').slice(0, 18) || 'Precision Tool';
          const outShort = (step.output || '').slice(0, 18) || 'Spec Controlled';
          const isLast = idx === steps.length - 1;

          return (
            <React.Fragment key={step.stepNumber}>
              <g transform={`translate(${x}, 35)`}>
                <rect 
                  width="165" 
                  height="105" 
                  rx="6" 
                  fill="#0284c7" 
                  fillOpacity="0.1" 
                  stroke="#0284c7" 
                  strokeWidth="1.5" 
                />
                <circle cx="22" cy="22" r="12" fill="#0284c7" />
                <text x="22" y="27" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#ffffff">
                  {step.stepNumber}
                </text>
                <text x="96" y="27" textAnchor="middle" fontSize="12" fontWeight="bold" fill="currentColor">
                  {nameShort}
                </text>
                <text x="82" y="52" textAnchor="middle" fontSize="11" fill="#0284c7">
                  {machineShort}
                </text>
                <text x="82" y="72" textAnchor="middle" fontSize="10.5" fontFamily="monospace" fill="currentColor">
                  {outShort}
                </text>
                <text x="82" y="92" textAnchor="middle" fontSize="11" fill="#10b981" fontWeight="bold">
                  Yield: {step.yieldRecoveryRate || '99.5%'}
                </text>
              </g>
              {!isLast && (
                <path 
                  d={`M ${x + 165} 87 L ${x + 180} 87`} 
                  stroke="#0284c7" 
                  strokeWidth="2" 
                  markerEnd="url(#scint-arrow)" 
                />
              )}
            </React.Fragment>
          );
        })}

        {/* ZLD Closed Recycling Loop */}
        <path 
          d="M 1060 140 L 1060 215 L 70 215 L 70 140" 
          stroke="#10b981" 
          strokeWidth="2" 
          strokeDasharray="5 4" 
          fill="none" 
          markerEnd="url(#scint-arrow-green)" 
        />
        <rect 
          x="370" 
          y="200" 
          width="400" 
          height="32" 
          rx="6" 
          fill="#10b981" 
          fillOpacity="0.2" 
          stroke="#10b981" 
          strokeWidth="1.2" 
        />
        <text 
          x="570" 
          y="221" 
          textAnchor="middle" 
          fontSize="12" 
          fontWeight="bold" 
          fill="currentColor"
        >
          Closed-Loop Precision QA & Zero Liquid Discharge (ZLD) Recycling Loop
        </text>

        {/* Downstream Value-Add Link */}
        <path 
          d="M 1060 140 L 1060 295 L 800 295" 
          stroke="#f59e0b" 
          strokeWidth="2" 
          fill="none" 
          markerEnd="url(#scint-arrow-amber)" 
        />

        <g transform="translate(370, 260)">
          <rect 
            width="420" 
            height="74" 
            rx="8" 
            fill="#f59e0b" 
            fillOpacity="0.15" 
            stroke="#f59e0b" 
            strokeWidth="1.5" 
          />
          <text 
            x="210" 
            y="26" 
            textAnchor="middle" 
            fontSize="12" 
            fontWeight="bold" 
            fill="currentColor"
          >
            DOWNSTREAM SEMICONDUCTOR VALUE-ADD
          </text>
          <text 
            x="210" 
            y="47" 
            textAnchor="middle" 
            fontSize="11" 
            fill="#d97706" 
            fontWeight="bold"
          >
            Qualified Feedstock for Domestic Silicon Fabs & OSAT Packaging
          </text>
          <text 
            x="210" 
            y="65" 
            textAnchor="middle" 
            fontSize="10.5" 
            fill="currentColor"
          >
            Tata Dholera Fab • Micron Sanand • CG Semi • Kaynes Semicon
          </text>
        </g>
      </svg>
    </div>
  );
};
