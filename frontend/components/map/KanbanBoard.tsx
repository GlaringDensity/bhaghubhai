"use client";
import React from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useIssueStore, Issue, IssueStatus } from '@/lib/store/useIssueStore';
import IssueCard from './IssueCard';
import { motion } from 'framer-motion';

const columns: IssueStatus[] = ['New', 'In Progress', 'Resolved'];

const SortableIssue = ({ issue }: { issue: Issue }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: issue._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
      <IssueCard issue={issue} />
    </div>
  );
};

const KanbanColumn = ({ status, issues }: { status: IssueStatus; issues: Issue[] }) => {
  return (
    <div className="flex flex-col gap-4 bg-slate-50/50 dark:bg-slate-900/50 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 min-h-[500px]">
      <div className="flex items-center justify-between mb-2 px-2">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            status === 'New' ? 'bg-amber-500' : status === 'In Progress' ? 'bg-blue-500' : 'bg-emerald-500'
          }`} />
          {status}
        </h3>
        <span className="text-[10px] font-bold bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
          {issues.length}
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {issues.map((issue) => (
          <SortableIssue key={issue._id} issue={issue} />
        ))}
      </div>
    </div>
  );
};

const KanbanBoard = () => {
  const { issues, updateStatus } = useIssueStore();
  const [activeIssue, setActiveIssue] = React.useState<Issue | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const issue = issues.find((i) => i._id === active.id);
    if (issue) setActiveIssue(issue);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveIssue(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Logic to determine if dropped on a different column
    // Since we are using simplified columns for this demo, 
    // we'll check if the overId is one of our column names or belongs to an issue in that column
    
    const overStatus = columns.find(c => c === overId) as IssueStatus;
    
    if (overStatus) {
       const issue = issues.find(i => i._id === activeId);
       if (issue && issue.status !== overStatus) {
         updateStatus(activeId, overStatus);
       }
    } else {
      // If dropped over another issue, get that issue's status
      const targetIssue = issues.find(i => i._id === overId);
      if (targetIssue) {
        const issue = issues.find(i => i._id === activeId);
        if (issue && issue.status !== targetIssue.status) {
          updateStatus(activeId, targetIssue.status);
        }
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((status) => (
          <SortableContext
            key={status}
            id={status}
            items={issues.filter(i => i.status === status).map(i => i._id)}
            strategy={verticalListSortingStrategy}
          >
            <KanbanColumn
              status={status}
              issues={issues.filter(i => i.status === status)}
            />
          </SortableContext>
        ))}
      </div>

      <DragOverlay>
        {activeIssue ? <IssueCard issue={activeIssue} /> : null}
      </DragOverlay>
    </DndContext>
  );
};

export default KanbanBoard;
