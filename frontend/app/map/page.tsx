"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Map as MapIcon, Search, Filter } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import MultiLevelMap from '@/components/map/MultiLevelMap';
import KanbanBoard from '@/components/map/KanbanBoard';
import MapMetrics from '@/components/map/MapMetrics';
import { useIssueStore } from '@/lib/store/useIssueStore';

const MapPage = () => {
  const router = useRouter();
  const userData = useSelector((state: any) => state.user.userData);
  const [view, setView] = useState<'map' | 'board'>('map');
  const { fetchIssues } = useIssueStore();

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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">
              Issue Management System
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
              Project Polis (PS-03) — India › State › City › Town
            </p>
          </div>

          <div className="flex items-center bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <button
              onClick={() => setView('map')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                view === 'map'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900'
              }`}
            >
              <MapIcon size={16} /> Map View
            </button>
            <button
              onClick={() => setView('board')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                view === 'board'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900'
              }`}
            >
              <LayoutDashboard size={16} /> Board View
            </button>
          </div>
        </div>

        {/* Metrics */}
        <MapMetrics />

        {/* Action bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search issues by title, city, or state..."
              className="w-full h-11 pl-11 pr-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium dark:text-white"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 h-11 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">
              <Filter size={16} /> Filter
            </button>
          </div>
        </div>

        {/* Main content */}
        <AnimatePresence mode="wait">
          {view === 'map' ? (
            <motion.div
              key="map"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
            >
              <MultiLevelMap />
            </motion.div>
          ) : (
            <motion.div
              key="board"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.25 }}
            >
              <KanbanBoard />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
};

export default MapPage;
