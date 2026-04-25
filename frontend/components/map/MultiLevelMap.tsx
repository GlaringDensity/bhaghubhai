"use client";
import React, { useRef, useEffect, useCallback, useState } from 'react';
import India from '@svg-maps/india';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MapPin, ZoomIn } from 'lucide-react';
import { useMapNav } from '@/hooks/useMapState';
import { useIssueStore, useFilteredIssues } from '@/lib/store/useIssueStore';
import { stateCities } from '@/lib/data/stateCities';
import { cityTowns } from '@/lib/data/cityTowns';
import Breadcrumb from './Breadcrumb';
import Pin from './Pin';
import IssueModal from './IssueModal';

// Geographic bounds of India for lat/lng → SVG coord mapping
const GEO = { minLat: 8, maxLat: 37.5, minLng: 68, maxLng: 97.5 };

const categoryColors: Record<string, string> = {
  Infrastructure: "#3B82F6",
  Sanitation: "#10B981",
  Safety: "#F43F5E",
  Greenery: "#22C55E",
};

// Convert lat/lng to @svg-maps/india viewBox coordinates
function geoToSvg(lat: number, lng: number, vbWidth: number, vbHeight: number) {
  const x = ((lng - GEO.minLng) / (GEO.maxLng - GEO.minLng)) * vbWidth;
  const y = ((GEO.maxLat - lat) / (GEO.maxLat - GEO.minLat)) * vbHeight;
  return { x, y };
}

// Parse viewBox string
function parseVB(vb: string) {
  const [x, y, w, h] = vb.split(' ').map(Number);
  return { x, y, w, h };
}

// Smooth viewBox interpolation
function lerpViewBox(from: string, to: string, t: number) {
  const f = parseVB(from), g = parseVB(to);
  const ease = 1 - Math.pow(1 - t, 3);
  return `${f.x + (g.x - f.x) * ease} ${f.y + (g.y - f.y) * ease} ${f.w + (g.w - f.w) * ease} ${f.h + (g.h - f.h) * ease}`;
}


// ─── Town Plane ───────────────────────────────────────────────────────────────
const TownPlane: React.FC<{
  state: string; city: string; town: string;
  onPlacePin: (x: number, y: number) => void;
}> = ({ state, city, town, onPlacePin }) => {
  const filteredIssues = useFilteredIssues();
  const svgRef = useRef<SVGSVGElement>(null);

  const pins = filteredIssues.filter(
    i => i.state === state && i.city === city && i.town === town && i.pinX != null
  );
// ... (rest of TownPlane remains same)

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const vb = parseVB('0 0 1000 700');
    const x = ((e.clientX - rect.left) / rect.width) * vb.w;
    const y = ((e.clientY - rect.top) / rect.height) * vb.h;
    onPlacePin(x, y);
  };

  return (
    <motion.div
      key="town"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="w-full h-[600px] rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-2xl bg-white dark:bg-slate-900 relative"
    >
      <div className="absolute top-4 left-4 z-10 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Click anywhere to pin an issue</span>
      </div>
      <svg
        ref={svgRef}
        viewBox="0 0 1000 700"
        className="w-full h-full cursor-crosshair"
        onClick={handleClick}
      >
        {/* Grid background */}
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-slate-200 dark:text-slate-700" />
          </pattern>
          <pattern id="gridBig" width="200" height="200" patternUnits="userSpaceOnUse">
            <rect width="200" height="200" fill="url(#grid)" />
            <path d="M 200 0 L 0 0 0 200" fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-300 dark:text-slate-600" />
          </pattern>
        </defs>
        <rect width="1000" height="700" fill="url(#gridBig)" />

        {/* Zone label */}
        <text x="500" y="350" textAnchor="middle" dominantBaseline="middle"
          className="fill-slate-200 dark:fill-slate-700" fontSize="60" fontWeight="900" letterSpacing="4">
          {town.toUpperCase()}
        </text>

        {/* Existing pins */}
        {pins.map((issue: any) => (
          <Pin 
            key={issue._id} 
            x={issue.pinX} 
            y={issue.pinY} 
            category={issue.category} 
            status={issue.status}
            title={issue.title} 
          />
        ))}
      </svg>
    </motion.div>
  );
};

// ─── City View (SVG Grid Zone System) ────────────────────────────────────────
const ZONE_W = 210;
const ZONE_H = 78;
const ZONE_GAP_X = 14;
const ZONE_GAP_Y = 14;
const GRID_COLS = 4;
const PAD = 48;
const HEADER_H = 72;

function heatColor(count: number): string {
  if (count >= 5) return '#DC2626'; // red
  if (count >= 3) return '#D97706'; // amber
  if (count >= 1) return '#2563EB'; // blue
  return '#94A3B8'; // grey
}
function zoneBg(count: number, hovered: boolean): string {
  if (hovered) return '#2563EB';
  if (count >= 5) return '#FEF2F2';
  if (count >= 3) return '#FFFBEB';
  if (count >= 1) return '#EFF6FF';
  return '#F8FAFC';
}
function zoneBorder(count: number, hovered: boolean): string {
  if (hovered) return '#2563EB';
  if (count >= 5) return '#FECACA';
  if (count >= 3) return '#FDE68A';
  if (count >= 1) return '#BFDBFE';
  return '#E2E8F0';
}
function zoneText(count: number, hovered: boolean): string {
  return hovered ? '#FFFFFF' : '#1E293B';
}

const CityView: React.FC<{
  state: string; city: string;
  onTownClick: (town: string) => void;
}> = ({ state, city, onTownClick }) => {
  const towns = cityTowns[city] || ['Zone A', 'Zone B', 'Zone C', 'Zone D', 'Zone E', 'Zone F'];
  const filteredIssues = useFilteredIssues();
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  const cols = Math.min(GRID_COLS, towns.length);
  const rows = Math.ceil(towns.length / cols);
  const viewW = PAD * 2 + cols * ZONE_W + (cols - 1) * ZONE_GAP_X;
  const viewH = PAD + HEADER_H + rows * ZONE_H + (rows - 1) * ZONE_GAP_Y + PAD;

  return (
    <motion.div
      key="city"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.3 }}
      className="w-full rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl bg-white dark:bg-slate-900 overflow-hidden"
    >
      <svg
        viewBox={`0 0 ${viewW} ${viewH}`}
        className="w-full"
        style={{ display: 'block' }}
        aria-label={`${city} zone map`}
      >
        <defs>
          <filter id="zone-shadow">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.08" />
          </filter>
        </defs>

        {/* Header */}
        <text
          x={viewW / 2} y={PAD + 8}
          textAnchor="middle" dominantBaseline="hanging"
          fontSize="20" fontWeight="900" fill="#0F172A"
        >
          {city}
        </text>
        <text
          x={viewW / 2} y={PAD + 36}
          textAnchor="middle" dominantBaseline="hanging"
          fontSize="11" fill="#64748B"
        >
          {towns.length} localities · select to place an issue pin
        </text>

        {/* Heat legend */}
        {[['#2563EB','1+ issues'], ['#D97706','3+ issues'], ['#DC2626','5+ issues']].map(([col, label], li) => (
          <g key={label} transform={`translate(${PAD + li * 130}, ${PAD + 52})`}>
            <rect width={10} height={10} rx={3} fill={col} />
            <text x={15} y={5} dominantBaseline="middle" fontSize="9" fill="#64748B">{label}</text>
          </g>
        ))}

        {/* Zone grid */}
        {towns.map((town, idx) => {
          const col = idx % cols;
          const row = Math.floor(idx / cols);
          const x = PAD + col * (ZONE_W + ZONE_GAP_X);
          const y = PAD + HEADER_H + row * (ZONE_H + ZONE_GAP_Y);
          const count = filteredIssues.filter(i => i.state === state && i.city === city && i.town === town).length;
          const isHov = hoveredZone === town;
          const bg = zoneBg(count, isHov);
          const border = zoneBorder(count, isHov);
          const heat = heatColor(count);
          const label = town.length > 17 ? town.slice(0, 15) + '…' : town;

          return (
            <g
              key={town}
              style={{ cursor: 'pointer' }}
              onClick={() => onTownClick(town)}
              onMouseEnter={() => setHoveredZone(town)}
              onMouseLeave={() => setHoveredZone(null)}
            >
              {/* Card */}
              <rect
                x={x} y={y}
                width={ZONE_W} height={ZONE_H}
                rx={14} ry={14}
                fill={bg}
                stroke={border}
                strokeWidth={isHov ? 1.5 : 1}
                filter="url(#zone-shadow)"
                style={{ transition: 'fill 0.15s, stroke 0.15s' }}
              />
              {/* Left accent stripe */}
              <rect
                x={x + 1} y={y + 12}
                width={4} height={ZONE_H - 24}
                rx={2}
                fill={isHov ? '#93C5FD' : heat}
                style={{ transition: 'fill 0.15s' }}
              />
              {/* Zone name */}
              <text
                x={x + ZONE_W / 2 + 4}
                y={y + (count > 0 ? ZONE_H / 2 - 9 : ZONE_H / 2)}
                textAnchor="middle" dominantBaseline="middle"
                fontSize="11.5" fontWeight="700"
                fill={zoneText(count, isHov)}
                style={{ transition: 'fill 0.15s', pointerEvents: 'none', userSelect: 'none' }}
              >
                {label}
              </text>
              {/* Sub-label */}
              {count > 0 ? (
                <>
                  <rect
                    x={x + ZONE_W / 2 - 28} y={y + ZONE_H / 2 + 2}
                    width={56} height={16} rx={8}
                    fill={isHov ? 'rgba(255,255,255,0.2)' : heat} fillOpacity={isHov ? 1 : 0.12}
                  />
                  <text
                    x={x + ZONE_W / 2 + 4} y={y + ZONE_H / 2 + 10}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize="9" fontWeight="800"
                    fill={isHov ? '#FFFFFF' : heat}
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {count} issue{count !== 1 ? 's' : ''}
                  </text>
                </>
              ) : (
                <text
                  x={x + ZONE_W / 2 + 4} y={y + ZONE_H / 2 + 10}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize="9" fill={isHov ? 'rgba(255,255,255,0.6)' : '#94A3B8'}
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  No reports
                </text>
              )}
              {/* Arrow */}
              <text
                x={x + ZONE_W - 18} y={y + ZONE_H / 2}
                textAnchor="middle" dominantBaseline="middle"
                fontSize="13"
                fill={isHov ? '#FFFFFF' : '#CBD5E1'}
                style={{ transition: 'fill 0.15s', pointerEvents: 'none', userSelect: 'none' }}
              >
                ›
              </text>
            </g>
          );
        })}
      </svg>
    </motion.div>
  );
};


// ─── State View (zoomed India SVG + city circles) ─────────────────────────────
const StateView: React.FC<{
  stateName: string;
  viewBox: string;
  vbWidth: number;
  vbHeight: number;
  onCityClick: (city: string) => void;
}> = ({ stateName, viewBox, vbWidth, vbHeight, onCityClick }) => {
  const cities = stateCities[stateName] || [];
  const filteredIssues = useFilteredIssues();

  return (
    <>
      {cities.map((city, idx) => {
        const svgPos = geoToSvg(city.lat, city.lng, vbWidth, vbHeight);
        const issueCount = filteredIssues.filter(i => i.state === stateName && i.city === city.name).length;
        const vb = parseVB(viewBox);
        // Only render if within zoomed viewBox
        if (svgPos.x < vb.x - 20 || svgPos.x > vb.x + vb.w + 20) return null;
        if (svgPos.y < vb.y - 20 || svgPos.y > vb.y + vb.h + 20) return null;

        return (
          <motion.g
            key={city.name}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: idx * 0.05 }}
            style={{ cursor: 'pointer' }}
            onClick={() => onCityClick(city.name)}
          >
            <circle
              cx={svgPos.x} cy={svgPos.y} r={5}
              fill="#2563EB" stroke="white" strokeWidth={1.5}
              className="hover:fill-blue-400 transition-colors"
            />
            {issueCount > 0 && (
              <circle cx={svgPos.x + 6} cy={svgPos.y - 6} r={4} fill="#F43F5E" />
            )}
            <text x={svgPos.x} y={svgPos.y + 14} textAnchor="middle"
              fontSize="8" fontWeight="700" fill="#F1F5F9" stroke="#0F172A" strokeWidth="2" paintOrder="stroke">
              {city.name}
            </text>
            <title>{city.name} — click to explore</title>
          </motion.g>
        );
      })}
    </>
  );
};

// ─── Main MultiLevelMap ───────────────────────────────────────────────────────
const MultiLevelMap: React.FC = () => {
  const nav = useMapNav();
  const { searchQuery } = useIssueStore();
  const filteredIssues = useFilteredIssues();
  const svgRef = useRef<SVGSVGElement>(null);
  const animRef = useRef<number>();
  const [displayVB, setDisplayVB] = useState(India.viewBox);
  const [vbDims, setVbDims] = useState({ w: 1000, h: 1000 });
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingPin, setPendingPin] = useState<{ x: number; y: number } | null>(null);

  // Parse India viewBox once
  useEffect(() => {
    const { x, y, w, h } = parseVB(India.viewBox);
    setVbDims({ w, h });
    setDisplayVB(India.viewBox);
    nav.setDefaultViewBox(India.viewBox);
  }, []);

  const animateToViewBox = useCallback((target: string) => {
    const from = displayVB;
    const start = performance.now();
    const DURATION = 600;
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const step = (now: number) => {
      const t = Math.min((now - start) / DURATION, 1);
      setDisplayVB(lerpViewBox(from, target, t));
      if (t < 1) animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
  }, [displayVB]);

  const handleStateClick = useCallback((e: React.MouseEvent<SVGPathElement>, stateName: string) => {
    const path = e.currentTarget;
    const bbox = path.getBBox();
    const pad = Math.max(bbox.width, bbox.height) * 0.15;
    const zoomedVB = `${bbox.x - pad} ${bbox.y - pad} ${bbox.width + pad * 2} ${bbox.height + pad * 2}`;
    animateToViewBox(zoomedVB);
    nav.selectState(stateName, zoomedVB);
  }, [animateToViewBox, nav]);

  const handleBack = () => {
    if (nav.level === 'state') animateToViewBox(nav.defaultViewBox);
    nav.goBack();
  };

  const handlePlacePin = (x: number, y: number) => {
    setPendingPin({ x, y });
    setModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Navigation bar */}
      <div className="flex items-center gap-3">
        {nav.level !== 'india' && (
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-blue-500 hover:border-blue-500 transition-all shadow-sm"
          >
            <ArrowLeft size={16} />
            Back
          </motion.button>
        )}
        <Breadcrumb />
        {nav.level === 'india' && (
          <div className="ml-auto flex items-center gap-2 text-xs text-slate-400 font-medium">
            <ZoomIn size={14} />
            Click a state to drill down
          </div>
        )}
      </div>

      {/* Map area */}
      <AnimatePresence mode="wait">
        {(nav.level === 'india' || nav.level === 'state') && (
          <motion.div
            key="india-svg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
          >
            <svg
              ref={svgRef}
              viewBox={displayVB}
              className="w-full"
              style={{ display: 'block', maxHeight: '680px' }}
              aria-label="India map"
            >
              {/* India state paths */}
              {(India as any).locations.map((loc: any) => (
                <path
                  key={loc.id}
                  id={loc.id}
                  d={loc.path}
                  name={loc.name}
                  onClick={(e) => {
                    if (nav.level === 'india') handleStateClick(e, loc.name);
                  }}
                  onMouseMove={(e) => {
                    if (!svgRef.current) return;
                    const rect = svgRef.current.getBoundingClientRect();
                    setTooltip({ text: loc.name, x: e.clientX - rect.left, y: e.clientY - rect.top - 10 });
                    setHoveredState(loc.name);
                  }}
                  onMouseLeave={() => { setTooltip(null); setHoveredState(null); }}
                  className={`transition-colors duration-200 stroke-white dark:stroke-slate-900 ${
                    hoveredState === loc.name && nav.level === 'india'
                      ? 'fill-blue-500 stroke-[1.5] cursor-pointer'
                      : nav.level === 'state' && nav.selectedState === loc.name
                        ? 'fill-blue-400 stroke-[1.5]'
                        : 'fill-slate-200 dark:fill-slate-700 stroke-[0.5]'
                  } ${nav.level === 'india' ? 'cursor-pointer' : 'cursor-default'}`}
                />
              ))}

              {/* City markers when zoomed into a state */}
              {nav.level === 'state' && nav.selectedState && (
                <StateView
                  stateName={nav.selectedState}
                  viewBox={displayVB}
                  vbWidth={vbDims.w}
                  vbHeight={vbDims.h}
                  onCityClick={(city) => nav.selectCity(city)}
                />
              )}
            </svg>

            {/* Tooltip */}
            <AnimatePresence>
              {tooltip && nav.level === 'india' && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute pointer-events-none z-20"
                  style={{ left: tooltip.x, top: tooltip.y, transform: 'translate(-50%, -100%)' }}
                >
                  <div className="px-3 py-1.5 bg-slate-900/90 text-white text-xs font-bold rounded-full shadow-xl border border-white/10 whitespace-nowrap">
                    {tooltip.text}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Legend */}
            <div className="absolute bottom-5 left-5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Legend</h5>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                {Object.entries(categoryColors).map(([cat, color]) => (
                  <div key={cat} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{cat}</span>
                  </div>
                ))}
              </div>
            </div>

            {nav.level === 'state' && (
              <div className="absolute top-5 right-5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Click a city to explore</span>
              </div>
            )}
          </motion.div>
        )}

        {nav.level === 'city' && nav.selectedState && nav.selectedCity && (
          <CityView
            key="city-view"
            state={nav.selectedState}
            city={nav.selectedCity}
            onTownClick={(town) => nav.selectTown(town)}
          />
        )}

        {nav.level === 'town' && nav.selectedState && nav.selectedCity && nav.selectedTown && (
          <TownPlane
            key="town-view"
            state={nav.selectedState}
            city={nav.selectedCity}
            town={nav.selectedTown}
            onPlacePin={handlePlacePin}
          />
        )}
      </AnimatePresence>

      {/* Issue modal */}
      <IssueModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setPendingPin(null); }}
        selectedState={nav.selectedState}
        selectedCity={nav.selectedCity}
        selectedTown={nav.selectedTown}
        pinCoords={pendingPin}
      />
    </div>
  );
};

export default MultiLevelMap;
