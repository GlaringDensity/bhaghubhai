"use client";
import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, LayersControl, useMap } from 'react-leaflet';
import { useIssueStore, Issue } from '@/lib/store/useIssueStore';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// ── Helpers ──────────────────────────────────────────────────────────────────
function adjustBrightness(color: string, percent: number) {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

const categoryConfig: Record<string, { emoji: string; color: string }> = {
  Infrastructure: { emoji: '🏗️', color: '#3B82F6' },
  Sanitation:    { emoji: '♻️', color: '#10B981' },
  Safety:        { emoji: '🚨', color: '#F43F5E' },
  Greenery:      { emoji: '🌿', color: '#22C55E' },
};

const statusColors: Record<string, string> = {
  'New':         '#F59E0B',
  'In Progress': '#3B82F6',
  'Resolved':    '#10B981',
};

function makeCategoryIcon(category: string) {
  if (typeof window === 'undefined') return null;
  const L = require('leaflet');
  const { emoji, color } = categoryConfig[category] || { emoji: '📍', color: '#6366f1' };
  const darker = adjustBrightness(color, -20);
  return L.divIcon({
    html: `<div style="
      background: linear-gradient(135deg, ${color} 0%, ${darker} 100%);
      border-radius: 50%;
      width: 42px; height: 42px;
      display: flex; align-items: center; justify-content: center;
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      font-size: 20px;
      cursor: pointer;
    ">${emoji}</div>`,
    className: 'issue-marker',
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -24],
  });
}

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
  const darker = adjustBrightness(bg, -20);
  return L.divIcon({
    html: `<div style="
      background: linear-gradient(135deg, ${bg} 0%, ${darker} 100%);
      border-radius: 50%;
      width: ${size}px; height: ${size}px;
      display: flex; align-items: center; justify-content: center;
      color: white; font-weight: 900; font-size: ${Math.round(14 * scale)}px;
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    ">${count}</div>`,
    className: 'custom-cluster',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// ── Auto-fit bounds ──────────────────────────────────────────────────────────
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

// ── MarkerCluster using vanilla Leaflet ──────────────────────────────────────
const MarkerCluster = ({ issues }: { issues: Issue[] }) => {
  const map = useMap();
  const groupRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    require('leaflet.markercluster');
    const L = require('leaflet');

    if (groupRef.current) {
      map.removeLayer(groupRef.current);
    }

    const cluster = (L as any).markerClusterGroup({
      iconCreateFunction: makeClusterIcon,
      maxClusterRadius: 60,
      disableClusteringAtZoom: 14,
      spiderfyOnMaxZoom: true,
    });

    issues.forEach(issue => {
      if (!issue.latlng?.lat || !issue.latlng?.lng) return;

      const icon = makeCategoryIcon(issue.category);
      if (!icon) return;

      const marker = L.marker([issue.latlng.lat, issue.latlng.lng], { icon });

      const { emoji, color } = categoryConfig[issue.category] || { emoji: '📍', color: '#6366f1' };
      const statusColor = statusColors[issue.status] || '#6B7280';
      const locationStr = [issue.town, issue.city, issue.state].filter(Boolean).join(' › ') || issue.location;

      marker.bindPopup(`
        <div style="font-family: system-ui, sans-serif; min-width: 200px; max-width: 260px;">
          <div style="display:flex; align-items:center; gap:8px; padding-bottom:8px; border-bottom:1px solid #E2E8F0; margin-bottom:8px;">
            <span style="font-size:22px;">${emoji}</span>
            <div>
              <div style="font-weight:800; font-size:13px; color:#0F172A; line-height:1.2;">${issue.title}</div>
              <div style="font-size:10px; color:#64748B; margin-top:2px;">${locationStr}</div>
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:8px;">
            <div style="background:#F8FAFC; border-radius:8px; padding:6px; text-align:center;">
              <div style="font-size:9px; color:#64748B; font-weight:600; text-transform:uppercase; letter-spacing:0.05em;">Category</div>
              <div style="font-size:11px; font-weight:800; color:${color}; margin-top:2px;">${issue.category}</div>
            </div>
            <div style="background:#F8FAFC; border-radius:8px; padding:6px; text-align:center;">
              <div style="font-size:9px; color:#64748B; font-weight:600; text-transform:uppercase; letter-spacing:0.05em;">Status</div>
              <div style="font-size:11px; font-weight:800; color:${statusColor}; margin-top:2px;">${issue.status}</div>
            </div>
          </div>

          <div style="font-size:11px; color:#475569; line-height:1.5; margin-bottom:8px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
            ${issue.description || 'No description provided.'}
          </div>

          <div style="display:flex; align-items:center; justify-content:space-between; padding-top:6px; border-top:1px solid #E2E8F0;">
            <div style="display:flex; align-items:center; gap:4px;">
              <span style="font-size:12px;">👍</span>
              <span style="font-size:11px; font-weight:700; color:#3B82F6;">${issue.votes} votes</span>
            </div>
            <span style="font-size:9px; font-weight:700; padding:3px 8px; border-radius:999px; background:${statusColor}20; color:${statusColor};">${issue.status}</span>
          </div>
        </div>
      `, { maxWidth: 280, className: 'issue-popup' });

      cluster.addLayer(marker);
    });

    map.addLayer(cluster);
    groupRef.current = cluster;

    return () => {
      if (groupRef.current) map.removeLayer(groupRef.current);
    };
  }, [map, issues]);

  return null;
};

// ── Tile layers config ────────────────────────────────────────────────────────
const tileLayers = [
  { key: 'voyager',   name: '🌍 Voyager',   url: 'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',          attr: '&copy; CARTO', checked: true },
  { key: 'dark',      name: '🌙 Dark',       url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',                  attr: '&copy; CARTO' },
  { key: 'light',     name: '☀️ Light',      url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',                 attr: '&copy; CARTO' },
  { key: 'satellite', name: '🛰️ Satellite',  url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attr: '&copy; Esri' },
  { key: 'osm',       name: '🗺️ Standard',   url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',                            attr: '&copy; OpenStreetMap' },
  { key: 'terrain',   name: '⛰️ Terrain',    url: 'https://tile.opentopomap.org/{z}/{x}/{y}.png',                                  attr: '&copy; OpenTopoMap' },
];

// ── Main Component ────────────────────────────────────────────────────────────
const LeafletMap = ({ compact = false }: { compact?: boolean }) => {
  const { issues } = useIssueStore();
  const issuesWithGeo = issues.filter(i => i.latlng?.lat && i.latlng?.lng);
  const positions: [number, number][] = issuesWithGeo.map(i => [i.latlng!.lat, i.latlng!.lng]);

  const categoryCounts = Object.keys(categoryConfig).map(cat => ({
    cat,
    count: issues.filter(i => i.category === cat).length,
    ...categoryConfig[cat],
  }));

  const height = compact ? '420px' : '600px';

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-2xl bg-white dark:bg-slate-900" style={{ height }}>

      {/* Empty state */}
      {issuesWithGeo.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-[500] bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
          <div className="text-center p-8">
            <div className="text-5xl mb-4">🌍</div>
            <p className="text-slate-700 dark:text-slate-300 font-bold text-base">No geo-tagged issues yet</p>
            <p className="text-slate-500 text-sm mt-1 max-w-xs">Create issues via the SVG drill-down map to see them pinned here</p>
          </div>
        </div>
      )}

      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        scrollWheelZoom
        zoomControl
        style={{ width: '100%', height: '100%' }}
      >
        <LayersControl position="topright" collapsed>
          {tileLayers.map(layer => (
            <LayersControl.BaseLayer key={layer.key} name={layer.name} checked={!!layer.checked}>
              <TileLayer url={layer.url} attribution={layer.attr} />
            </LayersControl.BaseLayer>
          ))}
        </LayersControl>

        {positions.length > 0 && <FitBounds positions={positions} />}
        {issuesWithGeo.length > 0 && <MarkerCluster issues={issuesWithGeo} />}
      </MapContainer>

      {/* Legend */}
      {issuesWithGeo.length > 0 && (
        <div className="absolute bottom-5 left-5 z-[400] bg-white/97 dark:bg-slate-800/97 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 shadow-2xl max-w-[200px]">
          <p className="font-black text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Categories</p>
          <div className="space-y-1.5">
            {categoryCounts.map(({ cat, count, emoji, color }) => (
              <div key={cat} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{emoji}</span>
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">{cat}</span>
                </div>
                {count > 0 && (
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full text-white" style={{ background: color }}>
                    {count}
                  </span>
                )}
              </div>
            ))}
          </div>
          <p className="text-[9px] text-slate-400 border-t border-slate-100 dark:border-slate-700 mt-2 pt-2 text-center">
            🔴 Cluster = multiple issues
          </p>
        </div>
      )}

      {/* Stats pill */}
      <div className="absolute top-4 left-4 z-[400]">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {issuesWithGeo.length} geo-tagged issue{issuesWithGeo.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LeafletMap;
