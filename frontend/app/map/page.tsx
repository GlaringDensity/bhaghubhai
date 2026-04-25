"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Map as MapIcon, Globe, Layers, Search, Filter } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import MultiLevelMap from '@/components/map/MultiLevelMap';
import KanbanBoard from '@/components/map/KanbanBoard';
import MapMetrics from '@/components/map/MapMetrics';
import { useIssueStore } from '@/lib/store/useIssueStore';

// Dynamic import for Leaflet (SSR incompatible)
const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-medium text-sm">Loading satellite map...</p>
      </div>
    </div>
  ),
});

type ViewMode = 'map' | 'board';
type MapMode = 'svg' | 'leaflet' | 'hybrid';

const MapPage = () => {
  const router = useRouter();
  const userData = useSelector((state: any) => state.user.userData);
  const [view, setView] = useState<ViewMode>('map');
  const [mapMode, setMapMode] = useState<MapMode>('svg');
  const { fetchIssues, searchQuery, setSearchQuery } = useIssueStore();

  useEffect(() => {
    if (!userData) {
      router.push('/Login');
    } else {
      fetchIssues();
    }
  }, [userData, router, fetchIssues]);

  if (!userData) return null;

  return (
    <main className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] pt-28 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">
              Issue Management System
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
              PS-03 Project Polis — India › State › City › Town
            </p>
          </div>

          {/* Main view tabs */}
          <div className="flex items-center bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <button
              onClick={() => setView('map')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                view === 'map'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900'
              }`}
            >
              <MapIcon size={16} /> Map
            </button>
            <button
              onClick={() => setView('board')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                view === 'board'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900'
              }`}
            >
              <LayoutDashboard size={16} /> Kanban
            </button>
          </div>
        </div>

        {/* Metrics */}
        <MapMetrics />

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search issues by title, city, or state..."
              className="w-full h-11 pl-11 pr-10 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium dark:text-white"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <Search size={14} className="rotate-45" /> {/* Close icon using rotated search icon or just an X */}
                <span className="text-lg font-light leading-none">×</span>
              </button>
            )}
          </div>

          {view === 'map' && (
            <div className="flex items-center bg-white dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              {([
                { mode: 'svg', icon: MapIcon, label: 'SVG' },
                { mode: 'leaflet', icon: Globe, label: 'Satellite' },
                { mode: 'hybrid', icon: Layers, label: 'Hybrid' },
              ] as const).map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setMapMode(mode)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    mapMode === mode
                      ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>
          )}

          {view === 'board' && (
            <button className="flex items-center gap-2 px-4 h-11 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">
              <Filter size={16} /> Filter
            </button>
          )}
        </div>

        {/* Main content */}
        <AnimatePresence mode="wait">
          {view === 'board' ? (
            <motion.div
              key="board"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.25 }}
            >
              <KanbanBoard />
            </motion.div>

          ) : mapMode === 'svg' ? (
            <motion.div
              key="svg-map"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <MultiLevelMap />
            </motion.div>

          ) : mapMode === 'leaflet' ? (
            <motion.div
              key="leaflet-map"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <LeafletMap />
            </motion.div>

          ) : (
            // Hybrid: SVG left + Leaflet right, side by side
            <motion.div
              key="hybrid-map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 xl:grid-cols-2 gap-6"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <MapIcon size={13} className="text-blue-500" />
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">SVG Drill-Down</span>
                </div>
                <MultiLevelMap />
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Globe size={13} className="text-emerald-500" />
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Geographic Map</span>
                </div>
                <LeafletMap compact />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
};

export default MapPage;
