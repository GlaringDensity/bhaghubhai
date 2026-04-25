"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, MapPin, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Issue, useIssueStore } from '@/lib/store/useIssueStore';

interface IssueCardProps {
  issue: Issue;
  isDraggable?: boolean;
}

const categoryStyles: any = {
  Infrastructure: { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  Sanitation: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  Safety: { color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  Greenery: { color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
};

const statusIcons: any = {
  'New': AlertCircle,
  'In Progress': Clock,
  'Resolved': CheckCircle2,
};

const IssueCard: React.FC<IssueCardProps> = ({ issue }) => {
  const { upvoteIssue } = useIssueStore();
  const style = categoryStyles[issue.category];
  const StatusIcon = statusIcons[issue.status];

  return (
    <motion.div
      layoutId={issue._id}
      className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group"
    >
      <div className="flex justify-between items-start mb-3">
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border ${style.bg} ${style.color} ${style.border}`}>
          {issue.category}
        </span>
        <div className="flex items-center gap-1 text-slate-400 group-hover:text-blue-500 transition-colors">
          <StatusIcon size={14} />
          <span className="text-[10px] font-bold uppercase tracking-widest">{issue.status}</span>
        </div>
      </div>

      <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">
        {issue.title}
      </h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">
        {issue.description}
      </p>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
          <MapPin size={12} className="text-blue-500" />
          <span className="text-[10px] font-medium">{issue.location}</span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            upvoteIssue(issue._id);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-600 dark:text-slate-300 hover:text-blue-500 transition-all active:scale-90"
        >
          <ThumbsUp size={12} />
          <span className="text-[10px] font-bold">{issue.votes}</span>
        </button>
      </div>
    </motion.div>
  );
};

export default IssueCard;
