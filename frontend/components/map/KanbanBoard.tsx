"use client";
import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  useDroppable,
  useDraggable,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useIssueStore, useFilteredIssues, Issue, IssueStatus } from '@/lib/store/useIssueStore';
import { ThumbsUp, MapPin, Clock, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';

const COLUMNS: { id: IssueStatus; label: string; color: string; bg: string; icon: any }[] = [
  { id: 'New',         label: 'New',         color: '#F59E0B', bg: 'bg-amber-500',   icon: AlertCircle },
  { id: 'In Progress', label: 'In Progress', color: '#3B82F6', bg: 'bg-blue-500',    icon: Clock },
  { id: 'Resolved',    label: 'Resolved',    color: '#10B981', bg: 'bg-emerald-500', icon: CheckCircle2 },
];

const categoryStyles: Record<string, { pill: string; dot: string }> = {
  Infrastructure: { pill: 'bg-blue-500/10 text-blue-600 border-blue-500/20',   dot: 'bg-blue-500' },
  Sanitation:     { pill: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', dot: 'bg-emerald-500' },
  Safety:         { pill: 'bg-rose-500/10 text-rose-600 border-rose-500/20',   dot: 'bg-rose-500' },
  Greenery:       { pill: 'bg-green-500/10 text-green-600 border-green-500/20', dot: 'bg-green-500' },
};

// ─── Issue Card ──────────────────────────────────────────────────────────────
const IssueCard = ({ issue }: { issue: Issue }) => {
  const { upvoteIssue } = useIssueStore();
  const style = categoryStyles[issue.category] || categoryStyles.Infrastructure;
  const locationStr = [issue.town, issue.city, issue.state].filter(Boolean).join(' › ') || issue.location;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm hover:shadow-md transition-all select-none group">
      {/* Category + Status row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${style.pill}`}>
          {issue.category}
        </span>
        <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${style.dot}`} />
      </div>

      {/* Title */}
      <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1 line-clamp-2 leading-snug">
        {issue.title}
      </h4>

      {/* Description */}
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2 leading-relaxed">
        {issue.description}
      </p>

      {/* Location */}
      <div className="flex items-center gap-1.5 mb-3">
        <MapPin size={10} className="text-blue-500 flex-shrink-0" />
        <span className="text-[10px] text-slate-400 truncate font-medium">{locationStr}</span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-700">
        <span className="text-[9px] text-slate-400 font-medium">
          {new Date(issue.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </span>
        <button
          onPointerDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); upvoteIssue(issue._id); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-500 hover:text-blue-600 transition-all active:scale-90"
        >
          <ThumbsUp size={11} />
          <span className="text-[10px] font-black">{issue.votes}</span>
        </button>
      </div>
    </div>
  );
};

// ─── Draggable Card ──────────────────────────────────────────────────────────
const DraggableCard = ({ issue }: { issue: Issue }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: issue._id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.25 : 1, touchAction: 'none' }}
      {...attributes}
      {...listeners}
      className={isDragging ? 'cursor-grabbing' : 'cursor-grab'}
    >
      <IssueCard issue={issue} />
    </div>
  );
};

// ─── Droppable Column ────────────────────────────────────────────────────────
const DroppableColumn = ({ col, issues, totalIssues }: {
  col: typeof COLUMNS[0];
  issues: Issue[];
  totalIssues: number;
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: col.id });
  const pct = totalIssues > 0 ? Math.round((issues.length / totalIssues) * 100) : 0;
  const ColIcon = col.icon;

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-h-[540px] rounded-3xl border-2 transition-all duration-200 overflow-hidden ${
        isOver
          ? 'border-blue-500 shadow-lg shadow-blue-500/10'
          : 'border-slate-200 dark:border-slate-800'
      }`}
    >
      {/* Column header */}
      <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: col.color + '20' }}>
              <ColIcon size={16} style={{ color: col.color }} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">{col.label}</h3>
              <p className="text-[10px] text-slate-400 font-medium">{issues.length} issue{issues.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <span
            className="text-[10px] font-black px-2.5 py-1 rounded-full text-white"
            style={{ backgroundColor: col.color }}
          >
            {issues.length}
          </span>
        </div>
        {/* Progress bar */}
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: col.color }}
          />
        </div>
        <p className="text-[9px] text-slate-400 mt-1 font-medium">{pct}% of total</p>
      </div>

      {/* Cards */}
      <div
        className={`flex-1 flex flex-col gap-3 p-4 transition-colors ${
          isOver ? 'bg-blue-50/40 dark:bg-blue-900/10' : 'bg-slate-50/50 dark:bg-slate-900/50'
        }`}
      >
        {issues.map(issue => (
          <DraggableCard key={issue._id} issue={issue} />
        ))}

        {/* Drop zone */}
        <div className={`mt-auto flex items-center justify-center rounded-2xl border-2 border-dashed min-h-[56px] transition-all ${
          isOver
            ? 'border-blue-400 bg-blue-50/60 dark:bg-blue-900/30'
            : issues.length === 0
              ? 'border-slate-200 dark:border-slate-700'
              : 'border-transparent'
        }`}>
          {(isOver || issues.length === 0) && (
            <p className={`text-[10px] font-bold ${isOver ? 'text-blue-500' : 'text-slate-400'}`}>
              {isOver ? '↓ Drop here' : 'No issues yet'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Kanban Board ─────────────────────────────────────────────────────────────

const KanbanBoard = () => {
  const { issues, updateStatus, searchQuery } = useIssueStore();
  const filteredIssues = useFilteredIssues();
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const issue = issues.find(i => i._id === String(event.active.id));
    if (issue) setActiveIssue(issue);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveIssue(null);
    if (!over) return;
    const newStatus = String(over.id) as IssueStatus;
    if (!['New', 'In Progress', 'Resolved'].includes(newStatus)) return;
    const issue = issues.find(i => i._id === String(active.id));
    if (!issue || issue.status === newStatus) return;
    updateStatus(String(active.id), newStatus);
  };

  const resolved = issues.filter(i => i.status === 'Resolved').length;
  const resolutionRate = issues.length > 0 ? Math.round((resolved / issues.length) * 100) : 0;

  if (searchQuery && filteredIssues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] rounded-3xl bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800">
        <div className="text-4xl mb-4">🔍</div>
        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No issues found</h3>
        <p className="text-slate-500 text-sm mt-1">Try searching for a different title, city, or category.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Stats banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: issues.length, color: '#6366F1', icon: '📋' },
          { label: 'In Progress', value: issues.filter(i => i.status === 'In Progress').length, color: '#3B82F6', icon: '⚡' },
          { label: 'Resolved', value: resolved, color: '#10B981', icon: '✅' },
          { label: 'Resolution Rate', value: `${resolutionRate}%`, color: '#F59E0B', icon: '📈' },
        ].map(({ label, value, color, icon }) => (
          <div key={label} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: color + '15' }}>
              {icon}
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
              <p className="text-lg font-black text-slate-900 dark:text-white">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {COLUMNS.map(col => (
            <DroppableColumn
              key={col.id}
              col={col}
              issues={filteredIssues.filter(i => i.status === col.id)}
              totalIssues={filteredIssues.length}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={{ duration: 180, easing: 'ease' }}>
          {activeIssue ? (
            <div className="rotate-1 scale-[1.04] shadow-2xl shadow-blue-500/20">
              <IssueCard issue={activeIssue} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Instructions */}
      <p className="text-center text-[11px] text-slate-400 font-medium">
        🖱️ Drag cards between columns to update issue status
      </p>
    </div>
  );
};

export default KanbanBoard;
