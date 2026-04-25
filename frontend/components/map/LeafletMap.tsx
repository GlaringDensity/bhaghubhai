"use client";
import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, LayersControl, useMap } from 'react-leaflet';
import { useIssueStore, useFilteredIssues, Issue } from '@/lib/store/useIssueStore';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// ── Category → flag icon mapping ──────────────────────────────────────────────
const CATEGORY_FLAGS: Record<string, string> = {
  Infrastructure: "/yellowflag.png",
  Sanitation:     "/greenflag.png",
  Safety:         "/redflag.png",
  Greenery:       "/greenflag.png",
};

const CATEGORY_LABEL: Record<string, string> = {
  Infrastructure: '🚧 Infrastructure',
  Sanitation:     '♻️ Sanitation',
  Safety:         '🚨 Safety',
  Greenery:       '🌿 Greenery',
};

const categoryConfig: Record<string, { emoji: string; color: string }> = {
  Infrastructure: { emoji: '🏗️', color: '#3B82F6' },
  Sanitation:     { emoji: '♻️', color: '#10B981' },
  Safety:         { emoji: '🚨', color: '#F43F5E' },
  Greenery:       { emoji: '🌿', color: '#22C55E' },
};

// ── Geocoding via Nominatim ───────────────────────────────────────────────────
const geocodeCache = new Map<string, { lat: number; lng: number }>();

async function geocode(query: string): Promise<{ lat: number; lng: number } | null> {
  if (!query?.trim()) return null;
  const key = query.toLowerCase().trim();
  if (geocodeCache.has(key)) return geocodeCache.get(key)!;

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ', India')}&format=json&limit=1`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    const data = await res.json();
    if (data.length > 0) {
      const result = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      geocodeCache.set(key, result);
      return result;
    }
  } catch {
    // silently fail
  }
  return null;
}

// ── Make flag icon from category ──────────────────────────────────────────────
function makeCategoryFlagIcon(category: string) {
  if (typeof window === 'undefined') return null;
  const L = require('leaflet');
  const src = CATEGORY_FLAGS[category] || CATEGORY_FLAGS['Safety'];
  return L.icon({
    iconUrl:    src,
    iconSize:   [30, 40],
    iconAnchor: [15, 40],
    popupAnchor:[0, -40],
  });
}

// ── Cluster icon ──────────────────────────────────────────────────────────────
function makeClusterIcon(cluster: any) {
  if (typeof window === 'undefined') return null;
  const L = require('leaflet');
  const count = cluster.getChildCount();
  let bg = '#3B82F6';
  let scale = 1;
  if (count > 20) { bg = '#7F1D1D'; scale = 1.5; }
  else if (count > 10) { bg = '#DC2626'; scale = 1.3; }
  else if (count > 5)  { bg = '#F59E0B'; scale = 1.15; }
  const size = Math.round(44 * scale);
  return L.divIcon({
    html: `<div style="
      background:${bg}; border-radius:50%;
      width:${size}px; height:${size}px;
      display:flex; align-items:center; justify-content:center;
      color:white; font-weight:900; font-size:${Math.round(14 * scale)}px;
      border:3px solid white; box-shadow:0 4px 12px rgba(0,0,0,0.35);
    ">${count}</div>`,
    className: 'custom-cluster',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// ── Auto-fit bounds ───────────────────────────────────────────────────────────
const FitBounds = ({ positions }: { positions: [number, number][] }) => {
  const map = useMap();
  const fitted = useRef(false);
  useEffect(() => {
    if (fitted.current || positions.length === 0) return;
    const L = require('leaflet');
    if (positions.length === 1) {
      map.setView(positions[0], 12, { animate: true });
    } else {
      map.fitBounds(L.latLngBounds(positions), { padding: [80, 80], maxZoom: 14, animate: true });
    }
    fitted.current = true;
  }, [positions, map]);
  return null;
};

// ── MarkerCluster with flag icons + geocoding ─────────────────────────────────
const MarkerCluster = ({ issues }: { issues: Issue[] }) => {
  const map = useMap();
  const groupRef = useRef<any>(null);
  const [geoIssues, setGeoIssues] = useState<Issue[]>([]);

  // Geocode issues that are missing latlng
  useEffect(() => {
    let cancelled = false;
    const resolve = async () => {
      const resolved: Issue[] = [];
      for (const issue of issues) {
        if (issue.latlng?.lat && issue.latlng?.lng) {
          resolved.push(issue);
        } else {
          // Build query from available location fields
          const parts = [issue.town, issue.city, issue.state, issue.location].filter(Boolean);
          const query = parts.join(', ');
          const coords = await geocode(query);
          if (coords) {
            resolved.push({ ...issue, latlng: coords });
          }
        }
      }
      if (!cancelled) setGeoIssues(resolved);
    };
    resolve();
    return () => { cancelled = true; };
  }, [issues]);

  useEffect(() => {
    if (typeof window === 'undefined' || geoIssues.length === 0) return;
    require('leaflet.markercluster');
    const L = require('leaflet');

    if (groupRef.current) map.removeLayer(groupRef.current);

    const cluster = (L as any).markerClusterGroup({
      iconCreateFunction: makeClusterIcon,
      maxClusterRadius: 60,
      disableClusteringAtZoom: 14,
      spiderfyOnMaxZoom: true,
    });

    geoIssues.forEach(issue => {
      if (!issue.latlng?.lat || !issue.latlng?.lng) return;
      const icon = makeCategoryFlagIcon(issue.category);
      if (!icon) return;

      const marker = L.marker([issue.latlng.lat, issue.latlng.lng], { icon });
      const { emoji, color } = categoryConfig[issue.category] || { emoji: '📍', color: '#6366f1' };
      const statusColor = { New: '#EF4444', 'In Progress': '#F59E0B', Resolved: '#10B981' }[issue.status] || '#6B7280';
      const flagImg = CATEGORY_FLAGS[issue.category] || CATEGORY_FLAGS['Safety'];
      const loc = [issue.town, issue.city, issue.state].filter(Boolean).join(' › ') || issue.location;

      marker.bindPopup(`
        <div style="font-family:system-ui,sans-serif;min-width:210px;max-width:270px;">
          <div style="display:flex;align-items:center;gap:8px;padding-bottom:8px;border-bottom:1px solid #E2E8F0;margin-bottom:8px;">
            <img src="${flagImg}" style="width:24px;height:32px;object-fit:contain;" />
            <div>
              <div style="font-weight:800;font-size:13px;color:#0F172A;line-height:1.2;">${issue.title}</div>
              <div style="font-size:10px;color:#64748B;margin-top:2px;">📍 ${loc}</div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px;">
            <div style="background:#F8FAFC;border-radius:8px;padding:6px;text-align:center;">
              <div style="font-size:9px;color:#64748B;font-weight:600;text-transform:uppercase;">Category</div>
              <div style="font-size:12px;font-weight:800;color:${color};margin-top:2px;">${emoji} ${issue.category}</div>
            </div>
            <div style="background:#F8FAFC;border-radius:8px;padding:6px;text-align:center;">
              <div style="font-size:9px;color:#64748B;font-weight:600;text-transform:uppercase;">Status</div>
              <div style="font-size:12px;font-weight:800;color:${statusColor};margin-top:2px;">${issue.status}</div>
            </div>
          </div>
          <div style="font-size:11px;color:#475569;line-height:1.5;margin-bottom:8px;">
            ${issue.description ? issue.description.slice(0, 100) + (issue.description.length > 100 ? '…' : '') : 'No description.'}
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;padding-top:6px;border-top:1px solid #E2E8F0;">
            <span style="font-size:11px;font-weight:700;color:#3B82F6;">👍 ${issue.votes} votes</span>
            <span style="font-size:9px;font-weight:700;padding:3px 8px;border-radius:999px;background:${statusColor}22;color:${statusColor};">${issue.status}</span>
          </div>
        </div>
      `, { maxWidth: 290, className: 'issue-popup' });

      cluster.addLayer(marker);
    });

    map.addLayer(cluster);
    groupRef.current = cluster;

    return () => { if (groupRef.current) map.removeLayer(groupRef.current); };
  }, [map, geoIssues]);

  return null;
};
// ── Auto-zoom to single result ────────────────────────────────────────────────
const AutoZoom = ({ issues }: { issues: Issue[] }) => {
  const map = useMap();
  useEffect(() => {
    if (issues.length === 1 && issues[0].latlng?.lat) {
      map.setView([issues[0].latlng.lat, issues[0].latlng.lng], 16, { animate: true });
    }
  }, [issues, map]);
  return null;
};

// ── Tile layers ───────────────────────────────────────────────────────────────
const tileLayers = [
  { key: 'voyager',   name: '🌍 Voyager',   url: 'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',          attr: '&copy; CARTO', checked: true },
  { key: 'dark',      name: '🌙 Dark',       url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',                  attr: '&copy; CARTO' },
  { key: 'light',     name: '☀️ Light',      url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',                 attr: '&copy; CARTO' },
  { key: 'satellite', name: '🛰️ Satellite',  url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attr: '&copy; Esri' },
  { key: 'osm',       name: '🗺️ Standard',   url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',                            attr: '&copy; OpenStreetMap' },
];

// ── Main component ────────────────────────────────────────────────────────────
const LeafletMap = ({ compact = false }: { compact?: boolean }) => {
  const { issues, searchQuery } = useIssueStore();
  const filteredIssues = useFilteredIssues();
  
  const issuesWithAnyLoc = filteredIssues.filter(i =>
    i.latlng?.lat || i.town || i.city || i.state || i.location
  );

  // For FitBounds — use only pre-resolved latlng (geocoded ones appear after async)
  const hardPositions: [number, number][] = filteredIssues
    .filter(i => i.latlng?.lat && i.latlng?.lng)
    .map(i => [i.latlng!.lat, i.latlng!.lng]);

  const categoryCounts = Object.keys(CATEGORY_LABEL).map(c => ({
    category: c,
    count: filteredIssues.filter(i => i.category === c).length,
    flag: CATEGORY_FLAGS[c],
    label: CATEGORY_LABEL[c],
  }));

  const height = compact ? '420px' : '600px';

  return (
    <div
      className="relative w-full rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-2xl bg-white dark:bg-slate-900"
      style={{ height }}
    >
      {/* Empty state / No results */}
      {issuesWithAnyLoc.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-[500] bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
          <div className="text-center p-8">
            <div className="text-5xl mb-4">{searchQuery ? '🔍' : '🌍'}</div>
            <p className="text-slate-700 dark:text-slate-300 font-bold text-base">
              {searchQuery ? 'No matching issues' : 'No issues to map yet'}
            </p>
            <p className="text-slate-500 text-sm mt-1 max-w-xs">
              {searchQuery ? 'Try a different search term or clear the filter.' : 'Create issues via the drill-down map to see flags appear here'}
            </p>
          </div>
        </div>
      )}

      <MapContainer center={[20.5937, 78.9629]} zoom={5} scrollWheelZoom zoomControl style={{ width: '100%', height: '100%' }}>
        <LayersControl position="topright" collapsed>
          {tileLayers.map(layer => (
            <LayersControl.BaseLayer key={layer.key} name={layer.name} checked={!!layer.checked}>
              <TileLayer url={layer.url} attribution={layer.attr} />
            </LayersControl.BaseLayer>
          ))}
        </LayersControl>

        {hardPositions.length > 0 && !searchQuery && <FitBounds positions={hardPositions} />}
        <AutoZoom issues={filteredIssues} />
        {issuesWithAnyLoc.length > 0 && <MarkerCluster issues={issuesWithAnyLoc} />}
      </MapContainer>

      {/* Flag legend */}
      <div className="absolute bottom-6 left-6 z-[400] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-2xl min-w-[160px]">
        <p className="font-black text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
          Categories
        </p>
        <div className="space-y-2.5">
          {categoryCounts.map(({ category, count, flag, label }) => (
            <div key={category} className="flex items-center justify-between gap-3 group">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center p-1 group-hover:scale-110 transition-transform">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={flag} alt={category} className="w-full h-full object-contain" />
                </div>
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{label.split(' ')[1]}</span>
              </div>
              {count > 0 && (
                <span className="text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  {count}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Live count pill */}
      <div className="absolute top-4 right-14 z-[400]">
        <div className="flex items-center gap-2 px-3 py-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
          <span className="text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">
            {issuesWithAnyLoc.length} Issue{issuesWithAnyLoc.length !== 1 ? 's' : ''} on map
          </span>
        </div>
      </div>
    </div>
  );
};

export default LeafletMap;
