"use client";
import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useMapNav, MapLevel } from '@/hooks/useMapState';
import { motion } from 'framer-motion';

interface Crumb {
  label: string;
  level: MapLevel;
}

const Breadcrumb = () => {
  const { level, selectedState, selectedCity, selectedTown, reset, goBack, selectState, currentViewBox } = useMapNav();

  const crumbs: Crumb[] = [{ label: 'India', level: 'india' }];
  if (selectedState) crumbs.push({ label: selectedState, level: 'state' });
  if (selectedCity) crumbs.push({ label: selectedCity, level: 'city' });
  if (selectedTown) crumbs.push({ label: selectedTown, level: 'town' });

  const handleCrumbClick = (crumb: Crumb, idx: number) => {
    if (idx === crumbs.length - 1) return; // Already here
    if (crumb.level === 'india') reset();
    else if (crumb.level === 'state') {
      // Go back to state level (re-select same state without going back to india)
      useMapNav.setState({ level: 'state', selectedCity: null, selectedTown: null });
    }
    else if (crumb.level === 'city') {
      useMapNav.setState({ level: 'city', selectedTown: null });
    }
  };

  if (level === 'india') return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-1 px-4 py-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm text-sm w-fit"
    >
      {crumbs.map((crumb, idx) => (
        <React.Fragment key={crumb.label}>
          <button
            onClick={() => handleCrumbClick(crumb, idx)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all font-medium ${
              idx === crumbs.length - 1
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 cursor-default'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer'
            }`}
          >
            {idx === 0 && <Home size={12} />}
            <span className="text-xs">{crumb.label}</span>
          </button>
          {idx < crumbs.length - 1 && (
            <ChevronRight size={12} className="text-slate-400 flex-shrink-0" />
          )}
        </React.Fragment>
      ))}
    </motion.div>
  );
};

export default Breadcrumb;
