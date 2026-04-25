"use client";
import React, { useState, useMemo, useRef, useCallback } from 'react';
import India from '@svg-maps/india';
import { useIssueStore } from '@/lib/store/useIssueStore';
import { motion, AnimatePresence } from 'framer-motion';

interface MapViewProps {
  onStateClick: (stateName: string) => void;
}

const categoryColors: Record<string, string> = {
  Infrastructure: "#3B82F6",
  Sanitation: "#10B981",
  Safety: "#F43F5E",
  Greenery: "#22C55E",
};

// State centroids for marker positioning — stored as % of viewBox
const stateCentroids: Record<string, { cx: number; cy: number }> = {
  "Andaman and Nicobar Islands": { cx: 765, cy: 600 },
  "Andhra Pradesh": { cx: 560, cy: 510 },
  "Arunachal Pradesh": { cx: 840, cy: 160 },
  "Assam": { cx: 800, cy: 220 },
  "Bihar": { cx: 590, cy: 260 },
  "Chandigarh": { cx: 445, cy: 140 },
  "Chhattisgarh": { cx: 570, cy: 380 },
  "Dadra and Nagar Haveli": { cx: 360, cy: 390 },
  "Daman and Diu": { cx: 350, cy: 380 },
  "Delhi": { cx: 455, cy: 195 },
  "Goa": { cx: 390, cy: 510 },
  "Gujarat": { cx: 345, cy: 330 },
  "Haryana": { cx: 445, cy: 185 },
  "Himachal Pradesh": { cx: 460, cy: 135 },
  "Jammu and Kashmir": { cx: 430, cy: 80 },
  "Jharkhand": { cx: 620, cy: 315 },
  "Karnataka": { cx: 460, cy: 530 },
  "Kerala": { cx: 455, cy: 620 },
  "Lakshadweep": { cx: 375, cy: 650 },
  "Madhya Pradesh": { cx: 510, cy: 340 },
  "Maharashtra": { cx: 455, cy: 430 },
  "Manipur": { cx: 840, cy: 270 },
  "Meghalaya": { cx: 790, cy: 250 },
  "Mizoram": { cx: 830, cy: 310 },
  "Nagaland": { cx: 855, cy: 230 },
  "Odisha": { cx: 620, cy: 390 },
  "Puducherry": { cx: 530, cy: 580 },
  "Punjab": { cx: 425, cy: 150 },
  "Rajasthan": { cx: 395, cy: 255 },
  "Sikkim": { cx: 705, cy: 215 },
  "Tamil Nadu": { cx: 500, cy: 600 },
  "Telangana": { cx: 535, cy: 460 },
  "Tripura": { cx: 808, cy: 295 },
  "Uttar Pradesh": { cx: 530, cy: 230 },
  "Uttarakhand": { cx: 490, cy: 165 },
  "West Bengal": { cx: 670, cy: 310 },
};

const MapView: React.FC<MapViewProps> = ({ onStateClick }) => {
  const { issues } = useIssueStore();
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const markers = useMemo(() => {
    const grouped: Record<string, typeof issues> = {};
    issues.forEach(issue => {
      if (!grouped[issue.location]) grouped[issue.location] = [];
      grouped[issue.location].push(issue);
    });
    return grouped;
  }, [issues]);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGPathElement>, name: string) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    setTooltip({
      text: name,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top - 10,
    });
    setHoveredState(name);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
    setHoveredState(null);
  }, []);

  return (
    <div className="relative w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden group">
      <svg
        ref={svgRef}
        viewBox={India.viewBox}
        className="w-full h-auto"
        aria-label="India map"
        style={{ display: 'block', maxHeight: '680px' }}
      >
        {(India as any).locations.map((location: any) => (
          <path
            key={location.id}
            id={location.id}
            d={location.path}
            name={location.name}
            onClick={() => onStateClick(location.name)}
            onMouseMove={(e) => handleMouseMove(e, location.name)}
            onMouseLeave={handleMouseLeave}
            className={`cursor-pointer transition-all duration-200 stroke-white dark:stroke-slate-900 ${
              hoveredState === location.name
                ? 'fill-blue-500 dark:fill-blue-500 stroke-[1.5]'
                : 'fill-slate-200 dark:fill-slate-700 stroke-[0.5]'
            }`}
          />
        ))}

        {/* Issue Markers */}
        {Object.entries(markers).map(([stateName, stateIssues]) => {
          const centroid = stateCentroids[stateName];
          if (!centroid) return null;
          const topIssue = stateIssues[0];
          return (
            <g key={stateName}>
              {/* Pulse ring */}
              <circle
                cx={centroid.cx}
                cy={centroid.cy}
                r={10}
                fill={categoryColors[topIssue.category]}
                fillOpacity={0.2}
                className="animate-ping"
              />
              {/* Main dot */}
              <circle
                cx={centroid.cx}
                cy={centroid.cy}
                r={5}
                fill={categoryColors[topIssue.category]}
                stroke="white"
                strokeWidth={1.5}
              />
              {/* Count badge (if multiple issues) */}
              {stateIssues.length > 1 && (
                <>
                  <circle cx={centroid.cx + 7} cy={centroid.cy - 7} r={6} fill="#0F172A" />
                  <text
                    x={centroid.cx + 7}
                    y={centroid.cy - 7}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="white"
                    fontSize="5"
                    fontWeight="bold"
                  >
                    {stateIssues.length}
                  </text>
                </>
              )}
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute pointer-events-none z-20"
            style={{ left: tooltip.x, top: tooltip.y, transform: 'translate(-50%, -100%)' }}
          >
            <div className="px-3 py-1.5 bg-slate-900/90 backdrop-blur-md text-white text-xs font-bold rounded-full shadow-xl border border-white/10 whitespace-nowrap">
              {tooltip.text}
              {markers[tooltip.text] && (
                <span className="ml-2 text-blue-300">({markers[tooltip.text].length} issue{markers[tooltip.text].length > 1 ? 's' : ''})</span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Legend */}
      <div className="absolute bottom-6 left-6 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl">
        <h5 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Category Legend</h5>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {Object.entries(categoryColors).map(([cat, color]) => (
            <div key={cat} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full shadow-sm flex-shrink-0" style={{ backgroundColor: color }} />
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{cat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions badge */}
      <div className="absolute top-4 right-4 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Click a state to report</span>
      </div>
    </div>
  );
};

export default MapView;
