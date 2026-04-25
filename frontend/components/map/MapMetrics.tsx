"use client";
import React from 'react';
import { useIssueStore } from '@/lib/store/useIssueStore';
import { motion } from 'framer-motion';
import { LayoutDashboard, CheckCircle2, AlertCircle, ThumbsUp } from 'lucide-react';

const MapMetrics = () => {
  const { issues } = useIssueStore();

  const total = issues.length;
  const resolved = issues.filter(i => i.status === 'Resolved').length;
  const resolvedPercentage = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const categoryCounts = issues.reduce((acc: any, issue) => {
    acc[issue.category] = (acc[issue.category] || 0) + 1;
    return acc;
  }, {});

  const mostCommonCategory = Object.entries(categoryCounts).length > 0 
    ? Object.entries(categoryCounts).sort((a: any, b: any) => b[1] - a[1])[0][0]
    : 'None';

  const highestVotedIssue = [...issues].sort((a, b) => b.votes - a.votes)[0];

  const stats = [
    { label: 'Total Issues', value: total, icon: LayoutDashboard, color: 'text-blue-500' },
    { label: 'Resolved', value: `${resolvedPercentage}%`, icon: CheckCircle2, color: 'text-emerald-500' },
    { label: 'Top Category', value: mostCommonCategory, icon: AlertCircle, color: 'text-amber-500' },
    { label: 'Top Voted', value: highestVotedIssue?.votes || 0, icon: ThumbsUp, color: 'text-rose-500' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl bg-slate-50 dark:bg-slate-900 ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">{stat.value}</h4>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default MapMetrics;
